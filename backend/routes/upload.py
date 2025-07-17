from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Optional
import tempfile
import os
from datetime import datetime
import uuid
import subprocess
import gc
import asyncio
import psutil  # For memory monitoring

from services.llm_service import LLMService
from services.whisper_service import WhisperService
from models.schemas import UploadResponse, TextUploadRequest
from db.database import save_meeting

router = APIRouter()
# Initialize services once to save memory
llm_service = LLMService()
whisper_service = WhisperService()

@router.get("/debug/ffmpeg")
async def debug_ffmpeg():
    """Debug endpoint to check FFmpeg availability"""
    try:
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        return {
            "ffmpeg_available": result.returncode == 0,
            "version_output": result.stdout[:200] if result.stdout else None,
            "error_output": result.stderr[:200] if result.stderr else None,
            "path_env": os.environ.get('PATH', '')[:500]
        }
    except Exception as e:
        return {
            "ffmpeg_available": False,
            "error": str(e),
            "path_env": os.environ.get('PATH', '')[:500]
        }

@router.post("/transcript", response_model=UploadResponse)
async def upload_transcript(request: TextUploadRequest):
    """Upload and process text transcript"""
    try:
        print(f"🔍 Received upload request with content length: {len(request.content)}")
        
        # Process with LLM with timeout
        print("🤖 Starting LLM analysis...")
        try:
            analysis = await asyncio.wait_for(
                llm_service.analyze_transcript(request.content), 
                timeout=120  # 2 minute timeout
            )
            print(f"✅ LLM Analysis completed: {type(analysis)}")
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="LLM analysis timeout")
        except Exception as llm_error:
            print(f"❌ LLM analysis failed: {llm_error}")
            raise HTTPException(status_code=500, detail=f"LLM analysis failed: {str(llm_error)}")
        
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
        
        # Store values before cleanup
        title = analysis.get("title", "Meeting Summary")
        summary = analysis.get("summary", "")
        crm_notes = analysis.get("crm_notes", "")
        
        # Save to database
        print("💾 Saving to database...")
        meeting_id = await save_meeting({
            "title": title,
            "transcript": request.content,
            "summary": summary,
            "action_items": action_items,
            "objections": objections,
            "crm_notes": crm_notes
        })
        
        print(f"✅ Meeting saved with ID: {meeting_id}")
        
        # Force cleanup after processing
        del analysis
        gc.collect()
        
        return UploadResponse(
            id=meeting_id,
            status="processed",
            summary=summary,
            action_items=action_items,
            objections=objections,
            crm_notes=crm_notes
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        print(f"❌ Transcript upload error: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        gc.collect()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio", response_model=UploadResponse)
async def upload_audio(file: UploadFile = File(...)):
    """Upload and process audio file"""
    temp_file_path = None
    try:
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Create tmp directory if it doesn't exist (use absolute path)
        backend_dir = os.path.dirname(os.path.dirname(__file__))  # Go up from routes to backend
        tmp_dir = os.path.join(backend_dir, "tmp")
        os.makedirs(tmp_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".wav"
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        temp_file_path = os.path.abspath(os.path.join(tmp_dir, unique_filename))
        
        # Save uploaded file
        content = await file.read()
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(content)
        
        print(f"📁 File saved to: {temp_file_path}")
        print(f"📊 File size: {os.path.getsize(temp_file_path)} bytes")
        
        # Monitor memory usage
        try:
            process = psutil.Process()
            memory_mb = process.memory_info().rss / 1024 / 1024
            print(f"💾 Memory usage before transcription: {memory_mb:.1f} MB")
        except:
            print("💾 Memory monitoring unavailable")
        
        # Force garbage collection before intensive processing
        gc.collect()
        
        # Add timeout and better error handling for transcription
        print("🎵 Starting audio transcription...")
        try:
            # Shorter timeout for small files - 2 min file should transcribe in under 2 minutes
            transcript = await asyncio.wait_for(
                whisper_service.transcribe(temp_file_path), 
                timeout=180  # 3 minute timeout (should be plenty for 2 min audio)
            )
            print(f"✅ Transcription completed. Length: {len(transcript)} characters")
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="Transcription timeout - audio processing took too long")
        except Exception as transcription_error:
            print(f"❌ Transcription failed: {transcription_error}")
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(transcription_error)}")
        
        # Process with LLM
        print("🤖 Starting LLM analysis...")
        try:
            analysis = await asyncio.wait_for(
                llm_service.analyze_transcript(transcript), 
                timeout=120  # 2 minute timeout
            )
            print("✅ LLM analysis completed")
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="LLM analysis timeout")
        except Exception as llm_error:
            print(f"❌ LLM analysis failed: {llm_error}")
            raise HTTPException(status_code=500, detail=f"LLM analysis failed: {str(llm_error)}")
        
        # Store values before cleanup
        title = analysis.get("title", file.filename or "Audio Meeting")
        summary = analysis.get("summary", "")
        action_items = analysis.get("action_items", [])
        objections = analysis.get("objections", [])
        crm_notes = analysis.get("crm_notes", "")
        
        # Save to database
        print("💾 Saving to database...")
        meeting_id = await save_meeting({
            "title": title,
            "transcript": transcript,
            "summary": summary,
            "action_items": action_items,
            "objections": objections,
            "crm_notes": crm_notes
        })
        print(f"✅ Meeting saved with ID: {meeting_id}")
        
        # Force cleanup
        del analysis, transcript
        gc.collect()
        
        return UploadResponse(
            id=meeting_id,
            status="processed",
            summary=summary,
            action_items=action_items,
            objections=objections,
            crm_notes=crm_notes
        )
            
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        print(f"❌ Audio upload error: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        # Force cleanup on error
        gc.collect()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file only if it was created
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                print(f"🗑️ Cleaned up temp file: {temp_file_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Failed to cleanup temp file: {cleanup_error}")
        
        # Force garbage collection after processing
        gc.collect()
