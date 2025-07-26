// "use client"

// import { useState, useRef, useCallback, useEffect } from "react"
// import { flushSync } from "react-dom"
// import { X, Upload, FileText, Mic, CheckCircle, Clock, AlertCircle } from "lucide-react"
// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import { uploadTranscript, getUploadProgress } from "../services/api"

// const UploadModal = ({ isOpen, onClose }) => {
//   const [uploadType, setUploadType] = useState("text")
//   const [file, setFile] = useState(null)
//   const [textContent, setTextContent] = useState("")
//   const [isDragOver, setIsDragOver] = useState(false)
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [uploadStatus, setUploadStatus] = useState("idle") // idle, uploading, processing, success, error
//   const [processingStage, setProcessingStage] = useState("") // For detailed progress during processing
//   const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null)
//   const [validationError, setValidationError] = useState("")
//   const [startTime, setStartTime] = useState(null)
//   const [elapsedTime, setElapsedTime] = useState(0)
//   const [timerRef, setTimerRef] = useState(null)
//   const [progressPollInterval, setProgressPollInterval] = useState(null)
//   const [requestId, setRequestId] = useState(null)
//   const [backendProgressActive, setBackendProgressActive] = useState(false) // Flag to prevent upload progress override
//   const fileInputRef = useRef(null)
//   const queryClient = useQueryClient()

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (timerRef) {
//         clearInterval(timerRef)
//       }
//       if (progressPollInterval) {
//         clearInterval(progressPollInterval)
//       }
//     }
//   }, [timerRef, progressPollInterval])

//   // Timer for tracking upload time
//   const startTimer = useCallback(() => {
//     const start = Date.now()
//     setStartTime(start)
//     const timer = setInterval(() => {
//       setElapsedTime(Math.floor((Date.now() - start) / 1000))
//     }, 1000)
//     return timer
//   }, [])

//   // Simple completion check - just poll until backend is done
//   const startCompletionCheck = useCallback((requestId) => {
//     console.log(`🔍 Starting completion check for: ${requestId}`);
    
//     const checkCompletion = async () => {
//       try {
//         const progress = await getUploadProgress(requestId);
//         console.log(`📋 Checking completion status:`, progress);
        
//         if (progress && progress.stage === 'completed') {
//           console.log('🎉 Backend processing completed!');
          
//           // Clear the polling
//           if (progressPollInterval) {
//             clearInterval(progressPollInterval);
//             setProgressPollInterval(null);
//           }
          
//           // Show success
//           setUploadStatus('success');
//           setProcessingStage("✅ Analysis completed successfully!");
          
//           // Refresh data
//           queryClient.invalidateQueries({ queryKey: ["recentMeetings"] });
//           queryClient.invalidateQueries({ queryKey: ["allMeetings"] });
//           queryClient.invalidateQueries({ queryKey: ["actionItems"] });
          
//           // Auto-close after showing success
//           setTimeout(() => {
//             onClose();
//             resetForm();
//           }, 2000);
//         } else if (progress && progress.stage === 'failed') {
//           console.log('❌ Backend processing failed');
//           if (progressPollInterval) {
//             clearInterval(progressPollInterval);
//             setProgressPollInterval(null);
//           }
//           setUploadStatus('error');
//           setProcessingStage(progress.error_message || 'Processing failed. Please try again.');
//         }
//         // If still processing, continue polling
//       } catch (error) {
//         console.error('❌ Error checking completion:', error);
//         if (error.response?.status === 404) {
//           console.log('🔍 Progress not found, continuing to poll...');
//         } else {
//           // Stop polling on other errors
//           if (progressPollInterval) {
//             clearInterval(progressPollInterval);
//             setProgressPollInterval(null);
//           }
//           setUploadStatus('error');
//           setProcessingStage('Error checking progress. Please refresh and try again.');
//         }
//       }
//     };

//     // Start polling every 3 seconds
//     checkCompletion();
//     const interval = setInterval(checkCompletion, 3000);
//     setProgressPollInterval(interval);
//   }, [progressPollInterval, queryClient, onClose]);

//   // Real-time progress polling
//   const startProgressPolling = useCallback((requestId) => {
//     console.log(`🔄 Starting progress polling for request: ${requestId}`);
    
//     // CRITICAL: Clear any existing polling first
//     if (progressPollInterval) {
//       console.log("🧹 Clearing existing poll interval before starting new one");
//       clearInterval(progressPollInterval);
//       setProgressPollInterval(null);
//     }
    
//     const pollProgress = async () => {
//       try {
//         console.log(`📊 Polling progress for request ID: ${requestId}`); // Use the parameter, not state
//         const progress = await getUploadProgress(requestId); // Use the parameter, not state
//         console.log(`� Progress update:`, progress);
        
//         if (progress) {
//           console.log(`📈 Progress: ${progress.progress_percent}% - ${progress.message}`);
          
//           // Always update progress from backend (it's the source of truth)
//           console.log(`🔄 Updating UI progress to: ${progress.progress_percent}%`);
          
//           // Force synchronous state update to ensure UI reflects backend progress
//           flushSync(() => {
//             setUploadProgress(progress.progress_percent);
//             setProcessingStage(progress.message);
//             setEstimatedTimeRemaining(progress.estimated_time_remaining);
//           });
          
//           // Update status based on stage
//           if (progress.stage === 'uploading') {
//             console.log(`📤 Status: uploading`);
//             setUploadStatus('uploading');
//           } else if (progress.stage === 'transcribing' || progress.stage === 'analyzing' || progress.stage === 'saving') {
//             console.log(`⚙️ Status: processing`);
//             setUploadStatus('processing');
//           } else if (progress.stage === 'completed') {
//             console.log('✅ Processing completed!');
            
//             // Force synchronous completion update
//             flushSync(() => {
//               setUploadStatus('success');
//               setUploadProgress(100);
//               setProcessingStage("Processing completed successfully!");
//               setEstimatedTimeRemaining(0);
//             });
            
//             // Clear polling
//             if (progressPollInterval) {
//               clearInterval(progressPollInterval);
//               setProgressPollInterval(null);
//             }
            
//             // Clear timer
//             if (timerRef) {
//               clearInterval(timerRef);
//               setTimerRef(null);
//             }
            
//             // Invalidate and refetch meetings data
//             queryClient.invalidateQueries({ queryKey: ["recentMeetings"] });
//             queryClient.invalidateQueries({ queryKey: ["allMeetings"] });
//             queryClient.invalidateQueries({ queryKey: ["actionItems"] });
            
//             // Close modal after showing success
//             setTimeout(() => {
//               onClose();
//               resetForm();
//             }, 2000);
//           } else if (progress.stage === 'failed') {
//             console.log('❌ Processing failed:', progress.error_message);
//             setUploadStatus('error');
//             setProcessingStage(progress.error_message || 'Processing failed');
            
//             // Clear polling on error
//             if (progressPollInterval) {
//               clearInterval(progressPollInterval);
//               setProgressPollInterval(null);
//             }
            
//             // Clear timer
//             if (timerRef) {
//               clearInterval(timerRef);
//               setTimerRef(null);
//             }
//           }
//         } else {
//           console.log('⚠️ No progress data received');
//         }
//       } catch (error) {
//         console.error(`❌ Progress polling error for ${requestId}:`, error);
        
//         // Handle different types of errors
//         if (error.response?.status === 404) {
//           console.log(`🔍 Request ${requestId} not found (404), will retry...`);
//           // Continue polling for a bit in case it's a timing issue
//         } else if (error.response?.status === 401 || error.response?.status === 403) {
//           console.log(`🔐 Authentication error for ${requestId} - stopping polling`);
//           // Stop polling on auth errors - user needs to login again
//           clearInterval(progressPollInterval);
//           setProgressPollInterval(null);
//           setUploadStatus("error");
//           setProcessingStage("Authentication expired. Please refresh and login again.");
//         } else {
//           // For other errors, stop polling
//           console.log(`🛑 Stopping polling for ${requestId} due to error`);
//           clearInterval(progressPollInterval);
//           setProgressPollInterval(null);
//           setUploadStatus("error");
//           setProcessingStage("Error tracking progress.");
//         }
//       }
//     };

//     // Poll immediately and then every 2 seconds
//     pollProgress();
//     const interval = setInterval(pollProgress, 2000);
//     setProgressPollInterval(interval);
    
//     return interval;
//   }, [progressPollInterval, timerRef, queryClient, onClose]);

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins}:${secs.toString().padStart(2, '0')}`
//   }

//   const uploadMutation = useMutation({
//     mutationFn: ({ data, onProgress }) => uploadTranscript(data, onProgress),
//     onMutate: () => {
//       console.log("🚀 Upload mutation starting...");
//       setUploadProgress(0)
//       setProcessingStage("Starting upload...")
//       setEstimatedTimeRemaining(null)
//       const timer = startTimer()
//       setTimerRef(timer)
//     },
//     onSuccess: (data) => {
//       console.log("Upload successful:", data)
//       console.log("Request ID from response:", data.request_id)
      
//       // Clear any existing polling first
//       if (progressPollInterval) {
//         console.log("🧹 Clearing existing poll interval");
//         clearInterval(progressPollInterval);
//         setProgressPollInterval(null);
//       }
      
//       // Simple approach: Upload complete → Processing → Done
//       console.log("✅ Upload completed, starting AI processing...");
//       setUploadStatus("processing");
//       setUploadProgress(100); // Show complete progress bar
//       setProcessingStage("🤖 AI is analyzing your content... This typically takes 2-3 minutes");
      
//       // If we have a request_id, wait for backend completion
//       if (data.request_id) {
//         setRequestId(data.request_id);
//         // Simple polling to detect completion
//         startCompletionCheck(data.request_id);
//       } else {
//         // No request_id means immediate completion (text uploads)
//         setTimeout(() => {
//           setUploadStatus("success");
//           setProcessingStage("✅ Analysis completed successfully!");
//           queryClient.invalidateQueries({ queryKey: ["recentMeetings"] });
//           queryClient.invalidateQueries({ queryKey: ["allMeetings"] });
//           queryClient.invalidateQueries({ queryKey: ["actionItems"] });
          
//           setTimeout(() => {
//             onClose();
//             resetForm();
//           }, 2000);
//         }, 1000);
//       }
//     },
        
//         // Simple polling - just check if it's done
//         const checkCompletion = async () => {
//           try {
//             const progress = await getUploadProgress(data.request_id);
//             if (progress && progress.stage === 'completed') {
//               console.log('✅ Processing completed!');
//               setUploadStatus('success');
//               setUploadProgress(100);
//               setProcessingStage("Processing completed successfully!");
//               setEstimatedTimeRemaining(0);
              
//               // Clear polling and timer
//               if (progressPollInterval) {
//                 clearInterval(progressPollInterval);
//                 setProgressPollInterval(null);
//               }
//               if (timerRef) {
//                 clearInterval(timerRef);
//                 setTimerRef(null);
//               }
              
//               // Refresh meetings data
//               queryClient.invalidateQueries({ queryKey: ["recentMeetings"] });
//               queryClient.invalidateQueries({ queryKey: ["allMeetings"] });
//               queryClient.invalidateQueries({ queryKey: ["actionItems"] });
              
//               // Close modal after showing success
//               setTimeout(() => {
//                 onClose();
//                 resetForm();
//               }, 2000);
//             } else if (progress && progress.stage === 'failed') {
//               console.log('❌ Processing failed');
//               setUploadStatus('error');
//               setProcessingStage(progress.error_message || 'Processing failed');
//               if (progressPollInterval) {
//                 clearInterval(progressPollInterval);
//                 setProgressPollInterval(null);
//               }
//             }
//           } catch (error) {
//             console.error("Completion check error:", error);
//             // Continue checking unless it's a permanent error
//             if (error.response?.status === 401 || error.response?.status === 403) {
//               setUploadStatus("error");
//               setProcessingStage("Authentication expired. Please refresh and login again.");
//               if (progressPollInterval) {
//                 clearInterval(progressPollInterval);
//                 setProgressPollInterval(null);
//               }
//             }
//           }
//         };
        
//         // Check immediately and then every 3 seconds
//         checkCompletion();
//         const interval = setInterval(checkCompletion, 3000);
//         setProgressPollInterval(interval);
//       } else {
//         console.log("No request_id found, treating as immediate completion")
//         // Fallback for immediate completion (like text uploads that might complete instantly)
//         setUploadStatus("success")
//         setUploadProgress(100)
//         setProcessingStage("Processing completed successfully!")
//         setEstimatedTimeRemaining(0)
        
//         if (timerRef) {
//           clearInterval(timerRef)
//           setTimerRef(null)
//         }
        
//         // Invalidate and refetch meetings data
//         queryClient.invalidateQueries({ queryKey: ["recentMeetings"] })
//         queryClient.invalidateQueries({ queryKey: ["allMeetings"] })
//         queryClient.invalidateQueries({ queryKey: ["actionItems"] })
        
//         // Close modal after a brief success display
//         setTimeout(() => {
//           onClose()
//           resetForm()
//         }, 2000)
//       }
//     },
//     onError: (error) => {
//       console.error("Upload failed:", error)
//       setUploadStatus("error")
//       setProcessingStage("Processing failed. Please try again.")
//       setEstimatedTimeRemaining(0)
      
//       if (timerRef) {
//         clearInterval(timerRef)
//         setTimerRef(null)
//       }
//     },
//   })

//   const resetForm = () => {
//     setFile(null)
//     setTextContent("")
//     setUploadProgress(0)
//     setUploadStatus("idle")
//     setValidationError("")
//     setElapsedTime(0)
//     setStartTime(null)
//     setIsDragOver(false)
//     setProcessingStage("")
//     setEstimatedTimeRemaining(0)
//     setRequestId(null)
//     setBackendProgressActive(false) // Reset the flag
    
//     if (timerRef) {
//       clearInterval(timerRef)
//       setTimerRef(null)
//     }
    
//     if (progressPollInterval) {
//       clearInterval(progressPollInterval)
//       setProgressPollInterval(null)
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setValidationError("")

//     // Manual validation for better UX
//     if (uploadType === "text" && !textContent.trim()) {
//       setValidationError("Please enter a meeting transcript")
//       return
//     }
    
//     if (uploadType === "file" && !file) {
//       setValidationError("Please select a file to upload")
//       return
//     }

//     if (uploadType === "text" && textContent.trim()) {
//       setUploadStatus("processing")
//       const timer = startTimer()
      
//       try {
//         await uploadMutation.mutateAsync({ data: { type: "text", content: textContent } })
//       } finally {
//         clearInterval(timer)
//       }
//     } else if (uploadType === "file" && file) {
//       setUploadStatus("uploading")
//       setUploadProgress(0)
//       const timer = startTimer()
      
//       try {
//         const formData = new FormData()
//         formData.append("file", file)
        
//         // Use upload progress only for the initial file upload phase
//         await uploadMutation.mutateAsync({
//           data: { type: "file", content: formData },
//           onProgress: (progress) => {
//             // Show file upload progress only
//             console.log(`📤 File upload progress: ${progress}%`);
//             if (uploadStatus === "uploading") {
//               setUploadProgress(progress);
//               if (progress >= 100) {
//                 setUploadStatus("processing");
//                 setProcessingStage("🤖 AI is analyzing your content... This typically takes 2-3 minutes");
//                 setUploadProgress(100); // Keep at 100% during processing
//               }
//             }
//           }
//         })
//       } finally {
//         clearInterval(timer)
//       }
//     }
//   }

//   const handleDragOver = (e) => {
//     e.preventDefault()
//     setIsDragOver(true)
//   }

//   const handleDragLeave = (e) => {
//     e.preventDefault()
//     setIsDragOver(false)
//   }

//   const handleDrop = (e) => {
//     e.preventDefault()
//     setIsDragOver(false)
    
//     const droppedFiles = Array.from(e.dataTransfer.files)
//     const audioFile = droppedFiles.find(file => 
//       file.type.startsWith('audio/') || 
//       file.name.endsWith('.txt') || 
//       file.name.endsWith('.docx')
//     )
    
//     if (audioFile) {
//       setFile(audioFile)
//       setUploadType("file")
//     }
//   }

//   const handleFileSelect = (e) => {
//     const selectedFile = e.target.files[0]
//     if (selectedFile) {
//       setFile(selectedFile)
//       setValidationError("") // Clear validation error
//     }
//   }

//   if (!isOpen) return null

//   const getStatusIcon = () => {
//     switch (uploadStatus) {
//       case "success":
//         return <CheckCircle className="h-5 w-5 text-green-500" />
//       case "error":
//         return <AlertCircle className="h-5 w-5 text-red-500" />
//       case "uploading":
//       case "processing":
//         return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
//       default:
//         return null
//     }
//   }

//   const getStatusText = () => {
//     switch (uploadStatus) {
//       case "uploading":
//         return "Uploading file..."
//       case "processing":
//         return "Processing with AI..."
//       case "success":
//         return "Upload successful!"
//       case "error":
//         return "Upload failed. Please try again."
//       default:
//         return ""
//     }
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
//         <div className="flex items-center justify-between mb-4 sm:mb-6">
//           <div className="flex items-center space-x-2 sm:space-x-3">
//             <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
//               <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
//             </div>
//             <h2 className="text-lg sm:text-xl font-bold text-gray-900">
//               <span className="hidden sm:inline">Upload Meeting Content</span>
//               <span className="sm:hidden">Upload Content</span>
//             </h2>
//           </div>
//           <button 
//             onClick={() => { onClose(); resetForm(); }}
//             className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
//           >
//             <X className="h-5 w-5 sm:h-6 sm:w-6" />
//           </button>
//         </div>

//         {/* Status Display */}
//         {uploadStatus !== "idle" && (
//           <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
//             <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
//               {getStatusIcon()}
//               <span className="font-medium text-gray-900 text-sm sm:text-base">{getStatusText()}</span>
//             </div>
            
//             {(uploadStatus === "uploading" || uploadStatus === "processing") && (
//               <>
//                 <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
//                   <div 
//                     className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                 </div>
                
//                 {/* Debug info - remove after fixing */}
//                 <div className="text-xs text-gray-400 mb-2">
//                   Debug: uploadProgress state = {uploadProgress}%, uploadStatus = {uploadStatus}
//                 </div>
                
//                 {/* Enhanced Progress Information */}
//                 <div className="space-y-2 text-sm text-gray-600">
//                   {processingStage && (
//                     <div className="flex items-center space-x-2">
//                       <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
//                       <span className="font-medium">{processingStage}</span>
//                     </div>
//                   )}
                  
//                   <div className="flex justify-between items-center">
//                     <span>Progress: {uploadProgress.toFixed(0)}%</span>
//                     {estimatedTimeRemaining > 0 && (
//                       <span className="text-blue-600 font-medium">
//                         ~{Math.ceil(estimatedTimeRemaining / 60)} min remaining
//                       </span>
//                     )}
//                   </div>
                  
//                   <div className="flex justify-between items-center">
//                     <span>Time: {formatTime(elapsedTime)}</span>
//                     {uploadType === "file" && uploadStatus === "processing" && (
//                       <span className="text-orange-600 text-xs">
//                         AI processing typically takes 2-3 minutes
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         )}

//         {/* Validation Error Display */}
//         {validationError && (
//           <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
//             <div className="flex items-center space-x-2">
//               <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
//               <span className="text-red-700 font-medium text-sm sm:text-base">{validationError}</span>
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4 sm:mb-6">
//             {/* Upload Type Selector */}
//             <div className="flex space-x-2 sm:space-x-3 mb-4 sm:mb-6">
//               <button
//                 type="button"
//                 onClick={() => setUploadType("text")}
//                 className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${
//                   uploadType === "text" 
//                     ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
//                     : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
//                 }`}
//               >
//                 <FileText className="h-5 w-5" />
//                 <span className="font-medium">Text Transcript</span>
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setUploadType("file")}
//                 className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${
//                   uploadType === "file" 
//                     ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
//                     : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
//                 }`}
//               >
//                 <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
//                 <span className="font-medium">Audio File</span>
//               </button>
//             </div>

