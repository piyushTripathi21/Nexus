import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 'md', text }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizes[size]} text-primary-500 animate-spin`} />
      {text && <p className="text-dark-400 text-sm">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center animate-pulse">
          <span className="text-2xl font-bold text-white">N</span>
        </div>
        <LoadingSpinner text="Loading..." />
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-dark-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-dark-400 text-center max-w-md mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, subtitle, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/20 text-primary-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400'
  };
  const c = colors[color];
  return (
    <div className={`glass-card bg-gradient-to-br ${c}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-dark-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && <Icon className={`w-8 h-8 opacity-60 ${c.split(' ').pop()}`} />}
      </div>
    </div>
  );
}

export function DifficultyBadge({ difficulty }) {
  const map = {
    easy: 'badge-easy', beginner: 'badge-beginner',
    medium: 'badge-medium', intermediate: 'badge-intermediate',
    hard: 'badge-hard', advanced: 'badge-advanced'
  };
  return (
    <span className={map[difficulty] || 'badge bg-dark-600 text-dark-300'}>
      {difficulty}
    </span>
  );
}
