import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Route, Sparkles, Loader2, CheckCircle, Circle, Lock,
  Clock, Zap, ChevronRight, Target, BarChart3, BookOpen, Trophy
} from 'lucide-react';
import { DifficultyBadge, LoadingSpinner } from '../components/ui';
import { learningPathAPI, subjectsAPI } from '../services/api';

export default function LearningPath() {
  const [paths, setPaths] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genSubject, setGenSubject] = useState('');
  const [genLevel, setGenLevel] = useState('beginner');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        learningPathAPI.getAll(),
        subjectsAPI.getAll()
      ]);
      setPaths(pRes.data.paths || pRes.data.learningPaths || []);
      setSubjects(sRes.data.subjects || []);
    } catch {
      setPaths([]);
      setSubjects([]);
    } finally { setLoading(false); }
  };

  const generatePath = async () => {
    if (!genSubject) return;
    setGenerating(true);
    try {
      const sub = subjects.find(s => s._id === genSubject);
      const res = await learningPathAPI.generate({
        subject: sub?.name || genSubject,
        level: genLevel
      });
      if (res.data.path || res.data.learningPath) {
        const path = res.data.path || res.data.learningPath;
        setPaths(prev => [path, ...prev]);
        setActivePath(path);
      }
    } catch {} finally { setGenerating(false); }
  };

  const completeMilestone = async (pathId, milestoneId) => {
    try {
      await learningPathAPI.completeMilestone(pathId, milestoneId);
      // Update locally
      setPaths(prev => prev.map(p => {
        if (p._id === pathId) {
          return {
            ...p,
            milestones: p.milestones?.map(m =>
              m._id === milestoneId ? { ...m, completed: true, completedAt: new Date() } : m
            )
          };
        }
        return p;
      }));
      if (activePath?._id === pathId) {
        setActivePath(prev => ({
          ...prev,
          milestones: prev.milestones?.map(m =>
            m._id === milestoneId ? { ...m, completed: true, completedAt: new Date() } : m
          )
        }));
      }
    } catch {}
  };

  if (loading) return <LoadingSpinner text="Loading learning paths..." />;

  // --- DETAIL VIEW ---
  if (activePath) {
    const milestones = activePath.milestones || [];
    const completed = milestones.filter(m => m.completed).length;
    const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => setActivePath(null)} className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Paths
        </button>

        {/* Header */}
        <div className="glass-card">
          <h1 className="text-2xl font-bold text-white mb-2">{activePath.title}</h1>
          {activePath.description && <p className="text-dark-400 mb-4">{activePath.description}</p>}
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <DifficultyBadge difficulty={activePath.level || activePath.difficulty} />
            <span className="text-sm text-dark-400 flex items-center gap-1">
              <Target className="w-4 h-4" /> {milestones.length} milestones
            </span>
            {activePath.estimatedDuration && (
              <span className="text-sm text-dark-400 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {activePath.estimatedDuration}
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-dark-400">{completed} of {milestones.length} completed</span>
              <span className="text-primary-400 font-medium">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-dark-700" />

          <div className="space-y-4">
            {milestones.map((m, i) => {
              const isCompleted = m.completed;
              const isCurrent = !isCompleted && (i === 0 || milestones[i - 1]?.completed);

              return (
                <motion.div
                  key={m._id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-green-500/20 border-2 border-green-500'
                      : isCurrent
                        ? 'bg-primary-500/20 border-2 border-primary-500 animate-pulse'
                        : 'bg-dark-800 border-2 border-dark-600'
                  }`}>
                    {isCompleted
                      ? <CheckCircle className="w-5 h-5 text-green-400" />
                      : isCurrent
                        ? <Circle className="w-5 h-5 text-primary-400" />
                        : <Lock className="w-4 h-4 text-dark-500" />}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 glass-card !p-4 ${isCurrent ? 'border-primary-500/30' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className={`font-semibold ${isCompleted ? 'text-dark-400 line-through' : 'text-white'}`}>
                          {m.title}
                        </h3>
                        {m.description && (
                          <p className="text-sm text-dark-400 mt-1">{m.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {m.estimatedTime && (
                            <span className="text-xs text-dark-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {m.estimatedTime}
                            </span>
                          )}
                          {m.xpReward && (
                            <span className="text-xs text-primary-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> {m.xpReward} XP
                            </span>
                          )}
                        </div>
                        {m.resources?.length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {m.resources.map((r, ri) => (
                              <a
                                key={ri}
                                href={r.url || '#'}
                                className="text-xs text-primary-400 underline hover:text-primary-300"
                              >
                                {r.title || `Resource ${ri + 1}`}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {isCurrent && !isCompleted && (
                        <button
                          onClick={() => completeMilestone(activePath._id, m._id)}
                          className="btn-primary !py-2 !px-3 text-xs shrink-0"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {progress === 100 && (
          <div className="glass-card text-center py-8 border-yellow-500/30">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Path Completed!</h3>
            <p className="text-dark-400">You've mastered this learning path. Great job!</p>
          </div>
        )}
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Route className="w-8 h-8 text-primary-400" /> Learning Paths
        </h1>
        <p className="text-dark-400 mt-1">Follow structured paths to master CS subjects</p>
      </div>

      {/* Generate */}
      <div className="glass-card">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" /> Generate AI Learning Path
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={genSubject} onChange={(e) => setGenSubject(e.target.value)} className="input-field flex-1">
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <select value={genLevel} onChange={(e) => setGenLevel(e.target.value)} className="input-field !w-auto">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button
            onClick={generatePath}
            disabled={!genSubject || generating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Path
          </button>
        </div>
      </div>

      {/* Existing Paths */}
      {paths.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {paths.map((p, i) => {
            const milestones = p.milestones || [];
            const completed = milestones.filter(m => m.completed).length;
            const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

            return (
              <motion.div
                key={p._id || i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card card-hover cursor-pointer"
                onClick={() => setActivePath(p)}
              >
                <h3 className="font-semibold text-white mb-1">{p.title}</h3>
                {p.description && <p className="text-sm text-dark-400 mb-3 line-clamp-2">{p.description}</p>}

                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <DifficultyBadge difficulty={p.level || p.difficulty} />
                  <span className="text-xs text-dark-500">{milestones.length} milestones</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-primary-400 font-medium">{progress}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card text-center py-12">
          <Route className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">No Learning Paths Yet</h3>
          <p className="text-dark-400 text-sm">Generate your first personalized learning path above!</p>
        </div>
      )}
    </div>
  );
}
