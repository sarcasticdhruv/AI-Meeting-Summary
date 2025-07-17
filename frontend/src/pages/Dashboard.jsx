import { useQuery } from "@tanstack/react-query"
import { LayoutDashboard, Users, CheckCircle } from "lucide-react"
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-large">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Meeting Summaries</h1>
        </div>
        <p className="text-primary-100 text-sm sm:text-base">
          Quickly access summaries and action items from your recent client meetings.
        </p>
      </div>

      {/* Upload Button */}
      <div>
        <UploadButton />
      </div>

      {/* Recent Meetings */}
      <div>
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full"></div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Meetings</h2>
        </div>
        {meetingsLoading ? (
          <div className="grid gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 animate-pulse">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4 mb-4"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-full mb-2"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-2/3"></div>
              </div>
            ))}
          </div>
        ) : meetingsError ? (
          <div className="bg-gradient-to-r from-danger-50 to-red-50 border border-danger-200 rounded-2xl p-6 sm:p-8 text-center shadow-soft">
            <p className="text-danger-600 text-sm sm:text-base font-semibold">Error loading meetings. Please check if the backend server is running.</p>
            <p className="text-xs sm:text-sm text-danger-500 mt-2">{meetingsError.message}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {recentMeetings.length > 0 ? (
              recentMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
            ) : (
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 sm:p-8 text-center shadow-soft">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl inline-block mb-4">
                  <LayoutDashboard className="h-8 w-8 text-primary-500" />
                </div>
                <p className="text-gray-600 text-sm sm:text-base font-medium">No recent meetings found. Upload your first transcript to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Clients */}
      <div>
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-success-500 to-success-600 rounded-full"></div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Clients</h2>
        </div>
        {clientsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4 mb-2"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-full mb-1"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2"></div>
              </div>
            ))}
          </div>
        ) : clientsError ? (
          <div className="bg-gradient-to-r from-danger-50 to-red-50 border border-danger-200 rounded-2xl p-4 sm:p-6 text-center shadow-soft">
            <p className="text-danger-600 text-sm sm:text-base font-semibold">Error loading clients.</p>
            <p className="text-xs sm:text-sm text-danger-500 mt-2">{clientsError.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentClients.length > 0 ? (
              recentClients.map((client, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 hover:shadow-medium transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base group-hover:text-primary-700 transition-colors">
                      {client.name}
                    </h3>
                    <span className="bg-gradient-to-r from-primary-100 to-blue-100 text-primary-800 text-xs px-3 py-1 rounded-xl whitespace-nowrap font-semibold">
                      {client.meeting_count} meeting{client.meeting_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 truncate bg-gray-50 p-2 rounded-lg">{client.last_meeting_title}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {client.last_meeting_date ? new Date(client.last_meeting_date).toLocaleDateString() : 'No recent meetings'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 sm:p-8 text-center shadow-soft">
                <div className="p-4 bg-gradient-to-br from-success-50 to-green-50 rounded-2xl inline-block mb-4">
                  <Users className="h-8 w-8 text-success-500" />
                </div>
                <p className="text-gray-600 text-sm sm:text-base font-medium">No clients found. Add client information to your meeting transcripts!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Action Items */}
      <div>
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-warning-500 to-warning-600 rounded-full"></div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Upcoming Action Items</h2>
        </div>
        {actionsLoading ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-full"></div>
              ))}
            </div>
          </div>
        ) : actionsError ? (
          <div className="bg-gradient-to-r from-danger-50 to-red-50 border border-danger-200 rounded-2xl p-4 sm:p-6 text-center shadow-soft">
            <p className="text-danger-600 text-sm sm:text-base font-semibold">Error loading action items. Please check if the backend server is running.</p>
            <p className="text-xs sm:text-sm text-danger-500 mt-2">{actionsError.message}</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 sm:p-6 shadow-soft">
            {upcomingActions.length > 0 ? (
              <ul className="space-y-3">
                {upcomingActions.map((action, index) => (
                  <li key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-warning-50 to-yellow-50 rounded-xl border border-warning-100">
                    <div className="w-3 h-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full mt-2 flex-shrink-0 shadow-soft"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm sm:text-base font-semibold">{action.task}</p>
                      <p className="text-xs sm:text-sm text-warning-700 font-medium">Due: {action.due_date || action.dueDate}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl inline-block mb-4">
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-center text-sm sm:text-base font-medium">No upcoming action items.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
