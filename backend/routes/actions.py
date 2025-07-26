from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.schemas import ActionItemResponse, ActionItemUpdate
from models.user_schemas import UserResponse
from routes.auth import get_current_user
from db.database import get_action_items, update_action_item_status

router = APIRouter()

@router.get("/", response_model=List[ActionItemResponse])
async def get_all_action_items(current_user: UserResponse = Depends(get_current_user)):
    """Get all action items"""
    try:
        action_items = await get_action_items(user_id=current_user.id)
        return action_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/upcoming", response_model=List[ActionItemResponse])
async def get_upcoming_actions(current_user: UserResponse = Depends(get_current_user)):
    """Get upcoming action items (not completed)"""
    try:
        action_items = await get_action_items(user_id=current_user.id, completed=False, limit=10)
        return action_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{item_id}")
async def update_action_item(
    item_id: int, 
    update: ActionItemUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update action item status"""
    try:
        # First, verify the action item belongs to the user by checking via action items
        user_action_items = await get_action_items(user_id=current_user.id)
        user_item_ids = [item['id'] for item in user_action_items]
        
        if item_id not in user_item_ids:
            raise HTTPException(status_code=404, detail="Action item not found")
        
        success = await update_action_item_status(item_id, update.dict())
        if not success:
            raise HTTPException(status_code=404, detail="Action item not found")
        return {"message": "Action item updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
