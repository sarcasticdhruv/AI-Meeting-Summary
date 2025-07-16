from fastapi import APIRouter, HTTPException
from typing import List

from models.schemas import ActionItemResponse, ActionItemUpdate
from db.database import get_action_items, update_action_item_status

router = APIRouter()

@router.get("/", response_model=List[ActionItemResponse])
async def get_all_action_items():
    """Get all action items"""
    try:
        action_items = await get_action_items()
        return action_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/upcoming", response_model=List[ActionItemResponse])
async def get_upcoming_actions():
    """Get upcoming action items (not completed)"""
    try:
        action_items = await get_action_items(completed=False, limit=10)
        return action_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{item_id}")
async def update_action_item(item_id: int, update: ActionItemUpdate):
    """Update action item status"""
    try:
        success = await update_action_item_status(item_id, update.dict())
        if not success:
            raise HTTPException(status_code=404, detail="Action item not found")
        return {"message": "Action item updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
