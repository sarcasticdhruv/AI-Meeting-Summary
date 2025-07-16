#!/usr/bin/env python3
"""
Test database operations directly
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import init_database, save_meeting, get_meetings

async def test_database_operations():
    """Test basic database operations"""
    print("🔧 Testing database operations...")
    
    try:
        # Initialize database
        await init_database()
        print("✅ Database initialized")
        
        # Test data
        test_meeting = {
            "title": "Test Meeting",
            "summary": "This is a test meeting to verify database operations",
            "transcript": "This is a sample transcript for testing purposes",
            "action_items": [
                {"task": "Test task 1", "assignee": "John", "due_date": "2025-01-20", "priority": "high"},
                {"task": "Test task 2", "assignee": "Jane", "due_date": "2025-01-25", "priority": "medium"}
            ],
            "objections": [
                {"concern": "Test concern", "response": "Test response"}
            ],
            "crm_notes": "Test CRM notes",
            "participants": 5,
            "duration": "30 min",
            "client": "Test Client"
        }
        
        # Save meeting
        meeting_id = await save_meeting(test_meeting)
        print(f"✅ Meeting saved with ID: {meeting_id}")
        
        # Retrieve meetings
        meetings = await get_meetings(limit=10)
        print(f"✅ Retrieved {len(meetings)} meetings")
        
        if meetings:
            latest_meeting = meetings[0]
            print(f"✅ Latest meeting: {latest_meeting['title']}")
            print(f"   - ID: {latest_meeting['id']}")
            print(f"   - Action items: {len(latest_meeting['action_items'])}")
            print(f"   - Created at: {latest_meeting['created_at']}")
        
        print("🎉 All database operations successful!")
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_database_operations())
