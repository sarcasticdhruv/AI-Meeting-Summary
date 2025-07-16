from fastapi import APIRouter, HTTPException
from models.schemas import EmailRequest
from services.email_service import EmailService
from db.database import get_meeting_by_id

router = APIRouter()
email_service = EmailService()

@router.post("/summary")
async def send_email_summary(request: EmailRequest):
    """Send meeting summary via email"""
    try:
        # Get meeting data
        meeting = await get_meeting_by_id(request.meeting_id)
        if not meeting:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        # Send email
        success = await email_service.send_meeting_summary(
            meeting=meeting,
            recipient_email=request.email,
            include_transcript=request.include_transcript
        )
        
        if success:
            return {"message": "Email sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
