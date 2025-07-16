import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  SettingsIcon,
  Puzzle,
  Upload,
  User,
  Building2,
  Globe,
  Briefcase,
} from "lucide-react"
import UploadModal from "./UploadModal"

const Layout = ({ children }) => {
  const location = useLocation()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Meetings", href: "/meetings", icon: Calendar },
    { name: "Action Items", href: "/action-items", icon: CheckSquare },
    { name: "Integrations", href: "/integrations", icon: Puzzle },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ]

  const recentClients = [
    { name: "Tech Solutions Inc.", icon: Building2 },
    { name: "Global Innovations", icon: Globe },
    { name: "Acme Corp", icon: Briefcase },
  ]

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
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Clients</h3>
              <div className="space-y-2">
                {recentClients.map((client) => {
                  const Icon = client.icon
                  return (
                    <div
                      key={client.name}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{client.name}</span>
                    </div>
                  )
                })}
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
