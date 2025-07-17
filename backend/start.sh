#!/bin/bash

# Render deployment startup script
echo "🚀 Starting AI Meeting Summary API on Render..."
echo "📍 Port: ${PORT:-8000}"
echo "🌍 Host: 0.0.0.0"

# Start the application
exec python main.py
