# 🚀 GitHub Codespaces Quick Deployment Guide

## Step-by-Step Deployment

### 1. 🎯 Launch Codespace
1. Go to your GitHub repository
2. Click **"Code"** → **"Codespaces"** → **"Create codespace on main"**
3. Wait for Codespace to initialize (2-3 minutes)

### 2. 🔧 Set Up Environment
```bash
# Make scripts executable
chmod +x start-backend.sh test-codespaces.py

# Configure environment variables
cd backend
cp .env.example .env
code .env  # Edit in VS Code
```

### 3. 📝 Configure .env File
Update `backend/.env` with your actual values:

```env
# Required: Database URL (get from Neon.tech - free)
POSTGRES_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/database_name?sslmode=require

# Required: Gemini API Key (get from Google AI Studio)
GEMINI_API_KEY=your_actual_api_key_here

# Optional: Server port
PORT=8000
```

### 4. 🗄️ Database Setup (Neon - Recommended)
1. Visit [neon.tech](https://neon.tech)
2. Create free account
3. Create new project
4. Copy connection string to `.env`

### 5. 🤖 Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Add to `.env` file

### 6. 🚀 Start Backend
```bash
# Test everything first
python test-codespaces.py

# Start the backend
./start-backend.sh
```

### 7. 🌐 Connect to Your Deployed Frontend
Your frontend is already deployed at: `https://meetsnap.onrender.com/`

Update your frontend's API URL to point to your Codespace backend:
```
https://[codespace-name]-8000.preview.app.github.dev
```

See `FRONTEND_CONNECTION.md` for detailed instructions.

### 8. 🧪 Test Your Deployment
```bash
# Run comprehensive tests
python test-codespaces.py

# Test specific endpoint
curl https://[your-codespace-url]/health
```

## 🎉 You're Done!

Your AI Meeting Summary backend is now running in GitHub Codespaces!

### Next Steps:
- Test API endpoints at `/docs`
- Update frontend API URL (see `FRONTEND_CONNECTION.md`)
- Test file upload from your deployed frontend
- Configure email service (optional)

## 📞 Need Help?
- Check the full guide: `CODESPACES_GUIDE.md`
- Run tests: `python test-codespaces.py`
- Check logs: Look at terminal output
