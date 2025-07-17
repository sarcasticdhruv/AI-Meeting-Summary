"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Download } from "lucide-react"
import MeetingCard from "../components/MeetingCard"
import { fetchAllMeetings } from "../services/api"
import { exportToJSON } from "../utils/exportUtils"

const Meetings = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")

  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: ["allMeetings"],
    queryFn: fetchAllMeetings,
  })

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.summary.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterBy === "all") return matchesSearch
    // Add more filter logic here
    return matchesSearch
  })

  const handleExport = () => {
    exportToJSON(filteredMeetings, "meetings-export.json")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Meetings</h1>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2 self-start sm:self-auto transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        >
          <option value="all">All Meetings</option>
          <option value="recent">Recent</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Meetings Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {filteredMeetings.length > 0 ? (
            filteredMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm ? "No meetings found matching your search." : "No meetings found."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Meetings
