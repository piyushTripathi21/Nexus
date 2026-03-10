import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Calendar, Zap, Trophy, Flame, BookOpen,
  Code2, Brain, Edit3, Save, X, Settings, Shield, BarChart3
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { progressAPI, authAPI } from '../services/api';
import { LoadingSpinner } from '../components/ui';

const levels = [
  { min: 0, label: 'Novice', color: '#6b7280' },
  { min: 100, label: 'Beginner', color: '#22c55e' },
  { min: 500, label: 'Intermediate', color: '#3b82f6' },
  { min: 1500, label: 'Advanced', color: '#a855f7' },
  { min: 3000, label: 'Expert', color: '#f59e0b' },
  { min: 5000, label: 'Master', color: '#ef4444' },
];

function getLevel(xp) {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].min) return levels[i];
  }
  return levels[0];
}

function getNextLevel(xp) {
  for (const level of levels) {
    if (xp < level.min) return level;
  }
  return null;
}

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    preferredLanguage: 'python',
    level: 'beginner'
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        preferredLanguage: user.preferredLanguage || 'python',
        level: user.level || 'beginner'
      });
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await progressAPI.getDashboard();
      setStats(res.data);
    } catch {
      setStats(null);
    } finally { setLoading(false); }
  };

  const saveProfile = async () => {
    try {
      await updateUser({ name: form.name, preferredLanguage: form.preferredLanguage, level: form.level });
      setEditing(false);
    } catch {}
  };

  const currentLevel = getLevel(user?.xp || 0);
  const nextLevel = getNextLevel(user?.xp || 0);
  const xpProgress = nextLevel
    ? ((user?.xp || 0) - currentLevel.min) / (nextLevel.min - currentLevel.min) * 100
    : 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="w-7 h-7 text-primary-400" /> Profile
          </h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary !py-2 !px-3 flex items-center gap-2 text-sm"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-ghost !py-2 !px-3 text-sm flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={saveProfile} className="btn-primary !py-2 !px-3 text-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          )}
        </div>

        {/* Avatar & Name */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold"
            style={{ backgroundColor: `${currentLevel.color}20`, border: `2px solid ${currentLevel.color}` }}
          >
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field !py-2 text-lg font-bold"
              />
            ) : (
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            )}
            <p className="text-dark-400 flex items-center gap-1 mt-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
            <p className="text-dark-500 text-sm flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>

        {/* XP & Level */}
        <div className="p-4 bg-dark-800/60 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{ backgroundColor: `${currentLevel.color}20`, color: currentLevel.color }}
              >
                {currentLevel.label}
              </span>
              <span className="text-sm text-dark-400">Level</span>
            </div>
            <span className="text-primary-400 font-bold flex items-center gap-1">
              <Zap className="w-4 h-4" /> {user?.xp || 0} XP
            </span>
          </div>
          <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(to right, ${currentLevel.color}, ${nextLevel?.color || currentLevel.color})` }}
            />
          </div>
          {nextLevel && (
            <p className="text-xs text-dark-500 mt-1 text-right">
              {nextLevel.min - (user?.xp || 0)} XP to {nextLevel.label}
            </p>
          )}
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <Flame className="w-8 h-8 text-orange-400" />
          <div>
            <p className="text-xl font-bold text-white">{user?.streak || 0} day streak</p>
            <p className="text-xs text-dark-400">Keep learning daily to maintain your streak!</p>
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-dark-400" /> Preferences
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Preferred Language</label>
              <select
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                className="input-field"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-dark-400 mb-1 block">Experience Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="input-field"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Topics Completed', value: stats?.topicsCompleted || user?.topicsCompleted || 0, icon: BookOpen, color: 'text-blue-400' },
          { label: 'Assessments Taken', value: stats?.assessmentsTaken || 0, icon: Brain, color: 'text-purple-400' },
          { label: 'AI Chats', value: stats?.chatSessions || 0, icon: Code2, color: 'text-green-400' },
          { label: 'Current Streak', value: `${user?.streak || 0}d`, icon: Flame, color: 'text-orange-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card text-center !p-4"
          >
            <s.icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-dark-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <div className="glass-card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> Achievements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: 'First Steps', desc: 'Complete your first topic', icon: '🎯', unlocked: (user?.xp || 0) > 0 },
            { name: 'Streak Starter', desc: '3 day streak', icon: '🔥', unlocked: (user?.streak || 0) >= 3 },
            { name: 'Quiz Master', desc: 'Score 90%+ on assessment', icon: '🏆', unlocked: false },
            { name: 'Explorer', desc: 'Study 5 different subjects', icon: '🗺️', unlocked: false },
            { name: 'AI Whisperer', desc: '10 AI conversations', icon: '🤖', unlocked: false },
            { name: 'Code Warrior', desc: 'Complete 20 topics', icon: '⚔️', unlocked: false },
          ].map((a, i) => (
            <div
              key={a.name}
              className={`p-3 rounded-xl text-center transition-all ${
                a.unlocked
                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                  : 'bg-dark-800/50 opacity-50'
              }`}
            >
              <span className="text-2xl block mb-1">{a.icon}</span>
              <p className={`text-sm font-medium ${a.unlocked ? 'text-white' : 'text-dark-500'}`}>{a.name}</p>
              <p className="text-xs text-dark-500 mt-0.5">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card border-red-500/20">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" /> Account
        </h2>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
