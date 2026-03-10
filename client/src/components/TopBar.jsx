import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, LogOut, Flame } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function TopBar({ onMenuClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/subjects?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 border-b border-dark-700 bg-dark-900/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden text-dark-300 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>

        <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search topics, subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm
                         placeholder:text-dark-400 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </form>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Streak */}
        {user?.learningStreak?.current > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">
              {user.learningStreak.current}
            </span>
          </div>
        )}

        {/* XP Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/20">
          <span className="text-sm font-semibold text-primary-400">
            {user?.totalXP || 0} XP
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-dark-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-2 text-dark-400 hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
