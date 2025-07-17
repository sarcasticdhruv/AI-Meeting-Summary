FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Whisper models to avoid runtime downloads and memory issues
# This downloads the models during build time instead of runtime
RUN python -c "import whisper; whisper.load_model('tiny')" && \
    python -c "import whisper; whisper.load_model('base')" && \
    echo "✅ Whisper models pre-downloaded successfully"

# Copy the application code
COPY . .

# Create necessary directories
RUN mkdir -p tmp uploads

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["python", "main.py"]
