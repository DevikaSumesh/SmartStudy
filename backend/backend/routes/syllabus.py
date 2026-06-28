from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from services.syllabus_service import syllabus_service
import traceback

router = APIRouter()

# Note: Replace this dummy dependency with your actual auth dependency if you have one
async def get_current_user_id():
    # If you use JWTs, decode it here. For now, returning a generic ID to make it work.
    return "current_user"

@router.post("/parse")
async def parse_uploaded_syllabus(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for syllabus parsing.")

    try:
        # Call the service to get the JSON array of tasks
        extracted_tasks = await syllabus_service.parse_syllabus(file, user_id)
        return {"status": "success", "extracted_tasks": extracted_tasks}
    
    except Exception as e:
        print(f"Route Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to parse syllabus: {str(e)}")