"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Upload, FileText, Mic, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { uploadTranscript } from "../services/api"

const UploadModal = ({ isOpen, onClose }) => {
  const [uploadType, setUploadType] = useState("text")
  const [file, setFile] = useState(null)
  const [textContent, setTextContent] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("idle") // idle, uploading, processing, success, error
  const [processingStage, setProcessingStage] = useState("")
  const [validationError, setValidationError] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerRef, setTimerRef] = useState(null)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef) {
        clearInterval(timerRef)
      }
    }
  }, [timerRef])

  // Timer for tracking upload time
  const startTimer = useCallback(() => {
    const start = Date.now()
    setStartTime(start)
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return timer
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const uploadMutation = useMutation({
    mutationFn: ({ data, onProgress }) => uploadTranscript(data, onProgress),
    onMutate: () => {
      setUploadProgress(0)
      setProcessingStage("Starting upload...")
      const timer = startTimer()
      setTimerRef(timer)
    },
    onSuccess: (data) => {
      console.log("✅ Upload successful - starting AI processing...")
      
      // Simple flow: Upload done → AI Processing → Complete
      setUploadStatus("processing")
      setUploadProgress(50)//Show 100% during processing  
      setProcessingStage("Processing...")
      
      // Wait for processing to complete (simplified - just wait and show success)
      setTimeout(() => {
        setUploadStatus("success")
        setProcessingStage("Complete!")
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["recentMeetings"] })
        queryClient.invalidateQueries({ queryKey: ["allMeetings"] })
        queryClient.invalidateQueries({ queryKey: ["actionItems"] })
        
        // Auto-close after showing success
        setTimeout(() => {
          onClose()
          resetForm()
        }, 2000)
      }, 3000) // Wait 3 seconds to simulate processing
    },
    onError: (error) => {
      console.error("Upload failed:", error)
      setUploadStatus("error")
      setProcessingStage("Upload failed. Please try again.")
      
      if (timerRef) {
        clearInterval(timerRef)
        setTimerRef(null)
      }
    },
  })

  const resetForm = () => {
    setFile(null)
    setTextContent("")
    setUploadProgress(0)
    setUploadStatus("idle")
    setValidationError("")
    setElapsedTime(0)
    setStartTime(null)
    setIsDragOver(false)
    setProcessingStage("")
    
    if (timerRef) {
      clearInterval(timerRef)
      setTimerRef(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError("")

    if (uploadType === "text" && !textContent.trim()) {
      setValidationError("Please enter a meeting transcript")
      return
    }
    
    if (uploadType === "file" && !file) {
      setValidationError("Please select a file to upload")
      return
    }

    if (uploadType === "text" && textContent.trim()) {
      setUploadStatus("processing")
      await uploadMutation.mutateAsync({ data: { type: "text", content: textContent } })
    } else if (uploadType === "file" && file) {
      setUploadStatus("uploading")
      setUploadProgress(0)
      
      const formData = new FormData()
      formData.append("file", file)
      
      await uploadMutation.mutateAsync({
        data: { type: "file", content: formData },
        onProgress: (progress) => {
          console.log(`📤 Upload progress: ${progress}%`)
          setUploadProgress(progress)
          setProcessingStage(`Uploading ${file.name}...`)
          
          if (progress >= 100) {
            setUploadStatus("processing")
            setProcessingStage("Upload complete, starting AI analysis...")
          }
        }
      })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    const audioFile = droppedFiles.find(file => 
      file.type.startsWith('audio/') || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.docx')
    )
    
    if (audioFile) {
      setFile(audioFile)
      setUploadType("file")
    }
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setValidationError("")
    }
  }

  if (!isOpen) return null

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "uploading":
      case "processing":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case "uploading":
        return "Uploading file..."
      case "processing":
        return "Processing with AI..."
      case "success":
        return "Upload successful!"
      case "error":
        return "Upload failed. Please try again."
      default:
        return ""
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Upload className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Content
            </h2>
          </div>
          <button 
            onClick={() => { onClose(); resetForm(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status Display */}
        {uploadStatus !== "idle" && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon()}
              <span className="font-medium text-gray-900 text-sm">{getStatusText()}</span>
            </div>
            
            {(uploadStatus === "uploading" || uploadStatus === "processing") && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  {processingStage && (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>{processingStage}</span>
                    </div>
                  )}
                  
                  {uploadStatus === "processing" ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="font-semibold text-green-600">AI Processing</div>
                        <div className="text-gray-600">2-3 min avg</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="font-semibold text-blue-600">{formatTime(elapsedTime)}</div>
                        <div className="text-gray-600">Elapsed</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Progress: {uploadProgress.toFixed(0)}%</span>
                      <span>Time: {formatTime(elapsedTime)}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Validation Error Display */}
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{validationError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* Upload Type Selector */}
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setUploadType("text")}
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border transition-all text-sm ${
                  uploadType === "text" 
                    ? "border-blue-500 bg-blue-50 text-blue-700" 
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
              >
                <FileText className="h-4 w-4" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadType("file")}
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border transition-all text-sm ${
                  uploadType === "file" 
                    ? "border-blue-500 bg-blue-50 text-blue-700" 
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
              >
                <Mic className="h-4 w-4" />
                <span>Audio</span>
              </button>
            </div>

            {/* Content Input */}
            {uploadType === "text" ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meeting Transcript
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => {
                    setTextContent(e.target.value)
                    setValidationError("")
                  }}
                  placeholder="Paste your meeting transcript here..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400 text-sm"
                  disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                />
                <p className="text-xs text-gray-500">
                  {textContent.length} characters
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Audio File or Document
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                    isDragOver 
                      ? "border-blue-400 bg-blue-50" 
                      : file
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.txt,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                  />
                  
                  {file ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 text-xs"
                        disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload className={`h-8 w-8 mx-auto mb-2 transition-all ${
                        isDragOver ? "text-blue-500" : "text-gray-400"
                      }`} />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {isDragOver ? "Drop file here" : "Click to browse or drag & drop"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Audio, .txt, or .docx files
                      </p>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
              disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                uploadStatus === "uploading" || 
                uploadStatus === "processing" || 
                uploadStatus === "success" ||
                (uploadType === "text" && !textContent.trim()) ||
                (uploadType === "file" && !file)
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
            >
              {uploadStatus === "uploading" ? "Uploading..." : 
               uploadStatus === "processing" ? "Processing..." :
               uploadStatus === "success" ? "Success!" :
               "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal