#!/bin/bash

# AI Meeting Summary Backend Startup Script for Codespaces

echo "🚀 Starting AI Meeting Summary Backend in Codespaces..."

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "📁 Navigating to backend directory..."
    cd backend
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your actual values before starting the server"
    echo ""
    echo "Required environment variables:"
    echo "- POSTGRES_URL: Your PostgreSQL database connection string"
    echo "- GEMINI_API_KEY: Your Google Gemini API key"
    echo ""
    echo "Edit the .env file and run this script again."
    exit 1
fi

# Check if required environment variables are set
source .env
if [ -z "$POSTGRES_URL" ] || [ "$POSTGRES_URL" = "postgresql://username:password@host:port/database_name" ]; then
    echo "❌ POSTGRES_URL not configured in .env file"
    echo "Please set your database connection string in the .env file"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo "❌ GEMINI_API_KEY not configured in .env file"
    echo "Please set your Gemini API key in the .env file"
    exit 1
fi

# Create necessary directories
mkdir -p tmp uploads

# Install dependencies if needed
echo "📦 Checking Python dependencies..."
pip install -r requirements.txt

# Test database connection
echo "🔍 Testing database connection..."
python -c "
import asyncio
import os
from dotenv import load_dotenv
import asyncpg

async def test_db():
    load_dotenv()
    try:
        conn = await asyncpg.connect(os.getenv('POSTGRES_URL'))
        await conn.close()
        print('✅ Database connection successful')
        return True
    except Exception as e:
        print(f'❌ Database connection failed: {e}')
        return False

if not asyncio.run(test_db()):
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection test failed. Please check your POSTGRES_URL"
    exit 1
fi

# Start the server
echo "🌟 Starting FastAPI backend server..."
echo "📍 Backend API will be available at: https://$CODESPACE_NAME-8000.preview.app.github.dev"
echo "🔧 API docs will be available at: https://$CODESPACE_NAME-8000.preview.app.github.dev/docs"
echo "🌐 Your frontend is deployed at: https://meetsnap.onrender.com/"
echo ""
echo "⚠️  Remember to update your frontend's API URL to point to this Codespace backend!"
echo ""

python main.py
