"use client"

import { useState } from "react"
import { X, Upload, FileText, Mic } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadTranscript } from "../services/api"

const UploadModal = ({ isOpen, onClose }) => {
  const [uploadType, setUploadType] = useState("text")
  const [file, setFile] = useState(null)
  const [textContent, setTextContent] = useState("")
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: uploadTranscript,
    onSuccess: (data) => {
      console.log("Upload successful:", data)
      // Invalidate and refetch meetings data
      queryClient.invalidateQueries({ queryKey: ["recentMeetings"] })
      queryClient.invalidateQueries({ queryKey: ["allMeetings"] })
      queryClient.invalidateQueries({ queryKey: ["actionItems"] })
      onClose()
      // Reset form
      setFile(null)
      setTextContent("")
    },
    onError: (error) => {
      console.error("Upload failed:", error)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (uploadType === "text" && textContent.trim()) {
      uploadMutation.mutate({ type: "text", content: textContent })
    } else if (uploadType === "file" && file) {
      const formData = new FormData()
      formData.append("file", file)
      uploadMutation.mutate({ type: "file", content: formData })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upload Transcript</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadType("text")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  uploadType === "text" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadType("file")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  uploadType === "file" ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-700"
                }`}
              >
                <Mic className="h-4 w-4" />
                <span>Audio File</span>
              </button>
            </div>

            {uploadType === "text" ? (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your meeting transcript here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="audio/*,.txt,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : "Click to upload audio file or transcript"}
                  </p>
                </label>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadMutation.isPending ? "Processing..." : "Upload & Analyze"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal
