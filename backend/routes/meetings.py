from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime, timedelta

from models.schemas import MeetingResponse
from models.user_schemas import UserResponse
from routes.auth import get_current_user
from db.database import (
    get_meetings,
    get_meeting_by_id,
    delete_meeting_by_id,
    get_recent_clients,
)

router = APIRouter()


@router.get("", response_model=List[MeetingResponse])
async def get_all_meetings(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all meetings with optional search and pagination"""
    try:
        meetings = await get_meetings(
            user_id=current_user.id,
            limit=limit, 
            offset=offset, 
            search=search
        )
        return meetings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent", response_model=List[MeetingResponse])
async def get_recent_meetings(
    limit: int = Query(5, ge=1, le=20),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get recent meetings"""
    try:
        # Get meetings from last 30 days
        cutoff_date = datetime.now() - timedelta(days=30)
        meetings = await get_meetings(
            user_id=current_user.id,
            limit=limit, 
            date_filter=cutoff_date, 
            order_by="created_at DESC"
        )
        return meetings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific meeting by ID"""
    try:
        meeting = await get_meeting_by_id(meeting_id, user_id=current_user.id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return meeting
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{meeting_id}")
async def delete_meeting(
    meeting_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a meeting"""
    try:
        # First check if meeting belongs to user
        meeting = await get_meeting_by_id(meeting_id, user_id=current_user.id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        success = await delete_meeting_by_id(meeting_id)
        if not success:
            raise HTTPException(status_code=404, detail="Meeting not found")
        return {"message": "Meeting deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clients/recent")
async def get_recent_clients_endpoint(
    limit: int = Query(10, ge=1, le=20),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get recent unique clients"""
    try:
        clients = await get_recent_clients(limit=limit, user_id=current_user.id)
        return {"clients": clients}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_analytics(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get analytics data for meetings"""
    try:
        # Get all meetings for the user
        meetings = await get_meetings(user_id=current_user.id, limit=1000)
        
        if not meetings:
            # Return empty analytics if no meetings
            return {
                "totalMeetings": 0,
                "totalHours": 0,
                "actionItemsCompleted": 0,
                "averageMeetingDuration": 0,
                "monthlyTrend": "0%",
                "completionRate": 0,
                "topClients": [],
                "recentActivity": []
            }
        
        # Calculate analytics
        total_meetings = len(meetings)
        total_duration = sum(meeting.duration or 0 for meeting in meetings)
        total_hours = round(total_duration / 60, 1) if total_duration else 0
        avg_duration = round(total_duration / total_meetings / 60, 1) if total_meetings else 0
        
        # Calculate action items completed (mock for now)
        action_items_completed = total_meetings * 2  # Approximate 2 actions per meeting
        completion_rate = 85  # Mock completion rate
        
        # Get top clients
        client_counts = {}
        for meeting in meetings:
            client = getattr(meeting, 'client_name', 'Unknown Client')
            client_counts[client] = client_counts.get(client, 0) + 1
        
        top_clients = [
            {"name": client, "meetings": count}
            for client, count in sorted(client_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        # Recent activity (last 5 meetings)
        recent_meetings = sorted(meetings, key=lambda x: x.created_at or datetime.min, reverse=True)[:5]
        recent_activity = [
            {
                "type": "meeting",
                "title": meeting.title or f"Meeting {meeting.id}",
                "date": f"{(datetime.now() - (meeting.created_at or datetime.now())).days} days ago"
            }
            for meeting in recent_meetings
        ]
        
        # Calculate monthly trend (mock for now)
        monthly_trend = "+12%" if total_meetings > 10 else "+5%"
        
        return {
            "totalMeetings": total_meetings,
            "totalHours": total_hours,
            "actionItemsCompleted": action_items_completed,
            "averageMeetingDuration": avg_duration,
            "monthlyTrend": monthly_trend,
            "completionRate": completion_rate,
            "topClients": top_clients,
            "recentActivity": recent_activity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
