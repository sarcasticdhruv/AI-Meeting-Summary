"use client"

import { useState } from "react"
import { Upload, Sparkles } from "lucide-react"
import UploadModal from "./UploadModal"

const UploadButton = ({ className = "", children = "Upload Meeting Content" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group ${className}`}
      >
        <div className="flex items-center space-x-2">
          <Upload className="h-5 w-5 group-hover:animate-bounce" />
          <Sparkles className="h-4 w-4 opacity-70" />
        </div>
        <span>{children}</span>
      </button>
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default UploadButton
