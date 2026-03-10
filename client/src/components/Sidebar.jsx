import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Bot, Briefcase, 
  ClipboardCheck, Route, User, X, GraduationCap
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/ai-chat', icon: Bot, label: 'AI Assistant' },
  { path: '/interview-prep', icon: Briefcase, label: 'Interview Prep' },
  { path: '/assessments', icon: ClipboardCheck, label: 'Assessments' },
  { path: '/learning-path', icon: Route, label: 'Learning Path' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-dark-900 border-r border-dark-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">NEXUS</h1>
              <p className="text-xs text-dark-400">AI Learning Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-dark-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        {user && (
          <div className="p-4 border-t border-dark-700">
            <div className="glass-card !p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-dark-400">{user.totalXP || 0} XP</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((user.totalXP || 0) % 500) / 5, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-dark-400 capitalize">{user.level}</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
