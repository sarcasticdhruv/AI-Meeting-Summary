from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Optional
import tempfile
import os
from datetime import datetime

from services.llm_service import LLMService
# from services.whisper_service import WhisperService
from models.schemas import UploadResponse, TextUploadRequest
from db.database import save_meeting

router = APIRouter()
llm_service = LLMService()
# whisper_service = WhisperService()

@router.post("/transcript", response_model=UploadResponse)
async def upload_transcript(request: TextUploadRequest):
    """Upload and process text transcript"""
    try:
        print(f"🔍 Received upload request with content length: {len(request.content)}")
        
        # Process with LLM
        analysis = await llm_service.analyze_transcript(request.content)
        print(f"🔍 LLM Analysis result: {type(analysis)}")
        print(f"🔍 Action items type: {type(analysis.get('action_items', []))}")
        print(f"🔍 Objections type: {type(analysis.get('objections', []))}")
        
        # Ensure the data types are correct
        action_items = analysis.get("action_items", [])
        objections = analysis.get("objections", [])
        
        # Make sure they are lists
        if not isinstance(action_items, list):
            action_items = []
        if not isinstance(objections, list):
            objections = []
            
        print(f"🔍 Final action_items: {action_items}")
        print(f"🔍 Final objections: {objections}")
        
        # Save to database
        meeting_id = await save_meeting({
            "title": analysis.get("title", "Meeting Summary"),
            "transcript": request.content,
            "summary": analysis.get("summary", ""),
            "action_items": action_items,
            "objections": objections,
            "crm_notes": analysis.get("crm_notes", "")
            # Remove created_at - PostgreSQL handles this automatically
        })
        
        print(f"✅ Meeting saved with ID: {meeting_id}")
        
        return UploadResponse(
            id=meeting_id,
            status="processed",
            summary=analysis.get("summary", ""),
            action_items=action_items,
            objections=objections,
            crm_notes=analysis.get("crm_notes", "")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/audio", response_model=UploadResponse)
# async def upload_audio(file: UploadFile = File(...)):
#     """Upload and process audio file"""
#     try:
#         # Validate file type
#         if not file.content_type.startswith('audio/'):
#             raise HTTPException(status_code=400, detail="File must be an audio file")
        
#         # Save uploaded file temporarily
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
#             content = await file.read()
#             temp_file.write(content)
#             temp_file_path = temp_file.name
        
#         try:
#             # Transcribe audio
#             transcript = await whisper_service.transcribe(temp_file_path)
            
#             # Process with LLM
#             analysis = await llm_service.analyze_transcript(transcript)
            
#             # Save to database
#             meeting_id = await save_meeting({
#                 "title": analysis.get("title", file.filename),
#                 "transcript": transcript,
#                 "summary": analysis.get("summary", ""),
#                 "action_items": analysis.get("action_items", []),
#                 "objections": analysis.get("objections", []),
#                 "crm_notes": analysis.get("crm_notes", ""),
#                 "created_at": datetime.now()
#             })
            
#             return UploadResponse(
#                 id=meeting_id,
#                 status="processed",
#                 summary=analysis.get("summary", ""),
#                 action_items=analysis.get("action_items", []),
#                 objections=analysis.get("objections", []),
#                 crm_notes=analysis.get("crm_notes", "")
#             )
            
#         finally:
#             # Clean up temp file
#             os.unlink(temp_file_path)
            
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
