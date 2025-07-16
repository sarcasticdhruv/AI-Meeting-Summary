import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
      timeout: 300000, // 5 minute timeout for large files
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

export const sendEmailSummary = async (meetingId, email) => {
  try {
    const response = await api.post("/email/summary", { meetingId, email })
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
