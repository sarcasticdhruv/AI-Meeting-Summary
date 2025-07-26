from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from typing import Optional
import tempfile
import os
from datetime import datetime
import uuid
import subprocess
import gc
import asyncio
import psutil  # For memory monitoring
import logging
import sys
import time

from services.llm_service import LLMService
from services.whisper_service import WhisperService
from services.progress_service import progress_tracker, ProcessingStage
from models.schemas import UploadResponse, TextUploadRequest
from models.user_schemas import UserResponse
from routes.auth import get_current_user
from db.database import save_meeting

router = APIRouter()

# Setup logging for upload routes
def setup_upload_logging():
    """Setup logging that works for both local and Render deployment"""
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console handler (works for both local and Render)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Force flush
    console_handler.flush()
    
    # Print to both stdout and stderr for maximum visibility on Render
    def dual_print(message, level="INFO"):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        formatted_msg = f"{timestamp} - Upload - {level} - {message}"
        print(formatted_msg, flush=True)  # stdout
        print(formatted_msg, file=sys.stderr, flush=True)  # stderr
    
    logger.dual_print = dual_print
    return logger

upload_logger = setup_upload_logging()

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

@router.get("/progress/{request_id}")
async def get_upload_progress(
    request_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get real-time progress for an upload request"""
    progress = progress_tracker.get_progress(request_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Progress tracking not found for this request")
    return progress

@router.post("/transcript", response_model=UploadResponse)
async def upload_transcript(
    request: TextUploadRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Upload and process text transcript"""
    request_id = str(uuid.uuid4())
    
    try:
        progress_tracker.start_tracking(request_id, "Processing text transcript...")
        print(f"🔍 [{request_id}] Received upload request with content length: {len(request.content)}")
        
        # Update progress for LLM analysis
        progress_tracker.update_progress(
            request_id, 
            ProcessingStage.ANALYZING, 
            20, 
            "Analyzing transcript with AI...", 
            estimated_time_remaining=120
        )
        
        # Process with LLM with timeout
        print("🤖 Starting LLM analysis...")
        try:
            analysis = await asyncio.wait_for(
                llm_service.analyze_transcript(request.content), 
                timeout=120  # 2 minute timeout
            )
            print(f"✅ LLM Analysis completed: {type(analysis)}")
            
            progress_tracker.update_progress(
                request_id, 
                ProcessingStage.ANALYZING, 
                80, 
                "AI analysis completed, preparing results...", 
                estimated_time_remaining=15
            )
        except asyncio.TimeoutError:
            progress_tracker.fail_tracking(request_id, "LLM analysis timeout")
            raise HTTPException(status_code=408, detail="LLM analysis timeout")
        except Exception as llm_error:
            print(f"❌ LLM analysis failed: {llm_error}")
            progress_tracker.fail_tracking(request_id, f"LLM analysis failed: {str(llm_error)}")
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
        
        # Update progress for database save
        progress_tracker.update_progress(
            request_id, 
            ProcessingStage.SAVING, 
            90, 
            "Saving meeting to database...", 
            estimated_time_remaining=5
        )
        
        # Save to database
        print("💾 Saving to database...")
        meeting_id = await save_meeting({
            "title": title,
            "transcript": request.content,
            "summary": summary,
            "action_items": action_items,
            "objections": objections,
            "crm_notes": crm_notes
        }, user_id=current_user.id)
        
        print(f"✅ Meeting saved with ID: {meeting_id}")
        
        # Complete progress tracking
        progress_tracker.complete_tracking(request_id, "Meeting analysis completed successfully!")
        
        # Force cleanup after processing
        del analysis
        gc.collect()
        
        return UploadResponse(
            id=meeting_id,
            status="processed",
            summary=summary,
            action_items=action_items,
            objections=objections,
            title=title,
            crm_notes=crm_notes,
            request_id=request_id  # Include request_id for progress tracking
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        print(f"❌ Transcript upload error: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        progress_tracker.fail_tracking(request_id, f"Transcript upload error: {str(e)}")
        gc.collect()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio", response_model=UploadResponse)
async def upload_audio(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    """Upload and process audio file"""
    temp_file_path = None
    request_id = str(uuid.uuid4())
    
    try:
        # Start progress tracking
        progress_tracker.start_tracking(request_id, f"Uploading audio file: {file.filename}")
        
        upload_logger.info(f"[{request_id}] Audio upload started - filename: {file.filename}")
        upload_logger.dual_print(f"[{request_id}] AUDIO UPLOAD START - {file.filename}")
        print(f"🔍 DEBUG: Starting audio upload with request_id: {request_id}")
        
        # Validate file type
        if not file.content_type.startswith('audio/'):
            error_msg = f"File must be an audio file, got: {file.content_type}"
            upload_logger.error(f"[{request_id}] {error_msg}")
            upload_logger.dual_print(f"[{request_id}] INVALID FILE TYPE: {file.content_type}", "ERROR")
            progress_tracker.fail_tracking(request_id, error_msg)
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        upload_logger.info(f"[{request_id}] File type validation passed: {file.content_type}")
        upload_logger.dual_print(f"[{request_id}] File type OK: {file.content_type}")
        
        # Update progress - file validation done
        progress_tracker.update_progress(
            request_id, 
            ProcessingStage.UPLOADING, 
            15, 
            "File validated, saving to server...", 
            estimated_time_remaining=180
        )
        
        # Create tmp directory if it doesn't exist (use absolute path)
        backend_dir = os.path.dirname(os.path.dirname(__file__))  # Go up from routes to backend
        tmp_dir = os.path.join(backend_dir, "tmp")
        os.makedirs(tmp_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".wav"
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        temp_file_path = os.path.abspath(os.path.join(tmp_dir, unique_filename))
        
        upload_logger.info(f"[{request_id}] Temp file path: {temp_file_path}")
        upload_logger.dual_print(f"[{request_id}] SAVING TO: {temp_file_path}")
        
        # Save uploaded file
        file_save_start = time.time()
        content = await file.read()
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(content)
        file_save_time = time.time() - file_save_start
        
        file_size = os.path.getsize(temp_file_path)
        upload_logger.info(f"[{request_id}] File saved successfully - Size: {file_size} bytes in {file_save_time:.2f}s")
        upload_logger.dual_print(f"[{request_id}] FILE SAVED - {file_size} bytes - {file_save_time:.2f}s")
        
        # Update progress - file uploaded successfully
        estimated_duration = min(max(file_size / 1024 / 1024 * 30, 60), 300)  # Estimate based on file size
        progress_tracker.update_progress(
            request_id, 
            ProcessingStage.TRANSCRIBING, 
            25, 
            "File uploaded, starting audio transcription...", 
            estimated_time_remaining=int(estimated_duration)
        )
        
        # Monitor memory usage
        try:
            process = psutil.Process()
            memory_mb = process.memory_info().rss / 1024 / 1024
            upload_logger.info(f"[{request_id}] Memory usage before transcription: {memory_mb:.1f} MB")
            upload_logger.dual_print(f"[{request_id}] MEMORY: {memory_mb:.1f} MB")
        except:
            upload_logger.warning(f"[{request_id}] Memory monitoring unavailable")
        
        # Force garbage collection before intensive processing
        gc.collect()
        
        # Add timeout and better error handling for transcription
        upload_logger.info(f"[{request_id}] Starting audio transcription...")
        upload_logger.dual_print(f"[{request_id}] TRANSCRIPTION START")
        
        try:
            # Update progress - transcription in progress
            progress_tracker.update_progress(
                request_id, 
                ProcessingStage.TRANSCRIBING, 
                40, 
                "AI is transcribing your audio...", 
                estimated_time_remaining=int(estimated_duration * 0.8)
            )
            
            # Increase timeout for Render deployment - model loading + transcription
            transcription_start = time.time()
            transcript = await asyncio.wait_for(
                whisper_service.transcribe(temp_file_path), 
                timeout=300  # 5 minute timeout to account for model loading + processing
            )
            transcription_time = time.time() - transcription_start
            upload_logger.info(f"[{request_id}] Transcription completed in {transcription_time:.2f}s - Length: {len(transcript)} characters")
            upload_logger.dual_print(f"[{request_id}] TRANSCRIPTION DONE - {transcription_time:.2f}s - {len(transcript)} chars")
            
            # Update progress - transcription completed
            progress_tracker.update_progress(
                request_id, 
                ProcessingStage.ANALYZING, 
                70, 
                "Transcription completed, analyzing content...", 
                estimated_time_remaining=60
            )
        except asyncio.TimeoutError:
            error_msg = "Transcription timeout - audio processing took too long"
            upload_logger.error(f"[{request_id}] {error_msg}")
            upload_logger.dual_print(f"[{request_id}] TRANSCRIPTION TIMEOUT", "ERROR")
            progress_tracker.fail_tracking(request_id, error_msg)
            raise HTTPException(status_code=408, detail=error_msg)
        except Exception as transcription_error:
            error_msg = f"Transcription failed: {transcription_error}"
            upload_logger.error(f"[{request_id}] {error_msg}")
            upload_logger.dual_print(f"[{request_id}] TRANSCRIPTION ERROR: {transcription_error}", "ERROR")
            progress_tracker.fail_tracking(request_id, error_msg)
            raise HTTPException(status_code=500, detail=f"Transcription failed: {str(transcription_error)}")
        
        # Process with LLM
        upload_logger.info(f"[{request_id}] Starting LLM analysis...")
        upload_logger.dual_print(f"[{request_id}] LLM ANALYSIS START")
        
        try:
            llm_start = time.time()
            analysis = await asyncio.wait_for(
                llm_service.analyze_transcript(transcript), 
                timeout=120  # 2 minute timeout
            )
            llm_time = time.time() - llm_start
            upload_logger.info(f"[{request_id}] LLM analysis completed in {llm_time:.2f}s")
            upload_logger.dual_print(f"[{request_id}] LLM ANALYSIS DONE - {llm_time:.2f}s")
            
            # Update progress - analysis completed
            progress_tracker.update_progress(
                request_id, 
                ProcessingStage.SAVING, 
                90, 
                "Analysis completed, saving meeting...", 
                estimated_time_remaining=10
            )
        except asyncio.TimeoutError:
            error_msg = "LLM analysis timeout"
            upload_logger.error(f"[{request_id}] {error_msg}")
            upload_logger.dual_print(f"[{request_id}] LLM TIMEOUT", "ERROR")
            progress_tracker.fail_tracking(request_id, error_msg)
            raise HTTPException(status_code=408, detail=error_msg)
        except Exception as llm_error:
            error_msg = f"LLM analysis failed: {llm_error}"
            upload_logger.error(f"[{request_id}] {error_msg}")
            upload_logger.dual_print(f"[{request_id}] LLM ERROR: {llm_error}", "ERROR")
            progress_tracker.fail_tracking(request_id, error_msg)
            raise HTTPException(status_code=500, detail=f"LLM analysis failed: {str(llm_error)}")
        
        # Store values before cleanup
        title = analysis.get("title", file.filename or "Audio Meeting")
        summary = analysis.get("summary", "")
        action_items = analysis.get("action_items", [])
        objections = analysis.get("objections", [])
        crm_notes = analysis.get("crm_notes", "")
        
        # Save to database
        upload_logger.info(f"[{request_id}] Saving to database...")
        upload_logger.dual_print(f"[{request_id}] DATABASE SAVE START")
        
        db_start = time.time()
        meeting_id = await save_meeting({
            "title": title,
            "transcript": transcript,
            "summary": summary,
            "action_items": action_items,
            "objections": objections,
            "crm_notes": crm_notes
        }, user_id=current_user.id)
        db_time = time.time() - db_start
        
        upload_logger.info(f"[{request_id}] Meeting saved with ID: {meeting_id} in {db_time:.2f}s")
        upload_logger.dual_print(f"[{request_id}] DATABASE SAVED - ID: {meeting_id} - {db_time:.2f}s")
        
        # Complete progress tracking
        progress_tracker.complete_tracking(request_id, "Audio processing completed successfully!")
        
        # Force cleanup
        del analysis, transcript
        gc.collect()
        
        total_time = time.time() - file_save_start
        upload_logger.info(f"[{request_id}] Audio processing completed successfully in {total_time:.2f}s total")
        upload_logger.dual_print(f"[{request_id}] COMPLETE SUCCESS - {total_time:.2f}s total")
        
        print(f"🔍 DEBUG: Returning response with request_id: {request_id}")
        return UploadResponse(
            id=meeting_id,
            status="processed",
            summary=summary,
            action_items=action_items,
            objections=objections,
            crm_notes=crm_notes,
            title=title,
            request_id=request_id
        )
            
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        error_msg = f"Audio upload error: {e}"
        upload_logger.error(f"[{request_id}] {error_msg}")
        upload_logger.dual_print(f"[{request_id}] GENERAL ERROR: {e}", "ERROR")
        progress_tracker.fail_tracking(request_id, error_msg)
        # Force cleanup on error
        gc.collect()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file only if it was created
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                upload_logger.info(f"[{request_id}] Cleaned up temp file: {temp_file_path}")
                upload_logger.dual_print(f"[{request_id}] CLEANUP DONE")
            except Exception as cleanup_error:
                upload_logger.warning(f"[{request_id}] Failed to cleanup temp file: {cleanup_error}")
                upload_logger.dual_print(f"[{request_id}] CLEANUP FAILED: {cleanup_error}", "WARNING")
        
        # Force garbage collection after processing
        gc.collect()
