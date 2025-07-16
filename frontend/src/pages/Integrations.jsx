import { Mail, Slack, CalendarIcon, Database, AlertTriangle } from "lucide-react"


const Integrations = () => {
  // const integrations = [
  //   {
  //     name: "Email",
  //     description: "Send meeting summaries via email",
  //     icon: Mail,
  //     connected: false,
  //     color: "bg-red-500",
  //   },
  //   {
  //     name: "Slack",
  //     description: "Post summaries to Slack channels",
  //     icon: Slack,
  //     connected: false,
  //     color: "bg-purple-500",
  //   },
  //   {
  //     name: "Calendar",
  //     description: "Sync action items with calendar",
  //     icon: CalendarIcon,
  //     connected: true,
  //     color: "bg-blue-500",
  //   },
  //   {
  //     name: "CRM",
  //     description: "Export notes to your CRM system",
  //     icon: Database,
  //     connected: false,
  //     color: "bg-green-500",
  //   },
  // ]

  return (
    // <div className="space-y-6">
    //   <div>
    //     <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
    //     <p className="text-gray-600 mt-1">Connect your favorite tools to streamline your workflow.</p>
    //   </div>

    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //     {integrations.map((integration) => {
    //       const Icon = integration.icon
    //       return (
    //         <div
    //           key={integration.name}
    //           className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    //         >
    //           <div className="flex items-start justify-between">
    //             <div className="flex items-start space-x-4">
    //               <div className={`${integration.color} p-3 rounded-lg`}>
    //                 <Icon className="h-6 w-6 text-white" />
    //               </div>
    //               <div>
    //                 <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
    //                 <p className="text-gray-600 text-sm mt-1">{integration.description}</p>
    //               </div>
    //             </div>
    //             <button
    //               className={`px-4 py-2 rounded-lg text-sm font-medium ${
    //                 integration.connected ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
    //               }`}
    //             >
    //               {integration.connected ? "Connected" : "Connect"}
    //             </button>
    //           </div>
    //         </div>
    //       )
    //     })}
    //   </div>
    // </div>
    <div className="flex flex-col items-center justify-center h-full py-20">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-800">Integrations Page Under Construction</h1>
    </div>
  )
}

export default Integrations
