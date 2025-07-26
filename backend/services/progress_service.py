"""
Progress tracking system for upload processing
"""
import asyncio
import time
from typing import Dict, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class ProcessingStage(Enum):
    UPLOADING = "uploading"
    TRANSCRIBING = "transcribing"
    ANALYZING = "analyzing"
    SAVING = "saving"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class ProgressUpdate:
    request_id: str
    stage: ProcessingStage
    progress_percent: int
    message: str
    estimated_time_remaining: Optional[int] = None
    elapsed_time: Optional[int] = None
    error_message: Optional[str] = None
    
    def to_dict(self):
        return {
            **asdict(self),
            'stage': self.stage.value,
            'timestamp': time.time()
        }

class ProgressTracker:
    def __init__(self):
        self.progress_data: Dict[str, ProgressUpdate] = {}
        self.start_times: Dict[str, float] = {}
    
    def start_tracking(self, request_id: str, message: str = "Starting upload..."):
        """Start tracking progress for a request"""
        self.start_times[request_id] = time.time()
        self.update_progress(
            request_id, 
            ProcessingStage.UPLOADING, 
            0, 
            message
        )
    
    def update_progress(
        self, 
        request_id: str, 
        stage: ProcessingStage, 
        progress_percent: int, 
        message: str,
        estimated_time_remaining: Optional[int] = None,
        error_message: Optional[str] = None
    ):
        """Update progress for a request"""
        elapsed_time = None
        if request_id in self.start_times:
            elapsed_time = int(time.time() - self.start_times[request_id])
        
        self.progress_data[request_id] = ProgressUpdate(
            request_id=request_id,
            stage=stage,
            progress_percent=progress_percent,
            message=message,
            estimated_time_remaining=estimated_time_remaining,
            elapsed_time=elapsed_time,
            error_message=error_message
        )
    
    def get_progress(self, request_id: str) -> Optional[Dict]:
        """Get current progress for a request"""
        if request_id in self.progress_data:
            return self.progress_data[request_id].to_dict()
        return None
    
    def complete_tracking(self, request_id: str, message: str = "Processing completed"):
        """Mark request as completed"""
        self.update_progress(
            request_id, 
            ProcessingStage.COMPLETED, 
            100, 
            message
        )
        
        # Clean up after 10 minutes to give frontend time to detect completion
        async def cleanup():
            await asyncio.sleep(600)  # 10 minutes instead of 5
            self.cleanup_request(request_id)
        
        asyncio.create_task(cleanup())
    
    def fail_tracking(self, request_id: str, error_message: str):
        """Mark request as failed"""
        self.update_progress(
            request_id, 
            ProcessingStage.FAILED, 
            0, 
            "Processing failed",
            error_message=error_message
        )
    
    def cleanup_request(self, request_id: str):
        """Clean up tracking data for a request"""
        self.progress_data.pop(request_id, None)
        self.start_times.pop(request_id, None)

# Global progress tracker instance
progress_tracker = ProgressTracker()
