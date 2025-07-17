# 🔗 Connecting Your Deployed Frontend to Codespace Backend

## Current Setup
- **Frontend**: Already deployed at `https://meetsnap.onrender.com/`
- **Backend**: Will run in GitHub Codespaces

## Quick Connection Guide

### 1. 🚀 Start Your Codespace Backend
```bash
# In your Codespace terminal
./start-backend.sh
```

### 2. 📋 Get Your Backend URL
After starting, your backend will be available at:
```
https://[your-codespace-name]-8000.preview.app.github.dev
```

### 3. 🔧 Update Frontend API Configuration

You need to update your frontend's API configuration to point to your Codespace backend. 

#### Option A: Update Environment Variables (Recommended)
If your frontend uses environment variables for API URL:

1. Go to your Render dashboard for the frontend
2. Navigate to Environment Variables
3. Update/Add:
   ```
   VITE_API_URL=https://[your-codespace-name]-8000.preview.app.github.dev
   ```
4. Redeploy your frontend

#### Option B: Update API Service File
If you need to update the code directly, check your frontend's API service file (likely `src/services/api.js`):

```javascript
// Update this line
const API_BASE_URL = 'https://[your-codespace-name]-8000.preview.app.github.dev';
```

### 4. 🧪 Test the Connection

1. Open your frontend: `https://meetsnap.onrender.com/`
2. Try uploading a file or accessing any API endpoint
3. Check browser developer tools for any CORS errors

### 5. 🔄 Development Workflow

For development, you can switch between backends:

**Use Codespace Backend (Development):**
```env
VITE_API_URL=https://[codespace-name]-8000.preview.app.github.dev
```

**Use Render Backend (Production):**
```env
VITE_API_URL=https://ai-meeting-backend-api.onrender.com
```

## 🛠️ Troubleshooting

### CORS Issues
If you see CORS errors, ensure your Codespace backend URL is properly added to the CORS origins (already configured in `main.py`).

### Connection Refused
- Make sure your Codespace backend is running
- Check if the port (8000) is properly forwarded
- Verify the Codespace URL format

### API Not Found (404)
- Ensure your frontend is using the correct API endpoints
- Check the API documentation at `https://[codespace-name]-8000.preview.app.github.dev/docs`

## 📱 Mobile Testing

Your Codespace backend URL is publicly accessible, so you can test your deployed frontend from mobile devices too!

## 🔒 Security Note

Codespace URLs are public but temporary. For production, always use your deployed backend on Render.
