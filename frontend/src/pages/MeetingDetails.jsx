import { useQuery } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, Users, Clock, ArrowLeft, Download, Mail } from "lucide-react"
import { formatDate } from "../utils/dateUtils"
import { fetchMeetingById } from "../services/api"

const MeetingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: meeting, isLoading, error } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => fetchMeetingById(id),
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">Error Loading Meeting</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <button
          onClick={() => navigate('/meetings')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Meetings
        </button>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Meeting not found</p>
        <button
          onClick={() => navigate('/meetings')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Meetings
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-soft border border-gray-200/50">
        <div className="flex-1">
          <button
            onClick={() => navigate('/meetings')}
            className="flex items-center text-gray-600 hover:text-primary-600 mb-3 text-sm sm:text-base group transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            Back to Meetings
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent break-words pr-0 sm:pr-4">
            {meeting.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-3 space-y-2 sm:space-y-0">
            <div className="flex items-center bg-gray-50 px-3 py-1 rounded-xl">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary-500" />
              <span className="font-medium">{formatDate(meeting.created_at)}</span>
            </div>
            {meeting.participants && (
              <div className="flex items-center bg-gray-50 px-3 py-1 rounded-xl">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary-500" />
                <span className="font-medium">{meeting.participants} participants</span>
              </div>
            )}
            {meeting.duration && (
              <div className="flex items-center bg-gray-50 px-3 py-1 rounded-xl">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-primary-500" />
                <span className="font-medium">{meeting.duration}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
          <button className="flex items-center justify-center px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:shadow-medium">
            <Download className="h-4 w-4 mr-2" />
            <span>Export</span>
          </button>
          <button className="flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:shadow-medium rounded-xl transition-all duration-200 transform hover:scale-105">
            <Mail className="h-4 w-4 mr-2" />
            <span>Email</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 shadow-soft animate-fade-in">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full mr-3"></div>
          <h2 className="text-lg font-bold text-gray-900">Summary</h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl">
          {meeting.summary}
        </p>
      </div>

      {/* Action Items */}
      {meeting.action_items && meeting.action_items.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 shadow-soft animate-fade-in">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-success-500 to-success-600 rounded-full mr-3"></div>
            <h2 className="text-lg font-bold text-gray-900">Action Items</h2>
          </div>
          <div className="space-y-3">
            {meeting.action_items.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-success-50 to-green-50 rounded-xl border border-success-100 hover:shadow-soft transition-all duration-200">
                <div className="w-3 h-3 bg-gradient-to-br from-success-500 to-success-600 rounded-full mt-2 flex-shrink-0 shadow-soft"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">
                    {typeof item === "string" ? item : item.task}
                  </p>
                  {typeof item === "object" && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
                      {item.assignee && (
                        <span className="bg-white px-2 py-1 rounded-lg font-medium">
                          Assignee: <span className="text-gray-900">{item.assignee}</span>
                        </span>
                      )}
                      {item.due_date && (
                        <span className="bg-white px-2 py-1 rounded-lg font-medium">
                          Due: <span className="text-gray-900">{formatDate(item.due_date)}</span>
                        </span>
                      )}
                      {item.priority && (
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold shadow-soft ${
                          item.priority === 'high' ? 'bg-gradient-to-r from-danger-100 to-red-100 text-danger-800' :
                          item.priority === 'medium' ? 'bg-gradient-to-r from-warning-100 to-yellow-100 text-warning-800' :
                          'bg-gradient-to-r from-success-100 to-green-100 text-success-800'
                        }`}>
                          {item.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objections */}
      {meeting.objections && meeting.objections.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 shadow-soft animate-fade-in">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-warning-500 to-warning-600 rounded-full mr-3"></div>
            <h2 className="text-lg font-bold text-gray-900">Client Objections & Responses</h2>
          </div>
          <div className="space-y-4">
            {meeting.objections.map((objection, index) => (
              <div key={index} className="border-l-4 border-gradient-to-b from-warning-400 to-orange-400 bg-gradient-to-r from-warning-50 to-orange-50 pl-4 py-3 rounded-r-xl">
                <p className="text-gray-900 font-semibold mb-2 text-sm sm:text-base break-words">
                  <span className="text-warning-700">Concern:</span> {objection.concern}
                </p>
                {objection.response && (
                  <p className="text-gray-700 text-sm sm:text-base break-words bg-white/70 p-3 rounded-lg">
                    <span className="font-semibold text-primary-700">Response:</span> {objection.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRM Notes */}
      {meeting.crm_notes && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 shadow-soft animate-fade-in">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-blue-600 rounded-full mr-3"></div>
            <h2 className="text-lg font-bold text-gray-900">CRM Notes</h2>
          </div>
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-xl border border-primary-100">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">
              {meeting.crm_notes}
            </p>
          </div>
        </div>
      )}

      {/* Full Transcript */}
      {meeting.transcript && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 shadow-soft animate-fade-in">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full mr-3"></div>
            <h2 className="text-lg font-bold text-gray-900">Full Transcript</h2>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 max-h-64 sm:max-h-96 overflow-y-auto border border-gray-200 shadow-soft">
            <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap font-mono break-words leading-relaxed">
              {meeting.transcript}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeetingDetails
