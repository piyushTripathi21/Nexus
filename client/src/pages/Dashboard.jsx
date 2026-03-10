import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Trophy, Flame, Target, TrendingUp, Clock,
  ArrowRight, Bot, Briefcase, CheckCircle2, BarChart3
} from 'lucide-react';
import { StatCard, LoadingSpinner } from '../components/ui';
import { progressAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await progressAPI.getDashboard();
      setDashboard(res.data.dashboard);
    } catch (error) {
      // Use fallback data if API not available
      setDashboard({
        user: { name: user?.name, totalXP: user?.totalXP || 0, learningStreak: user?.learningStreak || { current: 0, longest: 0 }, level: user?.level },
        progress: { completedTopics: 0, totalTopics: 50, completionPercentage: 0 },
        assessmentStats: { totalAttempted: 0, totalPassed: 0, averageScore: 0, bestScore: 0 },
        recentTopics: [],
        xpLevel: { name: 'Beginner', tier: 1, icon: '🌱' }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const d = dashboard;

  const quickActions = [
    { icon: BookOpen, label: 'Browse Subjects', desc: 'Explore all CS topics', path: '/subjects', color: 'from-blue-500 to-cyan-500' },
    { icon: Bot, label: 'AI Assistant', desc: 'Ask anything about CS', path: '/ai-chat', color: 'from-purple-500 to-pink-500' },
    { icon: Briefcase, label: 'Interview Prep', desc: 'Practice questions', path: '/interview-prep', color: 'from-orange-500 to-red-500' },
    { icon: Target, label: 'Take Assessment', desc: 'Test your knowledge', path: '/assessments', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card bg-gradient-to-r from-primary-500/10 via-purple-500/10 to-pink-500/10 border-primary-500/20"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome back, {d?.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-dark-300">
              {d?.xpLevel?.icon} Level: <span className="text-white font-semibold">{d?.xpLevel?.name}</span>
              {' · '}Keep learning to unlock new achievements!
            </p>
          </div>
          <Link to="/subjects" className="btn-primary flex items-center gap-2 shrink-0">
            Continue Learning <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Total XP" value={d?.user?.totalXP || 0} subtitle={`Level: ${d?.xpLevel?.name}`} color="primary" />
        <StatCard icon={Flame} label="Day Streak" value={d?.user?.learningStreak?.current || 0} subtitle={`Best: ${d?.user?.learningStreak?.longest || 0}`} color="orange" />
        <StatCard icon={CheckCircle2} label="Topics Done" value={d?.progress?.completedTopics || 0} subtitle={`of ${d?.progress?.totalTopics}`} color="green" />
        <StatCard icon={BarChart3} label="Avg Score" value={`${d?.assessmentStats?.averageScore || 0}%`} subtitle={`${d?.assessmentStats?.totalAttempted || 0} tests`} color="blue" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ icon: Icon, label, desc, path, color }) => (
            <Link
              key={label}
              to={path}
              className="glass-card card-hover group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{label}</h3>
              <p className="text-sm text-dark-400">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <div className="glass-card">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            Learning Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-300">Overall Completion</span>
                <span className="text-sm font-semibold text-primary-400">{d?.progress?.completionPercentage || 0}%</span>
              </div>
              <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d?.progress?.completionPercentage || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-dark-800/50">
                <p className="text-2xl font-bold text-white">{d?.progress?.completedTopics}</p>
                <p className="text-xs text-dark-400">Topics Completed</p>
              </div>
              <div className="p-3 rounded-xl bg-dark-800/50">
                <p className="text-2xl font-bold text-white">{d?.assessmentStats?.totalPassed}</p>
                <p className="text-xs text-dark-400">Assessments Passed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            Recent Topics
          </h3>
          {d?.recentTopics?.length > 0 ? (
            <div className="space-y-3">
              {d.recentTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{topic.title}</p>
                    <p className="text-xs text-dark-400">{topic.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400 text-sm">No topics completed yet</p>
              <Link to="/subjects" className="text-primary-400 text-sm hover:text-primary-300 mt-1 inline-block">
                Start learning →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
