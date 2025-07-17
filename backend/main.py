from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from datetime import datetime
from contextlib import asynccontextmanager
import logging
import sys

from routes import upload, meetings, actions, export, email
from db.database import init_database, close_db_pool

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup logging for Render deployment
    setup_render_logging()
    
    # Startup
    print("🚀 Starting up the application...", flush=True)
    print("🚀 Starting up the application...", file=sys.stderr, flush=True)
    await init_database()
    yield
    # Shutdown
    print("🛑 Shutting down the application...", flush=True)
    print("🛑 Shutting down the application...", file=sys.stderr, flush=True)
    await close_db_pool()

def setup_render_logging():
    """Setup comprehensive logging for Render deployment"""
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.StreamHandler(sys.stderr)
        ],
        force=True
    )
    
    # Configure uvicorn logger
    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.setLevel(logging.INFO)
    
    # Configure FastAPI logger
    fastapi_logger = logging.getLogger("fastapi")
    fastapi_logger.setLevel(logging.INFO)
    
    print("📊 Logging configured for Render deployment", flush=True)
    print("📊 Logging configured for Render deployment", file=sys.stderr, flush=True)

app = FastAPI(
    title="AI Meeting Summary API",
    description="Backend API for AI Meeting Summary + CRM Note Generator",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local Vite dev server
        "http://localhost:8000",  # Local backend
        "http://localhost:4173",  # Local Vite preview
        "http://localhost:5173",  # Local Vite dev server (alternative port)
        "https://meetsnap.onrender.com",  # Your actual frontend URL
        "https://ai-meeting-backend-api.onrender.com",  # Your actual backend URL
        "https://*.onrender.com"  # Allow all Render domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
# init_database()  # Remove this line since we're using lifespan now

# Include routers
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
app.include_router(actions.router, prefix="/action-items", tags=["actions"])
app.include_router(export.router, prefix="/export", tags=["export"])
app.include_router(email.router, prefix="/email", tags=["email"])

@app.get("/")
@app.head("/")
async def root():
    return {"message": "AI Meeting Summary API is running"}

@app.get("/health")
@app.head("/health")
async def health_check():
    health_status = {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Check Whisper service
    try:
        from routes.upload import whisper_service
        health_status["services"]["whisper"] = "ready" if whisper_service.model else "loading"
    except Exception as e:
        health_status["services"]["whisper"] = f"error: {str(e)}"
    
    # Check database
    try:
        from db.database import pool
        health_status["services"]["database"] = "ready" if pool else "not_connected"
    except Exception as e:
        health_status["services"]["database"] = f"error: {str(e)}"
    
    return health_status

@app.get("/debug/status")
async def debug_status():
    """Detailed debug status for troubleshooting"""
    debug_info = {
        "timestamp": datetime.now().isoformat(),
        "environment": {
            "PORT": os.getenv("PORT", "Not set"),
            "PYTHON_PATH": sys.path[:3],  # First 3 paths only
            "CWD": os.getcwd(),
        },
        "services": {
            "whisper": {},
            "llm": {},
            "database": {}
        }
    }
    
    # Whisper service debug
    try:
        from routes.upload import whisper_service
        debug_info["services"]["whisper"] = {
            "model_loaded": whisper_service.model is not None,
            "model_name": whisper_service.model_name,
            "ffmpeg_available": whisper_service._verify_ffmpeg()
        }
    except Exception as e:
        debug_info["services"]["whisper"]["error"] = str(e)
    
    # LLM service debug
    try:
        from routes.upload import llm_service
        debug_info["services"]["llm"] = {
            "service_available": llm_service is not None,
            "type": type(llm_service).__name__
        }
    except Exception as e:
        debug_info["services"]["llm"]["error"] = str(e)
    
    # Database debug
    try:
        from db.database import pool
        debug_info["services"]["database"] = {
            "pool_exists": pool is not None,
            "pool_type": type(pool).__name__ if pool else None
        }
    except Exception as e:
        debug_info["services"]["database"]["error"] = str(e)
    
    return debug_info

if __name__ == "__main__":
    # Memory optimization for 512MB limit
    import gc
    gc.set_threshold(50, 5, 5)  # More aggressive garbage collection
    
    # Setup logging before anything else
    setup_render_logging()
    
    # Render typically uses port 10000, fallback to 8000 for local dev
    port = int(os.getenv("PORT", 8000))  # Changed back to 8000 for local dev
    print(f"🚀 Starting server on 0.0.0.0:{port}", flush=True)
    print(f"🚀 Starting server on 0.0.0.0:{port}", file=sys.stderr, flush=True)
    print(f"🌍 Environment PORT: {os.getenv('PORT', 'Not set - using default 8000')}", flush=True)
    print(f"💾 Memory optimization enabled", flush=True)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        workers=1,     # Single worker to save memory
        log_level="info",  # Enable info level logging
        access_log=True   # Enable access logs for debugging
    )
