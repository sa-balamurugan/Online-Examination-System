import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">ExamSystem</span>
              <span className="ml-2 px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 uppercase">
                {user?.role}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline-block">{user?.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline-block text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
