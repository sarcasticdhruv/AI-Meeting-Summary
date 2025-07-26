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

# Install system dependencies for FFmpeg, nginx, and supervisor
RUN apt-get update && apt-get install -y \
    ffmpeg \
    nginx \
    supervisor \
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

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy Python packages from backend-setup stage
COPY --from=backend-setup /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-setup /usr/local/bin /usr/local/bin

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Copy backend application code
COPY backend/ ./backend/

# Create necessary directories
RUN mkdir -p /app/backend/tmp /app/backend/uploads /app/backend/logs /var/log/supervisor

# Create nginx configuration for frontend + API proxy
RUN echo 'server {\n\
    listen 8080;\n\
    server_name localhost;\n\
    root /var/www/html;\n\
    index index.html;\n\
\n\
    # Serve React frontend\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Proxy API requests to FastAPI backend\n\
    location /api/ {\n\
        proxy_pass http://127.0.0.1:8000/;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_timeout 300s;\n\
        proxy_read_timeout 300s;\n\
    }\n\
\n\
    # Direct health check proxy (for Render health checks)\n\
    location /health {\n\
        proxy_pass http://127.0.0.1:8000/health;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
\n\
    # Cache static assets\n\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    # Security headers\n\
    add_header X-Frame-Options DENY;\n\
    add_header X-Content-Type-Options nosniff;\n\
    add_header X-XSS-Protection "1; mode=block";\n\
\n\
    # Gzip compression\n\
    gzip on;\n\
    gzip_comp_level 6;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\n\
}' > /etc/nginx/sites-available/default

# Remove default nginx config and link our config
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Create supervisor configuration
RUN echo '[supervisord]\n\
nodaemon=true\n\
user=root\n\
logfile=/var/log/supervisor/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
stdout_logfile=/var/log/supervisor/nginx.log\n\
stderr_logfile=/var/log/supervisor/nginx.log\n\
autorestart=true\n\
priority=100\n\
\n\
[program:fastapi]\n\
command=python /app/backend/main.py\n\
directory=/app/backend\n\
stdout_logfile=/var/log/supervisor/fastapi.log\n\
stderr_logfile=/var/log/supervisor/fastapi.log\n\
autorestart=true\n\
priority=200\n\
environment=PORT="8000"\n\
' > /etc/supervisor/conf.d/supervisord.conf

# Create startup script with Whisper model pre-loading
RUN echo '#!/bin/bash\n\
echo "🚀 Starting Unified Meeting Insights Application..."\n\
echo "🐍 Backend: $(python --version)"\n\
echo "🌐 Frontend: React (built)"\n\
echo "📂 Working directory: $(pwd)"\n\
echo "🌐 Port: ${PORT:-8080}"\n\
\n\
# Update nginx to listen on the PORT env var (for Render)\n\
sed -i "s/listen 8080;/listen ${PORT:-8080};/" /etc/nginx/sites-available/default\n\
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
echo "🎯 Starting services with supervisor..."\n\
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf' > /app/start.sh && \
chmod +x /app/start.sh

# Use PORT environment variable (Render sets this automatically)
EXPOSE $PORT

# Health check for better deployment monitoring
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Start the unified application
CMD ["./start.sh"]
