import csv
import json
from typing import List, Dict
from io import StringIO

def format_meetings_for_csv(meetings: List[Dict]) -> str:
    """Format meetings data for CSV export"""
    output = StringIO()
    
    if not meetings:
        return ""
    
    # Define CSV headers
    headers = [
        'id', 'title', 'summary', 'client', 'participants', 
        'duration', 'created_at', 'action_items_count', 'crm_notes'
    ]
    
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()
    
    for meeting in meetings:
        # Format action items count
        action_items = meeting.get('action_items', [])
        action_items_count = len(action_items) if isinstance(action_items, list) else 0
        
        row = {
            'id': meeting.get('id', ''),
            'title': meeting.get('title', ''),
            'summary': meeting.get('summary', ''),
            'client': meeting.get('client', ''),
            'participants': meeting.get('participants', ''),
            'duration': meeting.get('duration', ''),
            'created_at': meeting.get('created_at', ''),
            'action_items_count': action_items_count,
            'crm_notes': meeting.get('crm_notes', '')
        }
        
        writer.writerow(row)
    
    return output.getvalue()

def format_action_items_for_csv(action_items: List[Dict]) -> str:
    """Format action items data for CSV export"""
    output = StringIO()
    
    if not action_items:
        return ""
    
    # Define CSV headers
    headers = [
        'id', 'task', 'assignee', 'due_date', 'priority', 
        'completed', 'meeting_title', 'meeting_id', 'created_at'
    ]
    
    writer = csv.DictWriter(output, fieldnames=headers)
    writer.writeheader()
    
    for item in action_items:
        row = {
            'id': item.get('id', ''),
            'task': item.get('task', ''),
            'assignee': item.get('assignee', ''),
            'due_date': item.get('due_date', ''),
            'priority': item.get('priority', ''),
            'completed': item.get('completed', False),
            'meeting_title': item.get('meeting_title', ''),
            'meeting_id': item.get('meeting_id', ''),
            'created_at': item.get('created_at', '')
        }
        
        writer.writerow(row)
    
    return output.getvalue()

def format_data_for_json_export(data: List[Dict]) -> str:
    """Format data for JSON export with proper serialization"""
    return json.dumps(data, indent=2, default=str, ensure_ascii=False)