//             {/* Content Input */}
//             {uploadType === "text" ? (
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Meeting Transcript
//                 </label>
//                 <textarea
//                   value={textContent}
//                   onChange={(e) => {
//                     setTextContent(e.target.value)
//                     setValidationError("") // Clear validation error when typing
//                   }}
//                   placeholder="Paste your meeting transcript here..."
//                   className="w-full h-32 sm:h-40 p-3 sm:p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-sm sm:text-base"
//                   disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
//                 />
//                 <p className="text-xs sm:text-sm text-gray-500">
//                   {textContent.length} characters
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Audio File or Document
//                 </label>
//                 <div 
//                   className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
//                     isDragOver 
//                       ? "border-blue-400 bg-blue-50 scale-105" 
//                       : file
//                         ? "border-green-400 bg-green-50"
//                         : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
//                   }`}
//                   onDragOver={handleDragOver}
//                   onDragLeave={handleDragLeave}
//                   onDrop={handleDrop}
//                 >
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="audio/*,.txt,.docx"
//                     onChange={handleFileSelect}
//                     className="hidden"
//                     id="file-upload"
//                     disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
//                   />
                  
//                   {file ? (
//                     <div className="space-y-2 sm:space-y-3">
//                       <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mx-auto" />
//                       <div>
//                         <p className="font-medium text-gray-900 text-sm sm:text-base">{file.name}</p>
//                         <p className="text-xs sm:text-sm text-gray-500">
//                           {(file.size / 1024 / 1024).toFixed(2)} MB
//                         </p>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
//                       >
//                         Choose different file
//                       </button>
//                     </div>
//                   ) : (
//                     <label htmlFor="file-upload" className="cursor-pointer block">
//                       <Upload className={`h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 transition-all duration-300 ${
//                         isDragOver ? "text-blue-500 scale-110" : "text-gray-400"
//                       }`} />
//                       <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
//                         <span className="hidden sm:inline">
//                           {isDragOver ? "Drop your file here" : "Drop files here or click to browse"}
//                         </span>
//                         <span className="sm:hidden">
//                           {isDragOver ? "Drop file here" : "Click to browse"}
//                         </span>
//                       </p>
//                       <p className="text-xs sm:text-sm text-gray-500">
//                         Supports audio files, .txt, and .docx documents
//                       </p>
//                     </label>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
//             <button
//               type="button"
//               onClick={() => { onClose(); resetForm(); }}
//               className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm sm:text-base"
//               disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={
//                 uploadStatus === "uploading" || 
//                 uploadStatus === "processing" || 
//                 uploadStatus === "success" ||
//                 (uploadType === "text" && !textContent.trim()) ||
//                 (uploadType === "file" && !file)
//               }
//               className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none text-sm sm:text-base"
//             >
//               <span className="hidden sm:inline">
//                 {uploadStatus === "uploading" ? "Uploading..." : 
//                  uploadStatus === "processing" ? "Processing..." :
//                  uploadStatus === "success" ? "Success!" :
//                  "Upload & Analyze"}
//               </span>
//               <span className="sm:hidden">
//                 {uploadStatus === "uploading" ? "Uploading..." : 
//                  uploadStatus === "processing" ? "Processing..." :
//                  uploadStatus === "success" ? "Success!" :
//                  "Upload"}
//               </span>
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default UploadModal

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-soft">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Upload Meeting Content
            </h2>
          </div>
          <button 
            onClick={() => { onClose(); resetForm(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
            disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Enhanced Status Display */}
        {uploadStatus !== "idle" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200/50">
            <div className="flex items-center space-x-3 mb-3">
              {getStatusIcon()}
              <span className="font-semibold text-gray-900">{getStatusText()}</span>
            </div>
            
            {(uploadStatus === "uploading" || uploadStatus === "processing") && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-700">
                  {processingStage && (
                    <div className="flex items-center space-x-2 p-3 bg-white/70 rounded-xl">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{processingStage}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {uploadStatus === "uploading" && (
                      <>
                        <div className="text-center p-2 bg-white/50 rounded-lg">
                          <div className="font-semibold text-primary-600">{uploadProgress.toFixed(0)}%</div>
                          <div className="text-gray-600">Progress</div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded-lg">
                          <div className="font-semibold text-blue-600">{formatTime(elapsedTime)}</div>
                          <div className="text-gray-600">Time</div>
                        </div>
                      </>
                    )}
                    
                    {uploadStatus === "processing" && (
                      <>
                        <div className="text-center p-2 bg-white/50 rounded-lg">
                          <div className="font-semibold text-green-600">AI Processing</div>
                          <div className="text-gray-600">2-3 min avg</div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded-lg">
                          <div className="font-semibold text-blue-600">{formatTime(elapsedTime)}</div>
                          <div className="text-gray-600">Elapsed</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Enhanced Validation Error Display */}
        {validationError && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-medium">{validationError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            {/* Enhanced Upload Type Selector */}
            <div className="flex space-x-3 mb-6">
              <button
                type="button"
                onClick={() => setUploadType("text")}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 rounded-2xl border-2 transition-all duration-300 font-medium ${
                  uploadType === "text" 
                    ? "border-primary-500 bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 shadow-lg transform scale-105" 
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:scale-102"
                }`}
                disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
              >
                <FileText className="h-5 w-5" />
                <span>Text Transcript</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadType("file")}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 rounded-2xl border-2 transition-all duration-300 font-medium ${
                  uploadType === "file" 
                    ? "border-primary-500 bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 shadow-lg transform scale-105" 
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:scale-102"
                }`}
                disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
              >
                <Mic className="h-5 w-5" />
                <span>Audio File</span>
              </button>
            </div>

            {/* Enhanced Content Input */}
            {uploadType === "text" ? (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Meeting Transcript
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => {
                    setTextContent(e.target.value)
                    setValidationError("")
                  }}
                  placeholder="Paste your meeting transcript here... Include speaker names, key points, and action items for better analysis."
                  className="w-full h-40 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 placeholder-gray-400 bg-gradient-to-br from-white to-gray-50"
                  disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                />
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{textContent.length} characters</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-lg">
                    {textContent.length > 500 ? "Good length ✓" : "Add more details"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Audio File or Document
                </label>
                <div 
                  className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    isDragOver 
                      ? "border-primary-400 bg-gradient-to-br from-primary-50 to-blue-100 scale-105 shadow-lg" 
                      : file
                        ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-100"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50"
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
                    <div className="space-y-4">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{file.name}</p>
                        <p className="text-green-600 font-medium">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 hover:text-primary-700 font-medium bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                        disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="cursor-pointer block">
                      <Upload className={`h-12 w-12 mx-auto mb-4 transition-all duration-300 ${
                        isDragOver ? "text-primary-500 scale-110" : "text-gray-400"
                      }`} />
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        {isDragOver ? "Drop your file here" : "Drop files here or click to browse"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports audio files (.mp3, .wav, .m4a), text files (.txt), and Word documents (.docx)
                      </p>
                      <div className="mt-3 flex justify-center space-x-4 text-xs text-gray-400">
                        <span>• High quality audio recommended</span>
                        <span>• Max file size: 100MB</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              className="w-full sm:flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
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
              className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {uploadStatus === "uploading" ? "Uploading..." : 
               uploadStatus === "processing" ? "Processing..." :
               uploadStatus === "success" ? "Success! ✓" :
               "Upload & Analyze"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadModal