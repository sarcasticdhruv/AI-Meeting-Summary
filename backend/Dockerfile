FROM python:3.11-slim

WORKDIR /app

# Use Python 3.11 slim for smaller memory footprint
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including multimedia libraries for faster-whisper
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    build-essential \
    pkg-config \
    libavcodec-dev \
    libavformat-dev \
    libavutil-dev \
    libavdevice-dev \
    libavfilter-dev \
    libswscale-dev \
    libswresample-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies properly (remove --no-deps flag)
RUN pip install --no-cache-dir -r requirements.txt && \
    pip cache purge && \
    rm -rf ~/.cache/pip

# Pre-download the tiny model at runtime instead of build time to avoid build issues
# Create a script to download models on first startup
RUN echo '#!/bin/bash\n\
echo "🔄 Checking for Whisper model..."\n\
python -c "try:\n\
    from faster_whisper import WhisperModel\n\
    import os\n\
    model = WhisperModel(\"tiny\", device=\"cpu\", compute_type=\"int8\", download_root=\"/tmp\")\n\
    print(\"✅ Faster-whisper tiny model ready\")\n\
    del model\n\
    import gc; gc.collect()\n\
except Exception as e:\n\
    print(f\"⚠️ Model download will happen at runtime: {e}\")\n\
"\n\
echo "🚀 Starting application..."\n\
exec python main.py' > /app/start_with_model.sh && \
chmod +x /app/start_with_model.sh

# Copy the application code
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Create necessary directories
RUN mkdir -p tmp uploads

# Expose port 10000 (Render's default) but app will use PORT env var
EXPOSE 10000

# Use the model-aware startup script
CMD ["./start_with_model.sh"]
