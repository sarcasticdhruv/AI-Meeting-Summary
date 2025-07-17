"use client"

import { useState, useRef, useCallback } from "react"
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
  const [processingStage, setProcessingStage] = useState("") // For detailed progress during processing
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null)
  const [validationError, setValidationError] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerRef, setTimerRef] = useState(null)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()

  // Timer for tracking upload time
  const startTimer = useCallback(() => {
    const start = Date.now()
    setStartTime(start)
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return timer
  }, [])

  // Simulate realistic processing stages for better UX during AI processing
  const simulateProcessingProgress = useCallback(() => {
    setProcessingStage("Initializing AI models...")
    setUploadProgress(10)
    setEstimatedTimeRemaining(180) // 3 minutes

    const stages = [
      { stage: "Loading audio processing models...", progress: 15, delay: 3000, timeRemaining: 170 },
      { stage: "Transcribing audio with AI (this may take 2-3 minutes)...", progress: 25, delay: 8000, timeRemaining: 150 },
      { stage: "Processing speech recognition...", progress: 40, delay: 30000, timeRemaining: 120 },
      { stage: "Refining transcription accuracy...", progress: 60, delay: 60000, timeRemaining: 90 },
      { stage: "Analyzing transcript content...", progress: 80, delay: 30000, timeRemaining: 45 },
      { stage: "Generating meeting insights...", progress: 90, delay: 10000, timeRemaining: 15 },
      { stage: "Extracting action items and key points...", progress: 95, delay: 8000, timeRemaining: 5 },
      { stage: "Finalizing results...", progress: 98, delay: 3000, timeRemaining: 2 }
    ]

    let currentStageIndex = 0
    
    const updateStage = () => {
      if (currentStageIndex >= stages.length) return
      
      const currentStage = stages[currentStageIndex]
      setProcessingStage(currentStage.stage)
      setUploadProgress(currentStage.progress)
      setEstimatedTimeRemaining(currentStage.timeRemaining)
      
      const timer = setTimeout(() => {
        currentStageIndex++
        updateStage()
      }, currentStage.delay)
      
      return timer
    }
    
    // Start the first stage immediately
    setTimeout(updateStage, 1000)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const uploadMutation = useMutation({
    mutationFn: ({ data, onProgress }) => uploadTranscript(data, onProgress),
    onMutate: () => {
      setUploadProgress(5)
      setProcessingStage("Uploading file...")
      setEstimatedTimeRemaining(180)
      const timer = startTimer()
      setTimerRef(timer)
      
      // Start realistic progress simulation after initial upload
      setTimeout(() => {
        simulateProcessingProgress()
      }, 2000)
    },
    onSuccess: (data) => {
      console.log("Upload successful:", data)
      setUploadStatus("success")
      setUploadProgress(100)
      setProcessingStage("Processing completed successfully!")
      setEstimatedTimeRemaining(0)
      
      if (timerRef) {
        clearInterval(timerRef)
        setTimerRef(null)
      }
      
      // Invalidate and refetch meetings data
      queryClient.invalidateQueries({ queryKey: ["recentMeetings"] })
      queryClient.invalidateQueries({ queryKey: ["allMeetings"] })
      queryClient.invalidateQueries({ queryKey: ["actionItems"] })
      
      // Close modal after a brief success display
      setTimeout(() => {
        onClose()
        resetForm()
      }, 2000)
    },
    onError: (error) => {
      console.error("Upload failed:", error)
      setUploadStatus("error")
      setProcessingStage("Processing failed. Please try again.")
      setEstimatedTimeRemaining(0)
      
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
    setEstimatedTimeRemaining(0)
    
    if (timerRef) {
      clearInterval(timerRef)
      setTimerRef(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError("")

    // Manual validation for better UX
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
      const timer = startTimer()
      
      try {
        await uploadMutation.mutateAsync({ data: { type: "text", content: textContent } })
      } finally {
        clearInterval(timer)
      }
    } else if (uploadType === "file" && file) {
      setUploadStatus("uploading")
      setUploadProgress(0)
      const timer = startTimer()
      
      try {
        const formData = new FormData()
        formData.append("file", file)
        
        // Use real progress tracking from axios
        await uploadMutation.mutateAsync({
          data: { type: "file", content: formData },
          onProgress: (progress) => {
            setUploadProgress(progress)
            if (progress >= 99) {
              setUploadStatus("processing")
            }
          }
        })
      } finally {
        clearInterval(timer)
      }
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
      setValidationError("") // Clear validation error
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              <span className="hidden sm:inline">Upload Meeting Content</span>
              <span className="sm:hidden">Upload Content</span>
            </h2>
          </div>
          <button 
            onClick={() => { onClose(); resetForm(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Status Display */}
        {uploadStatus !== "idle" && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
              {getStatusIcon()}
              <span className="font-medium text-gray-900 text-sm sm:text-base">{getStatusText()}</span>
            </div>
            
            {(uploadStatus === "uploading" || uploadStatus === "processing") && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                {/* Enhanced Progress Information */}
                <div className="space-y-2 text-sm text-gray-600">
                  {processingStage && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{processingStage}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span>Progress: {uploadProgress.toFixed(0)}%</span>
                    {estimatedTimeRemaining > 0 && (
                      <span className="text-blue-600 font-medium">
                        ~{Math.ceil(estimatedTimeRemaining / 60)} min remaining
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Time: {formatTime(elapsedTime)}</span>
                    {uploadType === "file" && uploadStatus === "processing" && (
                      <span className="text-orange-600 text-xs">
                        AI processing typically takes 2-3 minutes
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Validation Error Display */}
        {validationError && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-medium text-sm sm:text-base">{validationError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 sm:mb-6">
            {/* Upload Type Selector */}
            <div className="flex space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => setUploadType("text")}
                className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${
                  uploadType === "text" 
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">Text Transcript</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadType("file")}
                className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${
                  uploadType === "file" 
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">Audio File</span>
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
                    setValidationError("") // Clear validation error when typing
                  }}
                  placeholder="Paste your meeting transcript here..."
                  className="w-full h-32 sm:h-40 p-3 sm:p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-sm sm:text-base"
                  disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  {textContent.length} characters
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Audio File or Document
                </label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
                    isDragOver 
                      ? "border-blue-400 bg-blue-50 scale-105" 
                      : file
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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
                    <div className="space-y-2 sm:space-y-3">
                      <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{file.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload className={`h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 transition-all duration-300 ${
                        isDragOver ? "text-blue-500 scale-110" : "text-gray-400"
                      }`} />
                      <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                        <span className="hidden sm:inline">
                          {isDragOver ? "Drop your file here" : "Drop files here or click to browse"}
                        </span>
                        <span className="sm:hidden">
                          {isDragOver ? "Drop file here" : "Click to browse"}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Supports audio files, .txt, and .docx documents
                      </p>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm sm:text-base"
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
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none text-sm sm:text-base"
            >
              <span className="hidden sm:inline">
                {uploadStatus === "uploading" ? "Uploading..." : 
                 uploadStatus === "processing" ? "Processing..." :
                 uploadStatus === "success" ? "Success!" :
                 "Upload & Analyze"}
              </span>
              <span className="sm:hidden">
                {uploadStatus === "uploading" ? "Uploading..." : 
                 uploadStatus === "processing" ? "Processing..." :
                 uploadStatus === "success" ? "Success!" :
                 "Upload"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal
