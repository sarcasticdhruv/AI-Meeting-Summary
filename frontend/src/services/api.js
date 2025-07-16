import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ This function handles uploading a transcript as plain text
export const uploadTranscript = async (data) => {
  try {
    const endpoint = data.type === "text" ? "/upload/transcript" : "/upload/audio";
    let payload;
    let config = {};
    
    if (data.type === "text") {
      payload = { content: data.content };
    } else {
      payload = data.content; // FormData for file uploads
      config.headers = { "Content-Type": "multipart/form-data" };
    }
    
    const response = await api.post(endpoint, payload, config);
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
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
