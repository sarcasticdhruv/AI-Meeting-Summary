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
        print(f"Email request received: meeting_id={request.meeting_id}, email={request.email}")
        
        # Get meeting data
        meeting = await get_meeting_by_id(request.meeting_id)
        if not meeting:
            print(f"Meeting not found with ID: {request.meeting_id}")
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        print(f"Meeting found: {meeting.get('title', 'Unknown')}")
        
        # Send email
        success = await email_service.send_meeting_summary(
            meeting=meeting,
            recipient_email=request.email,
            include_transcript=request.include_transcript
        )
        
        if success:
            print("Email sent successfully")
            return {"message": "Email sent successfully"}
        else:
            print("Email sending failed")
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in email route: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
