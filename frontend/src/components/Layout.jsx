import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  SettingsIcon,
  Puzzle,
  Upload,
  User,
  Circle,
  CheckCircle,
} from "lucide-react"
import UploadModal from "./UploadModal"
import { fetchActionItems } from "../services/api"

const Layout = ({ children }) => {
  const location = useLocation()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [actionItems, setActionItems] = useState([])
  const [isLoadingActions, setIsLoadingActions] = useState(true)

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Meetings", href: "/meetings", icon: Calendar },
    { name: "Action Items", href: "/action-items", icon: CheckSquare },
    { name: "Integrations", href: "/integrations", icon: Puzzle },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ]

  useEffect(() => {
    const loadActionItems = async () => {
      try {
        const items = await fetchActionItems()
        // Show only pending items, limit to 5 for sidebar
        const pendingItems = items.filter(item => !item.completed).slice(0, 5)
        setActionItems(pendingItems)
      } catch (error) {
        console.error("Failed to load action items:", error)
        setActionItems([])
      } finally {
        setIsLoadingActions(false)
      }
    }

    loadActionItems()
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Meeting Insights</span>
            </div>
            <div className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium ${
                    isActive(item.href) ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive(item.href) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action Items</h3>
                <Link 
                  to="/action-items" 
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {isLoadingActions ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="px-3 py-2 animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : actionItems.length > 0 ? (
                  actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Circle className="h-3 w-3 mt-1 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs">{item.task}</p>
                        {item.meeting_title && (
                          <p className="text-xs text-gray-500 truncate">
                            From: {item.meeting_title}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No pending action items
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{children}</div>
      </div>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  )
}

export default Layout
