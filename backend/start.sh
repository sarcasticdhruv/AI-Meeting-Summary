#!/bin/bash

# Render deployment startup script
echo "🚀 Starting AI Meeting Summary API on Render..."
echo "📍 Port: ${PORT:-8000}"
echo "🌍 Host: 0.0.0.0"
echo "💾 Available Memory: $(cat /proc/meminfo | grep MemTotal)"
echo "🔍 All Environment Variables:"
env | grep -E "(PORT|RENDER)" || echo "No PORT/RENDER env vars found"

# Start the application
exec python main.py
