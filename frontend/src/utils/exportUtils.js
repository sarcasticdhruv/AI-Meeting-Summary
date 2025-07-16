export const exportToJSON = (data, filename = "export.json") => {
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

  const linkElement = document.createElement("a")
  linkElement.setAttribute("href", dataUri)
  linkElement.setAttribute("download", filename)
  linkElement.click()
}

export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Handle arrays and objects
          if (Array.isArray(value)) {
            return `"${value.join("; ")}"`
          }
          if (typeof value === "object" && value !== null) {
            return `"${JSON.stringify(value)}"`
          }
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || "")
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const formatDataForExport = (meetings) => {
  return meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    summary: meeting.summary,
    client: meeting.client || "N/A",
    participants: meeting.participants || 0,
    duration: meeting.duration || "N/A",
    created_at: meeting.created_at,
    action_items_count: meeting.action_items?.length || 0,
    action_items: meeting.action_items?.map((item) => (typeof item === "string" ? item : item.task)).join("; ") || "",
  }))
}
