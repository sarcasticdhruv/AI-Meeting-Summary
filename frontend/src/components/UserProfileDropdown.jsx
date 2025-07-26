import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, BarChart3, ChevronDown, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import authService from '../services/authService';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors group"
      >
        <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="hidden lg:block text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.full_name}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">{user.email}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
          <div className="p-4 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {profile && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Quick Stats</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400">{profile.total_meetings}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Meetings</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{profile.total_action_items}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Actions</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{profile.pending_action_items}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
                </div>
              </div>
            </div>
          )}

          <div className="p-2">
            <Link
              to="/analytics"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <BarChart3 className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">Analytics</span>
            </Link>
            
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            >
              <Settings className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">Settings</span>
            </Link>
            
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors group"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-400 group-hover:text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-red-50 rounded-xl transition-colors group"
            >
              <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
              <span className="text-sm text-gray-700 group-hover:text-red-900">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
