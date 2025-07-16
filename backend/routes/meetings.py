from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta

from models.schemas import MeetingResponse
from db.database import get_meetings, get_meeting_by_id, delete_meeting_by_id

router = APIRouter()

@router.get("/", response_model=List[MeetingResponse])
async def get_all_meetings(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None
):
    """Get all meetings with optional search and pagination"""
    try:
        meetings = await get_meetings(limit=limit, offset=offset, search=search)
        return meetings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recent", response_model=List[MeetingResponse])
async def get_recent_meetings(limit: int = Query(5, ge=1, le=20)):
    """Get recent meetings"""
    try:
        # Get meetings from last 30 days
        cutoff_date = datetime.now() - timedelta(days=30)
        meetings = await get_meetings(
            limit=limit,
            date_filter=cutoff_date,
            order_by="created_at DESC"
        )
        return meetings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(meeting_id: int):
    """Get specific meeting by ID"""
    try:
        meeting = await get_meeting_by_id(meeting_id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return meeting
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{meeting_id}")
async def delete_meeting(meeting_id: int):
    """Delete a meeting"""
    try:
        success = await delete_meeting_by_id(meeting_id)
        if not success:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return {"message": "Meeting deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
