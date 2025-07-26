import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Zap,
  ChevronRight,
  Star,
  Quote,
  FileText
} from 'lucide-react';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: "Smart Meeting Summaries",
      description: "AI-powered transcription and intelligent summarization of your board meetings in real-time."
    },
    {
      icon: <CheckSquare className="h-8 w-8 text-blue-600" />,
      title: "Action Item Tracking",
      description: "Automatically extract and track action items with assignees and due dates from board decisions."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Governance Insights",
      description: "Generate detailed governance notes and track compliance requirements for better board oversight."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      title: "Analytics & Reports",
      description: "Get valuable insights about board effectiveness, decision patterns, and governance metrics."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Board Chair",
      company: "TechCorp",
      content: "BoardBrief has transformed how we handle board meeting follow-ups. The AI summaries are incredibly accurate and save us hours.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "CEO",
      company: "GrowthCo",
      content: "The governance insights and action tracking have improved our board effectiveness significantly. A game-changer for board management.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Corporate Secretary",
      company: "InnovateLabs",
      content: "Finally, a solution that actually understands board context and creates meaningful governance documentation.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 antialiased">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                BoardBrief
              </span>
            </div>
            
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
            </div>
            
            <div className="flex sm:hidden items-center space-x-2">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-md transition-all duration-200"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full max-w-6xl">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-6">
                🚀 AI-Powered Board Intelligence
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-gray-900 mb-8 lg:mb-12 leading-[1.1] tracking-tight">
              Transform Your{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Board Meetings
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-300 rounded-lg opacity-30"></div>
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-12 lg:mb-16 max-w-5xl mx-auto leading-relaxed font-light">
              AI-powered meeting intelligence that captures, summarizes, and tracks everything important.{" "}
              <span className="text-gray-800 font-medium">Turn your board meetings into actionable business insights.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 lg:mb-20">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 min-w-[280px] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Start Free Trial</span>
                <ChevronRight className="h-6 w-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="group bg-white text-gray-800 px-10 py-5 rounded-2xl text-xl font-bold border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transform hover:scale-105 transition-all duration-300 min-w-[280px]"
              >
                <span className="group-hover:text-blue-600 transition-colors duration-300">Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl lg:text-5xl font-black text-blue-600 mb-3">98%</div>
                <div className="text-gray-700 text-base lg:text-lg font-medium">Accuracy Rate</div>
                <div className="text-gray-500 text-sm mt-1">Industry-leading precision</div>
              </div>
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl lg:text-5xl font-black text-blue-600 mb-3">50+</div>
                <div className="text-gray-700 text-base lg:text-lg font-medium">Meetings Processed</div>
                <div className="text-gray-500 text-sm mt-1">And growing daily</div>
              </div>
              <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl lg:text-5xl font-black text-blue-600 mb-3">5+</div>
                <div className="text-gray-700 text-base lg:text-lg font-medium">Companies Using</div>
                <div className="text-gray-500 text-sm mt-1">Trusted by leaders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                ⚡ Powerful Features
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 lg:mb-8 leading-tight">
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Effective Board Meetings
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Our AI-powered platform handles the heavy lifting so you can focus on what matters most -{" "}
              <span className="text-gray-800 font-medium">strategic decisions and governance excellence.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 lg:p-10 rounded-3xl border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg lg:text-xl font-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-blue-100/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm text-blue-800 text-sm font-medium rounded-full border border-blue-200">
                💬 Customer Stories
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 lg:mb-8 leading-tight">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Board Leaders
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              See what board chairs, CEOs, and corporate secretaries say about{" "}
              <span className="text-gray-800 font-medium">transforming their governance workflows.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:bg-white hover:border-blue-200 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-8 leading-relaxed text-lg font-light relative">
                  <Quote className="h-8 w-8 text-blue-300 mb-4 opacity-50" />
                  <span className="text-xl font-medium text-gray-800">"{testimonial.content}"</span>
                </blockquote>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-blue-600 font-medium text-sm">
                      {testimonial.role}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/5"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20">
              🎯 Ready to Get Started?
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 lg:mb-8 leading-tight">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Board Meetings?
            </span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-blue-100 mb-12 lg:mb-16 leading-relaxed font-light max-w-4xl mx-auto">
            Join hundreds of organizations who have already revolutionized their board governance.{" "}
            <span className="text-white font-medium">Start your free trial today.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="group bg-white text-gray-900 px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl hover:shadow-white/25 transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-3 min-w-[280px] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <Zap className="h-6 w-6 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
              <span className="relative z-10">Get Started Now</span>
            </button>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="group bg-transparent text-white px-10 py-5 rounded-2xl text-xl font-bold border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 min-w-[280px]"
            >
              Schedule Demo
            </button>
          </div>
          
          <div className="text-blue-200 text-sm">
            ✨ No credit card required • 14-day free trial • Setup in minutes
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 lg:py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  BoardBrief
                </span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                Transform your board meetings with AI-powered intelligence. 
                Capture, summarize, and track everything that matters.
              </p>
              <div className="flex space-x-4 mt-6">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">Tw</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">Li</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">Gh</span>
                </div>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-center pt-8 border-t border-gray-800 space-y-4 lg:space-y-0">
            <div className="text-gray-400 text-center lg:text-left">
              <p className="text-sm lg:text-base">&copy; 2025 BoardBrief. All rights reserved.</p>
              <p className="text-xs lg:text-sm mt-1">Powered by AI • Built for Boards • Trusted Worldwide</p>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => setIsRegisterOpen(true)}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => setIsLoginOpen(true)}
      />
    </div>
  );
};

export default LandingPage;
