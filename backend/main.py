from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from datetime import datetime
from contextlib import asynccontextmanager

from routes import upload, meetings, actions, export, email
from db.database import init_database, close_db_pool

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting up the application...")
    await init_database()
    yield
    # Shutdown
    print("🛑 Shutting down the application...")
    await close_db_pool()

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
async def root():
    return {"message": "AI Meeting Summary API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting server on 0.0.0.0:{port}")
    print(f"🌍 Environment PORT: {os.getenv('PORT', 'Not set')}")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Disable reload in production
    )
