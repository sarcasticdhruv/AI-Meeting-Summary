from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import asyncpg
from datetime import datetime
import os

from models.user_schemas import UserCreate, UserLogin, UserResponse, UserProfile, Token
from services.auth_service import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    verify_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from db.database import pool, init_db_pool, get_db_connection

# Debug: Print environment info at module load
print(f"🔍 Auth module loaded - POSTGRES_URL present: {bool(os.getenv('POSTGRES_URL'))}")

router = APIRouter()
security = HTTPBearer()

@router.get("/health")
async def auth_health_check():
    """Health check for authentication service and database connectivity"""
    from db.database import POSTGRES_URL
    
    health_info = {
        "status": "unknown",
        "database_url_loaded": POSTGRES_URL != "postgresql://user:pass@localhost/dbname",
        "database_url_preview": POSTGRES_URL[:50] if POSTGRES_URL else "None",
        "pool_status": "unknown",
        "database_connected": False,
        "error_details": None
    }
    
    try:
        print("🔧 Health check: Testing database connection...")
        
        # Test pool initialization using new helper
        db_pool = await get_db_connection()
        health_info["pool_status"] = "initialized"
        
        # Test connection acquisition and query
        async with db_pool.acquire() as conn:
            result = await conn.fetchval("SELECT 1")
            
            # Test if users table exists
            table_exists = await conn.fetchval("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                )
            """)
            
            health_info.update({
                "status": "healthy",
                "database_connected": True,
                "test_query_result": result,
                "users_table_exists": table_exists,
                "pool_status": "active"
            })
            
            print("✅ Health check passed")
            return health_info
    
    except Exception as e:
        health_info.update({
            "status": "error",
            "error_details": str(e),
            "error_type": type(e).__name__
        })
        print(f"❌ Health check failed: {e}")
        return health_info

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """Get current authenticated user"""
    token = credentials.credentials
    email = verify_token(token)
    
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        db_pool = await get_db_connection()
        
        async with db_pool.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT id, full_name, email, created_at, is_active FROM users WHERE email = $1",
                email
            )
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            return UserResponse(
                id=user["id"],
                full_name=user["full_name"],
                email=user["email"],
                created_at=user["created_at"],
                is_active=user["is_active"]
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Authentication error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    print(f"📝 Registration attempt for email: {user_data.email}")
    try:
        # Get database connection using the helper function
        print("🔧 Getting database connection...")
        db_pool = await get_db_connection()
        print("✅ Database pool obtained")
        
        async with db_pool.acquire() as conn:
            print("✅ Database connection acquired")
            
            # Test basic connectivity
            test_result = await conn.fetchval("SELECT 1")
            print(f"✅ Database test query result: {test_result}")
            
            # Check if user already exists
            existing_user = await conn.fetchrow(
                "SELECT id FROM users WHERE email = $1", 
                user_data.email
            )
            print(f"🔍 Existing user check: {existing_user is not None}")
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Hash password and create user
            print("🔐 Hashing password...")
            hashed_password = get_password_hash(user_data.password)
            print("✅ Password hashed successfully")
            
            # Use PostgreSQL's NOW() function instead of Python datetime
            print("💾 Inserting user into database...")
            user = await conn.fetchrow("""
                INSERT INTO users (full_name, email, password_hash, is_active, created_at) 
                VALUES ($1, $2, $3, $4, NOW()) 
                RETURNING id, full_name, email, created_at, is_active
            """, user_data.full_name, user_data.email, hashed_password, True)
            
            if not user:
                print("❌ User creation failed - no data returned")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user"
                )
            
            print(f"✅ User created with ID: {user['id']}")
            
            # Create access token
            print("🎫 Creating access token...")
            access_token = create_access_token(data={"sub": user["email"]})
            print("✅ Access token created")
            
            user_response = UserResponse(
                id=user["id"],
                full_name=user["full_name"],
                email=user["email"],
                created_at=user["created_at"],
                is_active=user["is_active"]
            )
            
            print("✅ Registration completed successfully")
            return Token(
                access_token=access_token,
                token_type="bearer",
                user=user_response
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Registration error: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login user"""
    try:
        db_pool = await get_db_connection()
        async with db_pool.acquire() as conn:
            user = await conn.fetchrow(
                "SELECT id, full_name, email, password_hash, created_at, is_active FROM users WHERE email = $1",
                user_credentials.email
            )
            
            if not user or not verify_password(user_credentials.password, user["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
            
            if not user["is_active"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account is deactivated"
                )
            
            # Create access token
            access_token = create_access_token(data={"sub": user["email"]})
            
            user_response = UserResponse(
                id=user["id"],
                full_name=user["full_name"],
                email=user["email"],
                created_at=user["created_at"],
                is_active=user["is_active"]
            )
            
            return Token(
                access_token=access_token,
                token_type="bearer",
                user=user_response
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get user profile with statistics"""
    try:
        db_pool = await get_db_connection()
        async with db_pool.acquire() as conn:
            # Get meeting count
            meeting_count = await conn.fetchval(
                "SELECT COUNT(*) FROM meetings WHERE user_id = $1",
                current_user.id
            )
            
            # Get total action items
            total_actions = await conn.fetchval("""
                SELECT COUNT(*) FROM action_items ai 
                JOIN meetings m ON ai.meeting_id = m.id 
                WHERE m.user_id = $1
            """, current_user.id)
            
            # Get pending action items
            pending_actions = await conn.fetchval("""
                SELECT COUNT(*) FROM action_items ai 
                JOIN meetings m ON ai.meeting_id = m.id 
                WHERE m.user_id = $1 AND ai.completed = FALSE
            """, current_user.id)
            
            return UserProfile(
                id=current_user.id,
                full_name=current_user.full_name,
                email=current_user.email,
                created_at=current_user.created_at,
                total_meetings=meeting_count or 0,
                total_action_items=total_actions or 0,
                pending_action_items=pending_actions or 0
            )
    
    except Exception as e:
        print(f"Profile error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current user information"""
    return current_user
