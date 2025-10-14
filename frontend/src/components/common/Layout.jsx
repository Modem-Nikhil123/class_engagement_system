import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { LogOut, User, Bell } from 'lucide-react';

const Layout = ({ children, title }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'teacher':
        return 'bg-blue-500';
      case 'student':
        return 'bg-green-500';
      case 'admin':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CE</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  <p className="text-sm text-gray-500">Class Engagement System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 border-l pl-4">
                <button
                  onClick={handleProfileClick}
                  className={`w-10 h-10 ${getRoleColor(user?.role || '')} rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
                  title="View Profile"
                >
                  <User className="h-5 w-5 text-white" />
                </button>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(user?.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;