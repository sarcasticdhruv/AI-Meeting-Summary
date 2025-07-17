# 🚀 GitHub Codespaces Deployment Guide

## Quick Start

### 1. Environment Setup
After your Codespace starts, run these commands:

```bash
# Make the startup script executable
chmod +x start-backend.sh

# Set up your environment variables
cd backend
cp .env.example .env
nano .env  # or use VS Code to edit
```

### 2. Configure Environment Variables

Update your `backend/.env` file with:

```env
# Database Configuration (Required)
POSTGRES_URL=postgresql://username:password@host:port/database_name

# For Neon PostgreSQL (Recommended for free tier):
# POSTGRES_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/database_name?sslmode=require

# AI Service Configuration (Required)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Server Configuration
PORT=8000
```

### 3. Database Setup Options

#### Option A: Neon PostgreSQL (Recommended - Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create a new project
4. Copy the connection string to your `.env` file

#### Option B: Supabase PostgreSQL
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string to your `.env` file

#### Option C: Local PostgreSQL in Codespace
```bash
# Install PostgreSQL in Codespace
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Create database and user
sudo -u postgres createdb ai_meeting_db
sudo -u postgres psql -c "CREATE USER meeting_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_meeting_db TO meeting_user;"

# Update .env file
POSTGRES_URL=postgresql://meeting_user:your_password@localhost:5432/ai_meeting_db
```

### 4. Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 5. Start the Backend

```bash
# Method 1: Use the startup script (Recommended)
./start-backend.sh

# Method 2: Manual start
cd backend
python main.py
```

### 6. Access Your Application

After starting, your backend will be available at:
- **API**: `https://your-codespace-name-8000.preview.app.github.dev`
- **API Docs**: `https://your-codespace-name-8000.preview.app.github.dev/docs`
- **Health Check**: `https://your-codespace-name-8000.preview.app.github.dev/health`

### 7. Start Frontend (Optional)

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `https://your-codespace-name-3000.preview.app.github.dev`

## 🔧 Development Commands

### Backend Commands
```bash
cd backend

# Start development server
python main.py

# Run tests
python test_db.py
python test_db_operations.py
python test_ffmpeg_setup.py

# Check dependencies
pip list

# Update dependencies
pip install -r requirements.txt
```

### Frontend Commands
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your `POSTGRES_URL` in `.env`
   - Ensure your database is running and accessible
   - Test connection: `python -c "import asyncpg; print('OK')"`

2. **Missing Environment Variables**
   - Ensure `.env` file exists in `backend/` directory
   - Check all required variables are set
   - Restart the server after updating `.env`

3. **FFmpeg Not Found**
   - FFmpeg should be installed automatically
   - Manual install: `sudo apt-get install ffmpeg`

4. **Port Already in Use**
   - Kill existing process: `lsof -ti:8000 | xargs kill -9`
   - Or change port in `.env`: `PORT=8001`

5. **Module Import Errors**
   - Reinstall dependencies: `pip install -r requirements.txt`
   - Check Python version: `python --version` (should be 3.11+)

## 📚 API Endpoints

Once running, visit `/docs` for interactive API documentation:
- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /upload/` - Upload audio files
- `GET /meetings/` - List meetings
- `GET /meetings/{id}` - Get meeting details
- `POST /action-items/` - Create action items
- `GET /export/{id}/{format}` - Export meeting data

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use strong passwords for database connections
- Regularly rotate API keys
- Keep dependencies updated

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `POSTGRES_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | `AIza...` |
| `PORT` | No | Server port (default: 8000) | `8000` |

## 🎯 Next Steps

1. Configure your environment variables
2. Test the API endpoints
3. Upload an audio file to test transcription
4. Set up your frontend deployment
5. Configure email service (optional)
6. Set up monitoring and logging
