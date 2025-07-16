from dotenv import load_dotenv
import asyncpg
import os
import json
from typing import List, Dict, Optional
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://user:pass@localhost/dbname")

# Create a global connection pool
pool: Optional[asyncpg.Pool] = None

async def init_db_pool():
    global pool
    if pool is None:
        try:
            pool = await asyncpg.create_pool(
                dsn=POSTGRES_URL,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            print("✅ Database connection pool initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize database pool: {e}")
            raise

async def init_database():
    """Initialize PostgreSQL database with required tables"""
    try:
        await init_db_pool()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS meetings (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    summary TEXT,
                    transcript TEXT,
                    action_items JSONB,
                    objections JSONB,
                    crm_notes TEXT,
                    participants INTEGER,
                    duration TEXT,
                    client TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            """)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS action_items (
                    id SERIAL PRIMARY KEY,
                    meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
                    task TEXT NOT NULL,
                    assignee TEXT,
                    due_date TEXT,
                    priority TEXT DEFAULT 'medium',
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            """)
            print("✅ Database tables initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise

async def save_meeting(meeting_data: Dict) -> int:
    try:
        await init_db_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Convert lists to JSON strings for PostgreSQL JSONB storage
                action_items_json = json.dumps(meeting_data.get("action_items", []))
                objections_json = json.dumps(meeting_data.get("objections", []))
                
                print(f"🔍 Saving meeting with title: {meeting_data.get('title')}")
                print(f"🔍 Action items: {len(meeting_data.get('action_items', []))} items")
                print(f"🔍 Objections: {len(meeting_data.get('objections', []))} items")
                
                row = await conn.fetchrow("""
                    INSERT INTO meetings (title, summary, transcript, action_items, objections, crm_notes, participants, duration, client)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id
                """, meeting_data.get("title"),
                     meeting_data.get("summary"),
                     meeting_data.get("transcript"),
                     action_items_json,  # JSON string for JSONB
                     objections_json,    # JSON string for JSONB
                     meeting_data.get("crm_notes"),
                     meeting_data.get("participants"),
                     meeting_data.get("duration"),
                     meeting_data.get("client"))

                meeting_id = row["id"]
                print(f"✅ Meeting saved with ID: {meeting_id}")

                # Save action items separately in the action_items table
                action_items_list = meeting_data.get("action_items", [])
                for item in action_items_list:
                    if isinstance(item, dict):
                        await conn.execute("""
                            INSERT INTO action_items (meeting_id, task, assignee, due_date, priority)
                            VALUES ($1, $2, $3, $4, $5)
                        """, meeting_id, 
                             item.get("task", ""),
                             item.get("assignee"),
                             item.get("due_date"),
                             item.get("priority", "medium"))
        
        print(f"✅ All data saved successfully for meeting {meeting_id}")
        return meeting_id
    except Exception as e:
        print(f"❌ Error saving meeting: {e}")
        print(f"❌ Meeting data: {meeting_data}")
        raise

async def get_meetings(limit: int = 50, offset: int = 0, search: Optional[str] = None, date_filter: Optional[datetime] = None, order_by: str = "created_at DESC") -> List[Dict]:
    try:
        await init_db_pool()
        query = "SELECT * FROM meetings"
        conditions = []
        values = []
        param_count = 1

        if search:
            conditions.append(f"(title ILIKE ${param_count} OR summary ILIKE ${param_count})")
            values.append(f"%{search}%")
            param_count += 1
        
        if date_filter:
            conditions.append(f"created_at >= ${param_count}")
            values.append(date_filter)
            param_count += 1

        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += f" ORDER BY {order_by} LIMIT ${param_count} OFFSET ${param_count + 1}"
        values.extend([limit, offset])

        print(f"🔍 Executing query: {query}")
        print(f"🔍 With values: {values}")

        async with pool.acquire() as conn:
            rows = await conn.fetch(query, *values)

        print(f"🔍 Found {len(rows)} meetings")

        meetings = []
        for row in rows:
            row = dict(row)
            
            # Parse JSONB fields - PostgreSQL returns them as strings sometimes
            if row["action_items"] is not None:
                if isinstance(row["action_items"], str):
                    try:
                        row["action_items"] = json.loads(row["action_items"])
                    except json.JSONDecodeError:
                        row["action_items"] = []
                elif not isinstance(row["action_items"], list):
                    row["action_items"] = []
            else:
                row["action_items"] = []
                
            if row["objections"] is not None:
                if isinstance(row["objections"], str):
                    try:
                        row["objections"] = json.loads(row["objections"])
                    except json.JSONDecodeError:
                        row["objections"] = []
                elif not isinstance(row["objections"], list):
                    row["objections"] = []
            else:
                row["objections"] = []
            
            # Ensure the lists contain proper dictionaries if they have data
            if isinstance(row["action_items"], list):
                for i, item in enumerate(row["action_items"]):
                    if not isinstance(item, dict):
                        row["action_items"][i] = {"task": str(item), "assignee": None, "due_date": None, "priority": "medium"}
            
            if isinstance(row["objections"], list):
                for i, item in enumerate(row["objections"]):
                    if not isinstance(item, dict):
                        row["objections"][i] = {"concern": str(item), "response": None}
            
            meetings.append(row)
        
        print(f"✅ Returning {len(meetings)} meetings")
        return meetings
    except Exception as e:
        print(f"❌ Error fetching meetings: {e}")
        raise

async def get_meeting_by_id(meeting_id: int) -> Optional[Dict]:
    try:
        await init_db_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow("SELECT * FROM meetings WHERE id = $1", meeting_id)
            if row:
                meeting = dict(row)
                
                # Parse JSONB fields - PostgreSQL returns them as strings sometimes
                if meeting["action_items"] is not None:
                    if isinstance(meeting["action_items"], str):
                        try:
                            meeting["action_items"] = json.loads(meeting["action_items"])
                        except json.JSONDecodeError:
                            meeting["action_items"] = []
                    elif not isinstance(meeting["action_items"], list):
                        meeting["action_items"] = []
                else:
                    meeting["action_items"] = []
                    
                if meeting["objections"] is not None:
                    if isinstance(meeting["objections"], str):
                        try:
                            meeting["objections"] = json.loads(meeting["objections"])
                        except json.JSONDecodeError:
                            meeting["objections"] = []
                    elif not isinstance(meeting["objections"], list):
                        meeting["objections"] = []
                else:
                    meeting["objections"] = []
                
                # Ensure the lists contain proper dictionaries if they have data
                if isinstance(meeting["action_items"], list):
                    for i, item in enumerate(meeting["action_items"]):
                        if not isinstance(item, dict):
                            meeting["action_items"][i] = {"task": str(item), "assignee": None, "due_date": None, "priority": "medium"}
                
                if isinstance(meeting["objections"], list):
                    for i, item in enumerate(meeting["objections"]):
                        if not isinstance(item, dict):
                            meeting["objections"][i] = {"concern": str(item), "response": None}
                
                return meeting
        return None
    except Exception as e:
        print(f"❌ Error fetching meeting by ID {meeting_id}: {e}")
        raise

async def delete_meeting_by_id(meeting_id: int) -> bool:
    await init_db_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM meetings WHERE id = $1", meeting_id)
        return result.split()[-1] == "1"

async def get_action_items(completed: Optional[bool] = None, limit: int = 100) -> List[Dict]:
    await init_db_pool()
    query = """
        SELECT ai.*, m.title as meeting_title 
        FROM action_items ai 
        JOIN meetings m ON ai.meeting_id = m.id
    """
    values = []
    param_count = 1
    
    if completed is not None:
        query += f" WHERE ai.completed = ${param_count}"
        values.append(completed)
        param_count += 1

    query += f" ORDER BY ai.created_at DESC LIMIT ${param_count}"
    values.append(limit)

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *values)

    return [dict(row) for row in rows]

async def update_action_item_status(item_id: int, updates: Dict) -> bool:
    await init_db_pool()
    set_clauses = []
    values = []
    param_count = 1
    
    for key, val in updates.items():
        if val is not None:
            set_clauses.append(f"{key} = ${param_count}")
            values.append(val)
            param_count += 1
    
    if not set_clauses:
        return False
    
    query = f"UPDATE action_items SET {', '.join(set_clauses)} WHERE id = ${param_count}"
    values.append(item_id)

    async with pool.acquire() as conn:
        result = await conn.execute(query, *values)
        return result.split()[-1] == "1"

async def close_db_pool():
    """Close the database connection pool"""
    global pool
    if pool:
        await pool.close()
        pool = None
        print("✅ Database connection pool closed")
