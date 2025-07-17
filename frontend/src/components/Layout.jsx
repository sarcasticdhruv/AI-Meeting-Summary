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
  Menu,
  X,
} from "lucide-react"
import UploadModal from "./UploadModal"
import { fetchActionItems } from "../services/api"

const Layout = ({ children }) => {
  const location = useLocation()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100/80 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-soft">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                <span className="hidden sm:inline">Meeting Insights</span>
                <span className="sm:hidden">Insights</span>
              </span>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden lg:flex space-x-1 ml-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href) 
                      ? "bg-primary-50 text-primary-700 shadow-soft" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium hover:shadow-medium transform hover:scale-105 flex items-center space-x-1 sm:space-x-2 transition-all duration-200"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-soft">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200/50 animate-slide-down">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(item.href) 
                        ? "bg-primary-50 text-primary-700 shadow-soft" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 bg-white/50 backdrop-blur-sm border-r border-gray-200/50 min-h-screen">
          <div className="p-6">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive(item.href) 
                        ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-soft" 
                        : "text-gray-700 hover:bg-gray-50/80 hover:shadow-soft"
                    }`}
                  >
                    <Icon className={`h-5 w-5 transition-colors ${
                      isActive(item.href) ? "text-primary-600" : "text-gray-500 group-hover:text-gray-700"
                    }`} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Actions</h3>
                <Link 
                  to="/action-items" 
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {isLoadingActions ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="px-4 py-3 animate-pulse">
                        <div className="h-3 bg-gray-200 rounded-lg w-full mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded-lg w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : actionItems.length > 0 ? (
                  actionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 rounded-xl transition-all duration-200 group"
                    >
                      <Circle className="h-3 w-3 mt-1 flex-shrink-0 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-medium">{item.task}</p>
                        {item.meeting_title && (
                          <p className="text-xs text-gray-500 truncate">
                            From: {item.meeting_title}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-gray-500 text-center bg-gray-50/50 rounded-xl">
                    No pending actions
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  )
}

export default Layout
