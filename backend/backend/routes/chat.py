from fastapi import APIRouter, HTTPException, status, UploadFile, File, Request
from typing import List
from datetime import datetime
from bson import ObjectId
from models.chat import ChatMessageCreate, ChatMessageResponse, DocumentResponse, ChatRequest, ChatResponse
from utils.auth import get_user_id_from_request
from database import get_collection
from services.rag_service import RAGService
import os

router = APIRouter()
rag_service = RAGService()

@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...)
):
    """Upload a document for RAG"""
    try:
        user_id = get_user_id_from_request(request)
    except HTTPException as e:
        print(f"[v0] Auth error in upload: {e.detail}")
        raise
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".pdf", ".txt", ".doc", ".docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF, TXT, DOC, DOCX allowed."
        )
    
    print(f"[v0] Uploading file for user {user_id}: {file.filename}")
    
    try:
        content = await file.read()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
        
        chunk_count = await rag_service.process_document(
            user_id=user_id,
            filename=file.filename,
            content=content
        )
        
        print(f"[v0] File processed into {chunk_count} chunks")
        
        documents_collection = get_collection("documents")
        doc_metadata = {
            "user_id": ObjectId(user_id),
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content),
            "chunk_count": chunk_count,
            "uploaded_at": datetime.utcnow()
        }
        
        result = await documents_collection.insert_one(doc_metadata)
        
        return {
            "filename": file.filename,
            "chunks": chunk_count,
            "uploaded_at": doc_metadata["uploaded_at"].isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[v0] Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload document: {str(e)}"
        )

@router.get("/documents", response_model=List[DocumentResponse])
async def get_documents(request: Request):
    """Get uploaded documents"""
    try:
        user_id = get_user_id_from_request(request)
    except HTTPException as e:
        print(f"[v0] Auth error in get_documents: {e.detail}")
        raise
    
    documents_collection = get_collection("documents")
    
    cursor = documents_collection.find({"user_id": ObjectId(user_id)}).sort("uploaded_at", -1)
    documents = await cursor.to_list(length=100)
    
    # FIX: We no longer convert _id and user_id to strings here so PyObjectId can validate them!
    print(f"[v0] Retrieved {len(documents)} documents for user {user_id}")
    return documents

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: Request,
    chat_request: ChatRequest = None
):
    """Send a message to RAG chatbot"""
    try:
        user_id = get_user_id_from_request(request)
    except HTTPException as e:
        print(f"[v0] Auth error in send_message: {e.detail}")
        raise
    
    chat_collection = get_collection("chat_messages")
    
    if chat_request is None:
        try:
            body = await request.json()
            question = body.get("question")
            if not question:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="'question' field is required"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid request body: {str(e)}"
            )
    else:
        question = chat_request.question
    
    print(f"[v0] Processing message for user {user_id}: {question}")
    
    try:
        response, context_docs = await rag_service.get_response(
            user_id=user_id,
            query=question
        )
    except Exception as e:
        print(f"[v0] RAG service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )
    
    message_doc = {
        "user_id": ObjectId(user_id),
        "message": question,
        "role": "user",
        "response": response,
        "context_used": context_docs,
        "created_at": datetime.utcnow()
    }
    
    result = await chat_collection.insert_one(message_doc)
    print(f"[v0] Message saved with ID: {str(result.inserted_id)}")
    
    return {
        "answer": response,
        "sources": context_docs
    }

@router.get("/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    request: Request,
    limit: int = 50
):
    """Get chat history"""
    try:
        user_id = get_user_id_from_request(request)
    except HTTPException as e:
        print(f"[v0] Auth error in get_chat_history: {e.detail}")
        raise
    
    chat_collection = get_collection("chat_messages")
    
    cursor = chat_collection.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(limit)
    messages = await cursor.to_list(length=limit)
    
    # FIX: We no longer convert _id and user_id to strings here so PyObjectId can validate them!
    print(f"[v0] Retrieved {len(messages)} messages for user {user_id}")
    return messages

@router.delete("/documents/{doc_id}")
async def delete_document(request: Request, doc_id: str):
    """Delete a document"""
    try:
        user_id = get_user_id_from_request(request)
    except HTTPException as e:
        print(f"[v0] Auth error in delete_document: {e.detail}")
        raise
    
    documents_collection = get_collection("documents")
    
    try:
        result = await documents_collection.delete_one({
            "_id": ObjectId(doc_id),
            "user_id": ObjectId(user_id)
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        rag_service.clear_memory(user_id)
        return {"success": True, "message": "Document deleted"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

@router.post("/clear")
async def clear_chat_history(request: Request):
    """Clear chat history for user"""
    try:
        user_id = get_user_id_from_request(request)
    except HTTPException as e:
        print(f"[v0] Auth error in clear_chat_history: {e.detail}")
        raise
    
    chat_collection = get_collection("chat_messages")
    
    try:
        result = await chat_collection.delete_many({"user_id": ObjectId(user_id)})
        return {
            "success": True,
            "message": f"Cleared {result.deleted_count} messages"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )

@router.post("/flashcards")
async def generate_flashcards(request: Request):
    """Generate flashcards from user's uploaded documents"""
    try:
        user_id = get_user_id_from_request(request)
    except HTTPException as e:
        print(f"[v0] Auth error in generate_flashcards: {e.detail}")
        raise
        
    try:
        flashcards = rag_service.generate_flashcards(user_id=user_id)
        return flashcards
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate flashcards: {str(e)}"
        )