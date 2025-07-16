import { useQuery } from "@tanstack/react-query"
import MeetingCard from "../components/MeetingCard"
import UploadButton from "../components/UploadButton"
import { fetchRecentMeetings, fetchUpcomingActions, fetchRecentClients } from "../services/api"

const Dashboard = () => {
  const { data: recentMeetings = [], isLoading: meetingsLoading, error: meetingsError } = useQuery({
    queryKey: ["recentMeetings"],
    queryFn: fetchRecentMeetings,
  })

  const { data: upcomingActions = [], isLoading: actionsLoading, error: actionsError } = useQuery({
    queryKey: ["upcomingActions"],
    queryFn: fetchUpcomingActions,
  })

  const { data: recentClients = [], isLoading: clientsLoading, error: clientsError } = useQuery({
    queryKey: ["recentClients"],
    queryFn: fetchRecentClients,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meeting Summaries</h1>
        <p className="text-gray-600 mt-1">
          Quickly access summaries and action items from your recent client meetings.
        </p>
      </div>

      {/* Upload Button */}
      <div>
        <UploadButton />
      </div>

      {/* Recent Meetings */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Meetings</h2>
        {meetingsLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : meetingsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600">Error loading meetings. Please check if the backend server is running.</p>
            <p className="text-sm text-red-500 mt-2">{meetingsError.message}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {recentMeetings.length > 0 ? (
              recentMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No recent meetings found. Upload your first transcript to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Clients */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Clients</h2>
        {clientsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : clientsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading clients.</p>
            <p className="text-sm text-red-500 mt-2">{clientsError.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentClients.length > 0 ? (
              recentClients.map((client, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{client.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {client.meeting_count} meeting{client.meeting_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1 truncate">{client.last_meeting_title}</p>
                  <p className="text-xs text-gray-500">
                    {client.last_meeting_date ? new Date(client.last_meeting_date).toLocaleDateString() : 'No recent meetings'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-500">No clients found. Add client information to your meeting transcripts!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Action Items */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Action Items</h2>
        {actionsLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        ) : actionsError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading action items. Please check if the backend server is running.</p>
            <p className="text-sm text-red-500 mt-2">{actionsError.message}</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {upcomingActions.length > 0 ? (
              <ul className="space-y-3">
                {upcomingActions.map((action, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-gray-900">{action.task}</p>
                      <p className="text-sm text-gray-500">Due: {action.due_date || action.dueDate}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">No upcoming action items.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
