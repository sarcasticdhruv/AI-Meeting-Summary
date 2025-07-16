import { Calendar, Users, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { formatDate } from "../utils/dateUtils"

const MeetingCard = ({ meeting }) => {
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/meetings/${meeting.id}`)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(meeting.date || meeting.created_at)}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Summary:</span> {meeting.summary}
        </p>
      </div>

      {meeting.action_items && meeting.action_items.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Action Items:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {meeting.action_items.slice(0, 2).map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                {typeof item === "string" ? item : item.task}
              </li>
            ))}
            {meeting.action_items.length > 2 && (
              <li className="text-gray-500 italic">+{meeting.action_items.length - 2} more items</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {meeting.participants && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {meeting.participants} participants
            </div>
          )}
          {meeting.duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {meeting.duration}
            </div>
          )}
        </div>
        <button 
          onClick={handleViewDetails}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default MeetingCard
