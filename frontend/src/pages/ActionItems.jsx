"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle, Circle, Calendar, User } from "lucide-react"
import { fetchActionItems, updateActionItem } from "../services/api"

const ActionItems = () => {
  const [filter, setFilter] = useState("all")

  const {
    data: actionItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["actionItems"],
    queryFn: fetchActionItems,
  })

  const filteredItems = actionItems.filter((item) => {
    if (filter === "completed") return item.completed
    if (filter === "pending") return !item.completed
    return true
  })

  const toggleComplete = async (itemId) => {
    try {
      await updateActionItem(itemId, { completed: true })
      refetch()
    } catch (error) {
      console.error("Failed to update action item:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Action Items</h1>
        <div className="flex space-x-2">
          {["all", "pending", "completed"].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === filterOption ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <button onClick={() => toggleComplete(item.id)} className="mt-1 text-gray-400 hover:text-blue-600">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-gray-900 ${item.completed ? "line-through text-gray-500" : ""}`}>{item.task}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      {item.due_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {item.due_date}
                        </div>
                      )}
                      {item.assignee && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {item.assignee}
                        </div>
                      )}
                      <span className="text-blue-600">From: {item.meeting_title}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No action items found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ActionItems
