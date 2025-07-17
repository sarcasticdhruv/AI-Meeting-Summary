#!/bin/bash

# Update package list
sudo apt-get update

# Install system dependencies for audio processing
sudo apt-get install -y \
    ffmpeg \
    wget \
    curl \
    git \
    build-essential

# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p tmp uploads

# Copy environment example file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📋 Created .env file from .env.example"
    echo "⚠️  Please update the .env file with your actual values"
fi

echo "✅ Backend setup complete! Your Codespace is ready."
echo "📝 Next steps:"
echo "   1. Update backend/.env with your database URL and API keys"
echo "   2. Run './start-backend.sh' to start the backend server"
echo "   3. Your frontend is already deployed at: https://meetsnap.onrender.com/"
echo "   4. Update your frontend's API URL to point to your Codespace backend"
echo ""
echo "🔗 After starting the backend, your API will be available at:"
echo "   https://\$CODESPACE_NAME-8000.preview.app.github.dev"
