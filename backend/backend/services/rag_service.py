import os
import json
import shutil
import time
from typing import List, Dict
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from config import get_settings

settings = get_settings()

class RAGService:
    def __init__(self):
        self.chat_model_name = "gemini-2.5-flash"
        self.embedding_model_name = "models/gemini-embedding-001" 
        
        self.index_base_path = getattr(settings, "FAISS_INDEX_PATH", "faiss_indexes")
        self.user_stores: Dict[str, FAISS] = {}
        
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=self.embedding_model_name,
            google_api_key=settings.GEMINI_API_KEY,
            max_retries=3
        )
            
        self.llm = ChatGoogleGenerativeAI(
            model=self.chat_model_name,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
            max_retries=3
        )

        os.makedirs(self.index_base_path, exist_ok=True)

    def _get_user_path(self, user_id: str) -> str:
        return os.path.join(self.index_base_path, f"user_{user_id}")

    def _load_user_index(self, user_id: str):
        path = self._get_user_path(user_id)
        if os.path.exists(path):
            try:
                self.user_stores[user_id] = FAISS.load_local(
                    path, 
                    self.embeddings, 
                    allow_dangerous_deserialization=True
                )
            except Exception as e:
                print(f"Error loading index for {user_id}: {e}")

    async def process_document(self, user_id: str = None, filename: str = None, content: bytes = None, **kwargs) -> int:
        user_id = user_id or kwargs.get("user_id")
        filename = filename or kwargs.get("filename") or f"upload_{int(time.time())}.pdf"
        
        if not user_id:
            raise ValueError("user_id is required to process the document.")
        
        file_path = kwargs.get("file_path")
        if file_path and not content:
            with open(file_path, "rb") as f:
                content = f.read()

        if not content:
            raise ValueError("No content was provided to process.")

        temp_path = f"temp_{user_id}_{filename}"
        
        mode = "wb" if isinstance(content, bytes) else "w"
        with open(temp_path, mode) as f:
            f.write(content)

        try:
            loader = PyPDFLoader(temp_path)
            documents = loader.load()
            
            for doc in documents:
                doc.metadata["user_id"] = user_id
                doc.metadata["filename"] = filename

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            chunks = text_splitter.split_documents(documents)

            print(f"Processing {len(chunks)} chunks from {filename}...")

            if user_id not in self.user_stores:
                self._load_user_index(user_id)

            if user_id not in self.user_stores:
                self.user_stores[user_id] = FAISS.from_documents(chunks, self.embeddings)
            else:
                self.user_stores[user_id].add_documents(chunks)

            self.user_stores[user_id].save_local(self._get_user_path(user_id))
            return len(chunks)

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    async def get_response(self, user_id: str = None, query: str = None, **kwargs):
        user_id = user_id or kwargs.get("user_id")
        query = query or kwargs.get("query")
        
        if user_id not in self.user_stores:
            self._load_user_index(user_id)

        if user_id not in self.user_stores:
            return "No documents found. Please upload study materials.", []

        # THE FIX: Switched back to clean Markdown links so the frontend can render them beautifully.
        prompt_template = """Use the following pieces of context to answer the question at the end. 
        If you don't know the answer, just say that you don't know, don't try to make up an answer.

        After your answer, you MUST append a section titled "\n\n📚 Related Study Recommendations:". 
        Suggest 2-3 specific related concepts. For each concept, provide strict Markdown links formatted EXACTLY like this:
        - **Concept Name**: [Watch on YouTube](https://www.youtube.com/results?search_query=your+search+term) | [Search on Google](https://www.google.com/search?q=your+search+term)
        
        Do not use HTML tags. Ensure you replace spaces with '+' in the URLs.

        {context}

        Question: {question}
        Helpful Answer:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.user_stores[user_id].as_retriever(search_kwargs={"k": 3}),
            return_source_documents=True,
            chain_type_kwargs={"prompt": PROMPT}
        )
        
        try:
            result = qa_chain.invoke({"query": query})
            answer = result.get("result", "I don't know.")
            sources = list(set([doc.metadata.get("source", "Unknown") for doc in result.get("source_documents", [])]))
            
            return answer, sources
            
        except Exception as e:
            error_str = str(e)
            print(f"Chat Error: {error_str}")
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                return "I'm currently taking a quick 60-second cooldown to respect Google's Free Tier API limits! Please ask me again in a minute.", []
            return f"Error connecting to AI: {error_str}", []

    def generate_flashcards(self, user_id: str) -> List[dict]:
        if user_id not in self.user_stores: 
            self._load_user_index(user_id)
            
        if user_id not in self.user_stores: 
            return []

        retriever = self.user_stores[user_id].as_retriever(search_kwargs={"k": 4})
        docs = retriever.invoke("Key definitions, concepts, and formulas")
        context = "\n".join([d.page_content for d in docs])

        prompt = f"""Generate 8 flashcards (front/back) as raw JSON array of objects with 'front' and 'back' keys from this text:

        {context[:1500]}
        """
        
        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()
            
            if content.startswith("```json"):
                content = content.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif content.startswith("```"):
                content = content.replace("```", "", 1).rsplit("```", 1)[0].strip()
                
            return json.loads(content)
        except Exception as e:
            error_str = str(e)
            print(f"JSON Parse Error: {error_str}")
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                return [{"front": "API Rate Limit Reached ⏱️", "back": "Google's Free Tier needs a 60-second cooldown. Please wait a moment and try generating flashcards again!"}]
            return [{"front": "Error", "back": "Could not generate flashcards due to an internal error."}]

    def recommend_resources(self, user_id: str) -> List[dict]:
        if user_id not in self.user_stores: 
            self._load_user_index(user_id)
            
        if user_id not in self.user_stores: 
            return []

        retriever = self.user_stores[user_id].as_retriever(search_kwargs={"k": 3})
        docs = retriever.invoke("Core topics and technical terms")
        context_text = "\n\n".join([d.page_content for d in docs])

        prompt = f"""
        Identify 3 key complex topics from the text. 
        For each topic, provide:
        1. A YouTube search query.
        2. A Google Article search query.
        
        Format strictly as a JSON list with keys: 'topic', 'youtube_query', 'article_query'.
        Do not include markdown code blocks.
        
        TEXT:
        {context_text[:1500]}
        """
        
        try:
            response = self.llm.invoke(prompt)
            content = response.content.strip()
            
            if content.startswith("```json"):
                content = content.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif content.startswith("```"):
                content = content.replace("```", "", 1).rsplit("```", 1)[0].strip()
                
            topics = json.loads(content)
            
            for t in topics:
                t['youtube_link'] = f"https://www.youtube.com/results?search_query={t['youtube_query'].replace(' ', '+')}"
                t['article_link'] = f"https://www.google.com/search?q={t['article_query'].replace(' ', '+')}"
            return topics
        except Exception as e:
            error_str = str(e)
            print(f"Resource Error: {error_str}")
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                 return [{"topic": "API Rate Limit Reached", "youtube_query": "Take a 60 second break", "article_query": "Take a 60 second break", "youtube_link": "#", "article_link": "#"}]
            return []

    def clear_memory(self, user_id: str):
        try:
            if user_id in self.user_stores:
                del self.user_stores[user_id]
            path = self._get_user_path(user_id)
            if os.path.exists(path):
                shutil.rmtree(path, ignore_errors=True) 
        except Exception as e:
            print(f"Warning: Could not clear memory files: {e}")

rag_service = RAGService()