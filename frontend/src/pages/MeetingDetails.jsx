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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/meetings')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Meetings
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(meeting.created_at)}
            </div>
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
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          <button className="flex items-center px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            <Mail className="h-4 w-4 mr-1" />
            Email Summary
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <p className="text-gray-700 leading-relaxed">{meeting.summary}</p>
      </div>

      {/* Action Items */}
      {meeting.action_items && meeting.action_items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Items</h2>
          <div className="space-y-3">
            {meeting.action_items.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {typeof item === "string" ? item : item.task}
                  </p>
                  {typeof item === "object" && (
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      {item.assignee && (
                        <span>Assignee: <span className="font-medium">{item.assignee}</span></span>
                      )}
                      {item.due_date && (
                        <span>Due: <span className="font-medium">{formatDate(item.due_date)}</span></span>
                      )}
                      {item.priority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Objections & Responses</h2>
          <div className="space-y-4">
            {meeting.objections.map((objection, index) => (
              <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
                <p className="text-gray-900 font-medium mb-1">
                  Concern: {objection.concern}
                </p>
                {objection.response && (
                  <p className="text-gray-600">
                    Response: {objection.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRM Notes */}
      {meeting.crm_notes && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CRM Notes</h2>
          <p className="text-gray-700 leading-relaxed">{meeting.crm_notes}</p>
        </div>
      )}

      {/* Full Transcript */}
      {meeting.transcript && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Full Transcript</h2>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {meeting.transcript}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeetingDetails
