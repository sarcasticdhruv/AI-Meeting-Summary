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

# Pre-download only the tiny Whisper model to save memory
# Tiny model is ~39MB vs base model ~74MB
RUN python -c "import whisper; whisper.load_model('tiny')" && \
    echo "✅ Whisper tiny model pre-downloaded successfully"

# Copy the application code
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Create necessary directories
RUN mkdir -p tmp uploads

# Expose the port
EXPOSE $PORT

# Command to run the application
CMD ["./start.sh"]
