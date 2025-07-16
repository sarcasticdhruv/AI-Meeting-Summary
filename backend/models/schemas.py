from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TextUploadRequest(BaseModel):
    content: str

class ActionItem(BaseModel):
    task: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "medium"

class Objection(BaseModel):
    concern: str
    response: Optional[str] = None

class UploadResponse(BaseModel):
    id: int
    status: str
    summary: str
    action_items: List[ActionItem]
    objections: List[Objection]
    crm_notes: str

class MeetingResponse(BaseModel):
    id: int
    title: str
    summary: str
    transcript: Optional[str] = None
    action_items: List[ActionItem]
    objections: List[Objection]
    crm_notes: str
    created_at: datetime
    participants: Optional[int] = None
    duration: Optional[str] = None
    client: Optional[str] = None

class MeetingListResponse(BaseModel):
    meetings: List[MeetingResponse]
    total: int
    page: int
    per_page: int

class ActionItemResponse(BaseModel):
    id: int
    task: str
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "medium"
    completed: bool = False
    meeting_id: int
    meeting_title: str
    created_at: datetime

class ActionItemUpdate(BaseModel):
    completed: Optional[bool] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None

class EmailRequest(BaseModel):
    meeting_id: int
    email: str
    include_transcript: bool = False
