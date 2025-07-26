import { useState } from "react"
import { Mail, Slack, CalendarIcon, Database, Globe, Zap, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react"

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'email',
      name: "Email Notifications",
      description: "Send meeting summaries and action items via email",
      icon: Mail,
      connected: true,
      color: "bg-red-500",
      category: "Communication",
      config: { enabled: true, autoSend: true }
    },
    {
      id: 'slack',
      name: "Slack",
      description: "Post summaries to Slack channels automatically",
      icon: Slack,
      connected: false,
      color: "bg-purple-500",
      category: "Communication",
      config: { channel: "#meetings", mentions: true }
    },
    {
      id: 'calendar',
      name: "Calendar Sync",
      description: "Sync action items with Google Calendar or Outlook",
      icon: CalendarIcon,
      connected: true,
      color: "bg-blue-500",
      category: "Productivity",
      config: { autoSchedule: true, reminders: true }
    },
    {
      id: 'crm',
      name: "CRM Integration",
      description: "Export notes and insights to your CRM system",
      icon: Database,
      connected: false,
      color: "bg-green-500",
      category: "Sales",
      config: { autoSync: false, fields: ['summary', 'actions'] }
    },
    {
      id: 'webhook',
      name: "Webhooks",
      description: "Send data to custom endpoints for advanced workflows",
      icon: Zap,
      connected: false,
      color: "bg-yellow-500",
      category: "Developer",
      config: { url: '', headers: {} }
    },
    {
      id: 'zapier',
      name: "Zapier",
      description: "Connect with 5000+ apps through Zapier automation",
      icon: Globe,
      connected: false,
      color: "bg-orange-500",
      category: "Automation",
      config: { triggers: ['new_meeting', 'action_completed'] }
    }
  ])

  const [selectedCategory, setSelectedCategory] = useState("All")
  const categories = ["All", "Communication", "Productivity", "Sales", "Developer", "Automation"]

  const toggleConnection = (integrationId) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, connected: !integration.connected }
        : integration
    ))
  }

  const filteredIntegrations = integrations.filter(integration => 
    selectedCategory === "All" || integration.category === selectedCategory
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-large">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Integrations</h1>
        </div>
        <p className="text-primary-100 text-sm sm:text-base">
          Connect your favorite tools to streamline your meeting workflow.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? "bg-primary-600 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon
          return (
            <div
              key={integration.id}
              className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`${integration.color} p-3 rounded-xl shadow-soft`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{integration.name}</h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-lg font-medium">
                      {integration.category}
                    </span>
                  </div>
                </div>
                {integration.connected && (
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">{integration.description}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleConnection(integration.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    integration.connected 
                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70" 
                      : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md"
                  }`}
                >
                  <span>{integration.connected ? "Connected" : "Connect"}</span>
                  {!integration.connected && <ExternalLink className="h-4 w-4" />}
                </button>

                {integration.connected && (
                  <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-sm font-medium">
                    Configure
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Integration Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Integration Status</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {integrations.filter(i => i.connected).length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 font-medium">Connected</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {integrations.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Available</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round((integrations.filter(i => i.connected).length / integrations.length) * 100)}%
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Coverage</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Integrations
