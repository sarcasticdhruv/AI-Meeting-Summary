FROM python:3.11-slim

WORKDIR /app

# Use Python 3.11 slim for smaller memory footprint
FROM python:3.11-slim

WORKDIR /app

# Install only essential system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with memory optimization
RUN pip install --no-cache-dir --no-deps -r requirements.txt && \
    pip cache purge && \
    rm -rf ~/.cache/pip

# Pre-download only the tiny model to /tmp for memory efficiency
RUN python -c "from faster_whisper import WhisperModel; import os; import shutil; import gc; model = WhisperModel('tiny', device='cpu', compute_type='int8', download_root='/tmp'); print('✅ Faster-whisper tiny model pre-downloaded successfully'); del model; gc.collect()" && \
    echo "✅ Model download completed"

# Copy the application code
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Create necessary directories
RUN mkdir -p tmp uploads

# Expose port 10000 (Render's default) but app will use PORT env var
EXPOSE 10000

# Command to run the application
CMD ["./start.sh"]
