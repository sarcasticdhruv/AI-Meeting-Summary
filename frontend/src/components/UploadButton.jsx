"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import UploadModal from "./UploadModal"

const UploadButton = ({ className = "", children = "Upload Transcript or Audio" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2 ${className}`}
      >
        <Upload className="h-5 w-5" />
        <span>{children}</span>
      </button>
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default UploadButton
