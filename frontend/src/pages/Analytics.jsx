import { useQuery } from "@tanstack/react-query"
import { BarChart3, TrendingUp, Users, Clock, Calendar, FileText, CheckCircle, Target } from "lucide-react"
import { fetchAnalytics } from "../services/api"

const Analytics = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-large animate-pulse">
          <div className="h-8 bg-white/20 rounded-xl w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded-xl w-2/3"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-soft animate-pulse">
              <div className="h-4 bg-gray-200 rounded-xl w-2/3 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded-xl w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-large">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          <p className="text-primary-100 text-sm sm:text-base">
            Track your meeting productivity and insights over time.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-semibold">Unable to load analytics data</p>
          <p className="text-red-500 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const mockAnalytics = {
    totalMeetings: 47,
    totalHours: 156,
    actionItemsCompleted: 89,
    averageMeetingDuration: 3.3,
    monthlyTrend: "+12%",
    completionRate: 85,
    topClients: [
      { name: "Tech Corp", meetings: 12 },
      { name: "StartupXYZ", meetings: 8 },
      { name: "Enterprise LLC", meetings: 6 },
    ],
    recentActivity: [
      { type: "meeting", title: "Product Review", date: "2 hours ago" },
      { type: "action", title: "Follow up with client", date: "1 day ago" },
      { type: "meeting", title: "Strategy Session", date: "2 days ago" },
    ]
  }

  const data = analytics || mockAnalytics

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-large">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <p className="text-primary-100 text-sm sm:text-base">
          Track your meeting productivity and insights over time.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-semibold">{data.monthlyTrend}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{data.totalMeetings}</h3>
          <p className="text-gray-600 text-sm">Total Meetings</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-blue-600 text-sm font-semibold">{data.averageMeetingDuration}h avg</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{data.totalHours}</h3>
          <p className="text-gray-600 text-sm">Total Hours</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-semibold">{data.completionRate}%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{data.actionItemsCompleted}</h3>
          <p className="text-gray-600 text-sm">Actions Completed</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-orange-600 text-sm font-semibold">↗ Growth</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{data.completionRate}%</h3>
          <p className="text-gray-600 text-sm">Completion Rate</p>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-900">Top Clients</h2>
          </div>
          <div className="space-y-4">
            {data.topClients?.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{client.name}</span>
                </div>
                <span className="text-blue-600 font-semibold">{client.meetings} meetings</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {data.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-gray-200 rounded-lg">
                  {activity.type === 'meeting' ? (
                    <Calendar className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Target className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productivity Insights */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">Productivity Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Most Productive Day</h3>
            <p className="text-blue-600 text-sm">Tuesdays</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Average Attendees</h3>
            <p className="text-green-600 text-sm">4.2 people</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Optimal Duration</h3>
            <p className="text-purple-600 text-sm">45 minutes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
