import { Calendar, Users, Clock, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { formatDate } from "../utils/dateUtils"

const MeetingCard = ({ meeting }) => {
  const navigate = useNavigate()

  const handleViewDetails = () => {
    navigate(`/meetings/${meeting.id}`)
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 hover:shadow-large hover:border-primary-200/50 transition-all duration-300 group animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg font-bold text-gray-900 pr-0 sm:pr-4 group-hover:text-primary-700 transition-colors">
          {meeting.title}
        </h3>
        <div className="flex items-center text-sm text-gray-500 flex-shrink-0 bg-gray-50 px-3 py-1 rounded-xl">
          <Calendar className="h-4 w-4 mr-1 text-primary-500" />
          <span className="whitespace-nowrap font-medium">{formatDate(meeting.date || meeting.created_at)}</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
          <span className="font-semibold text-gray-700">Summary:</span> {meeting.summary}
        </p>
      </div>

      {meeting.action_items && meeting.action_items.length > 0 && (
        <div className="mb-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-primary-700 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Action Items
          </p>
          <ul className="text-sm text-gray-700 space-y-2">
            {meeting.action_items.slice(0, 2).map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary-500 mr-2 flex-shrink-0 font-bold">•</span>
                <span className="break-words">
                  {typeof item === "string" ? item : item.task}
                </span>
              </li>
            ))}
            {meeting.action_items.length > 2 && (
              <li className="text-primary-600 italic font-medium">
                +{meeting.action_items.length - 2} more items
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 space-y-1 sm:space-y-0">
          {meeting.participants && (
            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
              <Users className="h-4 w-4 mr-1 text-primary-500" />
              <span className="font-medium">{meeting.participants} participants</span>
            </div>
          )}
          {meeting.duration && (
            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
              <Clock className="h-4 w-4 mr-1 text-primary-500" />
              <span className="font-medium">{meeting.duration}</span>
            </div>
          )}
        </div>
        <button 
          onClick={handleViewDetails}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-medium transform hover:scale-105 transition-all duration-200 self-start sm:self-auto"
        >
          View Details →
        </button>
      </div>
    </div>
  )
}

export default MeetingCard
