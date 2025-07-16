// Add this function to the existing api.js file
export const fetchMeetingById = async (id) => {
  try {
    const response = await api.get(`/meetings/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching meeting details:", error)
    throw error
  }
}
