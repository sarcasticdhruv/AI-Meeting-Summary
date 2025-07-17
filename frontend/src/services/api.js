import axios from "axios";

// Use production backend URL when deployed, localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? "https://ai-meeting-backend-api.onrender.com" 
    : "http://localhost:8000");

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment Mode:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ This function handles uploading a transcript as plain text
export const uploadTranscript = async (data, onProgress = null) => {
  try {
    const endpoint = data.type === "text" ? "/upload/transcript" : "/upload/audio";
    let payload;
    let config = {
      timeout: 600000, // 10 minute timeout for audio processing
    };
    
    if (data.type === "text") {
      payload = { content: data.content };
    } else {
      payload = data.content; // FormData for file uploads
      config.headers = { "Content-Type": "multipart/form-data" };
      
      // Add progress tracking for file uploads
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };
      }
    }
    
    const response = await api.post(endpoint, payload, config);
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    
    // Enhanced error messages
    if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout - file might be too large');
    }
    
    if (error.response?.status === 413) {
      throw new Error('File too large - please use a smaller file');
    }
    
    if (error.response?.status === 415) {
      throw new Error('Unsupported file type');
    }
    
    throw error.response?.data || error.message;
  }
}

export const fetchRecentMeetings = async () => {
  try {
    const response = await api.get("/meetings/recent")
    return response.data
  } catch (error) {
    console.error("Error fetching recent meetings:", error)
    throw error
  }
}

export const fetchAllMeetings = async () => {
  try {
    const response = await api.get("/meetings")
    return response.data
  } catch (error) {
    console.error("Error fetching all meetings:", error)
    throw error
  }
}

export const fetchActionItems = async () => {
  try {
    const response = await api.get("/action-items")
    return response.data
  } catch (error) {
    console.error("Error fetching action items:", error)
    throw error
  }
}

export const fetchUpcomingActions = async () => {
  try {
    const response = await api.get("/action-items/upcoming")
    return response.data
  } catch (error) {
    console.error("Error fetching upcoming actions:", error)
    throw error
  }
}

export const fetchMeetingById = async (id) => {
  try {
    const response = await api.get(`/meetings/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching meeting details:", error)
    throw error
  }
}

export const updateActionItem = async (id, updates) => {
  try {
    const response = await api.patch(`/action-items/${id}`, updates)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const exportMeetings = async (format = "json") => {
  try {
    const response = await api.get(`/export/meetings?format=${format}`)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const exportMeeting = async (meetingId, format = "json") => {
  try {
    const response = await api.get(`/export/meeting/${meetingId}?format=${format}`, {
      responseType: 'blob'
    })
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Get filename from headers or use default
    const contentDisposition = response.headers['content-disposition']
    let filename = `meeting_${meetingId}.${format}`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=(.+)/)
      if (filenameMatch) {
        filename = filenameMatch[1].replace(/"/g, '')
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    // If individual meeting export isn't available (404), try alternative approach
    if (error.response?.status === 404) {
      console.log("Individual meeting export not available, using alternative method")
      // Fallback: Get meeting data and export locally
      try {
        const meeting = await fetchMeetingById(meetingId)
        const dataStr = format === 'json' 
          ? JSON.stringify(meeting, null, 2)
          : convertMeetingToCSV(meeting)
          
        const blob = new Blob([dataStr], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `meeting_${meetingId}.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        return true
      } catch (fallbackError) {
        console.error("Fallback export failed:", fallbackError)
        throw new Error("Export failed. Please try again later.")
      }
    }
    throw error.response?.data || error.message
  }
}

// Helper function to convert meeting data to CSV
const convertMeetingToCSV = (meeting) => {
  const headers = ['Field', 'Value']
  const rows = [
    ['ID', meeting.id],
    ['Title', meeting.title],
    ['Summary', meeting.summary || ''],
    ['Created At', meeting.created_at || ''],
    ['Participants', meeting.participants || ''],
    ['Duration', meeting.duration || ''],
    ['CRM Notes', meeting.crm_notes || ''],
  ]
  
  // Add action items
  if (meeting.action_items && meeting.action_items.length > 0) {
    meeting.action_items.forEach((item, index) => {
      const actionItem = typeof item === 'string' ? item : item.task || ''
      rows.push([`Action Item ${index + 1}`, actionItem])
    })
  }
  
  // Add transcript if available
  if (meeting.transcript) {
    rows.push(['Transcript', meeting.transcript])
  }
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

export const sendEmailSummary = async (meetingId, email, includeTranscript = false) => {
  try {
    const response = await api.post("/email/summary", { 
      meeting_id: meetingId, 
      email, 
      include_transcript: includeTranscript 
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const fetchRecentClients = async () => {
  try {
    const response = await api.get("/meetings/clients/recent")
    return response.data.clients
  } catch (error) {
    console.error("Error fetching recent clients:", error)
    throw error
  }
}
