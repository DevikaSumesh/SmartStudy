import os
import json
import time
from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from config import get_settings

settings = get_settings()

class SyllabusService:
    def __init__(self):
        # We use 2.5-flash for fast, free, and highly accurate structured data extraction
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2, # Slightly bumped up to allow for creative breakdown of topics, but low enough to stay strict
            max_retries=3
        )

    async def parse_syllabus(self, file: UploadFile, user_id: str) -> list:
        # Create a safe temporary file
        temp_filename = f"syllabus_temp_{user_id}_{int(time.time())}.pdf"
        temp_path = os.path.join(settings.UPLOAD_DIR, temp_filename)
        
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        try:
            # Save the uploaded file to disk temporarily
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)

            # Extract text using PyPDFLoader
            loader = PyPDFLoader(temp_path)
            documents = loader.load()
            full_text = "\n".join([doc.page_content for doc in documents])

            # THE FIX: A highly engineered prompt to force specific sub-topics and realistic times
            prompt_template = """
            You are an expert academic planner. Read the following university syllabus and break it down into highly specific, actionable study tasks.
            
            Do NOT just output generic "Module 1", "Module 2" tasks. You must read the sub-topics inside each module and create specific tasks for them. 
            For example, instead of one massive 300-minute "Module 1" task, break it down into smaller, focused tasks like:
            - "Module 1: Intro to Graph Theory & Terminology" (60 mins)
            - "Module 1: BFS and DFS Algorithms" (90 mins)
            - "Module 1: Dijkstra's Shortest Path" (120 mins)
            
            Return the output strictly as a JSON array of objects. Do NOT use markdown blocks (like ```json). Just the raw JSON array.
            Each object MUST have these exact keys:
            - "title": A highly specific string combining the module number and the specific topics to study (e.g., "Module 2: Memory Management & Paging").
            - "subject": A short string guessing the overall subject name based on the syllabus.
            - "duration_minutes": An integer estimating study time based on the complexity of THESE specific topics. Vary this based on difficulty (e.g., 45, 60, 90, or 120 minutes). DO NOT use massive blocks like 300 minutes.

            SYLLABUS TEXT:
            {text}
            """
            
            PROMPT = PromptTemplate(template=prompt_template, input_variables=["text"])
            
            # Prevent token overflow by limiting text size
            response = self.llm.invoke(PROMPT.format(text=full_text[:25000]))
            
            # Clean the output
            content = response.content.strip()
            if content.startswith("```json"):
                content = content.replace("```json", "", 1).rsplit("```", 1)[0].strip()
            elif content.startswith("```"):
                content = content.replace("```", "", 1).rsplit("```", 1)[0].strip()

            tasks_data = json.loads(content)
            return tasks_data

        except Exception as e:
            print(f"Syllabus Parsing Error: {str(e)}")
            raise e
            
        finally:
            # Always clean up the temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

syllabus_service = SyllabusService()