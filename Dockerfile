# Unified Dockerfile for Frontend + Backend
# Multi-stage build for optimal production deployment

# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci --silent

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Python Backend Environment
FROM python:3.11-slim AS backend-setup
WORKDIR /app

# Install system dependencies for FFmpeg and build tools
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    curl \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt && \
    pip cache purge

# Stage 3: Final Production Image
FROM python:3.11-slim
WORKDIR /app

# Install runtime dependencies (remove nginx and supervisor since we'll run FastAPI directly)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy Python packages from backend-setup stage
COPY --from=backend-setup /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-setup /usr/local/bin /usr/local/bin

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy backend application code
COPY backend/ ./backend/

# Create necessary directories
RUN mkdir -p /app/backend/tmp /app/backend/uploads /app/backend/logs

# Create startup script with Whisper model pre-loading
RUN echo '#!/bin/bash\n\
echo "Starting Unified Meeting Insights Application..."\n\
echo "Backend: $(python --version)"\n\
echo "Frontend: React (built and served by FastAPI)"\n\
echo "Working directory: $(pwd)"\n\
echo "Port: ${PORT:-8080}"\n\
\n\
# Pre-download Whisper model for faster startups\n\
echo "🔄 Initializing Whisper model..."\n\
cd /app/backend\n\
python -c "try:\n\
    from faster_whisper import WhisperModel\n\
    model = WhisperModel(\"tiny\", device=\"cpu\", compute_type=\"int8\", download_root=\"/tmp\")\n\
    print(\"✅ Whisper model ready\")\n\
    del model\n\
    import gc; gc.collect()\n\
except Exception as e:\n\
    print(f\"⚠️  Model will be downloaded on first use: {e}\")\n\
"\n\
\n\
echo "Starting FastAPI server..."\n\
cd /app/backend\n\
exec python main.py' > /app/start.sh && \
chmod +x /app/start.sh

# Use PORT environment variable (Render sets this automatically)
EXPOSE $PORT

# Health check for better deployment monitoring
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Start the unified application
CMD ["./start.sh"]
