from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional
import json
import csv
import io

from db.database import get_meetings, get_action_items
from utils.export_utils import format_meetings_for_csv, format_action_items_for_csv

router = APIRouter()

@router.get("/meetings")
async def export_meetings(format: str = Query("json", regex="^(json|csv)$")):
    """Export meetings data in JSON or CSV format"""
    try:
        meetings = await get_meetings(limit=1000)  # Get all meetings
        
        if format == "json":
            json_data = json.dumps(meetings, indent=2, default=str)
            return StreamingResponse(
                io.StringIO(json_data),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=meetings.json"}
            )
        
        elif format == "csv":
            csv_data = format_meetings_for_csv(meetings)
            return StreamingResponse(
                io.StringIO(csv_data),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=meetings.csv"}
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/action-items")
async def export_action_items(format: str = Query("json", regex="^(json|csv)$")):
    """Export action items data in JSON or CSV format"""
    try:
        action_items = await get_action_items(limit=1000)  # Get all action items
        
        if format == "json":
            json_data = json.dumps(action_items, indent=2, default=str)
            return StreamingResponse(
                io.StringIO(json_data),
                media_type="application/json",
                headers={"Content-Disposition": "attachment; filename=action_items.json"}
            )
        
        elif format == "csv":
            csv_data = format_action_items_for_csv(action_items)
            return StreamingResponse(
                io.StringIO(csv_data),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=action_items.csv"}
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
