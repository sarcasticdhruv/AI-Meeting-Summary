# AI Meeting Summary + CRM Note Generator

A full-stack application that processes meeting transcripts using AI to generate summaries, action items, and CRM notes.

## Features

- 📝 Upload text transcripts or audio files
- 🤖 AI-powered analysis using Google Gemini
- 📊 Meeting summaries and action items
- 💼 CRM-ready notes for sales follow-up
- 🎯 Track action items and objections
- 📤 Export functionality
- 📧 Email summaries

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory:
   ```env
   POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8000
   ```

4. Test your database connection:
   ```bash
   python test_db.py
   ```

5. Start the backend server:
   ```bash
   python main.py
   ```

   The backend will run on http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:5173

### Using VS Code Tasks

This project includes VS Code tasks for easier development:

1. **Start Backend Server** - Runs the Python backend
2. **Start Frontend Server** - Runs the React frontend  
3. **Start Both Servers** - Runs both servers simultaneously

Open VS Code and use Ctrl+Shift+P → "Tasks: Run Task" to select a task.

## Usage

1. Open the frontend application
2. Click "Upload Transcript" 
3. Paste your meeting transcript or upload an audio file
4. The AI will analyze and extract:
   - Meeting title and summary
   - Action items with priorities
   - Client objections and responses
   - CRM notes for follow-up

## API Endpoints

- `POST /upload/transcript` - Upload text transcript
- `POST /upload/audio` - Upload audio file
- `GET /meetings` - Get all meetings
- `GET /meetings/recent` - Get recent meetings
- `GET /action-items` - Get all action items
- `GET /action-items/upcoming` - Get upcoming action items
- `PATCH /action-items/{id}` - Update action item
- `POST /email/summary` - Send email summary
- `GET /export/meetings` - Export meetings data

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL (Neon)
- Google Gemini AI
- Uvicorn server

**Frontend:**
- React + Vite
- TailwindCSS
- React Query
- Axios

## Environment Variables

Create a `.env` file in the backend directory:

```env
POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require
GEMINI_API_KEY=your_google_gemini_api_key
PORT=8000
```

## Database Schema

The app uses PostgreSQL with two main tables:

- `meetings` - Stores meeting data, summaries, and transcripts
- `action_items` - Stores individual action items linked to meetings

The database automatically creates these tables on first run.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
