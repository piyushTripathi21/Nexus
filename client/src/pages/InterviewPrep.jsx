import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Search, Filter, ChevronDown, ChevronUp, Lightbulb,
  Building2, Sparkles, Loader2, BookOpen, RefreshCw
} from 'lucide-react';
import { DifficultyBadge, LoadingSpinner } from '../components/ui';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { interviewAPI, subjectsAPI } from '../services/api';

export default function InterviewPrep() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [subject, setSubject] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        interviewAPI.getAll(),
        subjectsAPI.getAll()
      ]);
      setQuestions(qRes.data.questions || []);
      setSubjects(sRes.data.subjects || []);
    } catch {
      setQuestions([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const topicName = subject !== 'all' ? subjects.find(s => s._id === subject)?.name : 'Data Structures';
      const res = await interviewAPI.generate({ topic: topicName, count: 5, difficulty: difficulty !== 'all' ? difficulty : undefined });
      if (res.data.questions) {
        setQuestions(prev => [...res.data.questions, ...prev]);
      }
    } catch {}
    finally { setGenerating(false); }
  };

  const getRandomQuestion = async () => {
    try {
      const res = await interviewAPI.getRandom();
      if (res.data.question) {
        setExpandedId(res.data.question._id);
        setQuestions(prev => {
          const exists = prev.find(q => q._id === res.data.question._id);
          return exists ? prev : [res.data.question, ...prev];
        });
      }
    } catch {}
  };

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.question?.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficulty === 'all' || q.difficulty === difficulty;
    const matchSubject = subject === 'all' || q.subject === subject;
    return matchSearch && matchDiff && matchSubject;
  });

  if (loading) return <LoadingSpinner text="Loading interview questions..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary-400" /> Interview Prep
          </h1>
          <p className="text-dark-400 mt-1">Practice real interview questions asked at top companies</p>
        </div>
        <div className="flex gap-2">
          <button onClick={getRandomQuestion} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" /> Random
          </button>
          <button onClick={generateQuestions} disabled={generating} className="btn-primary flex items-center gap-2 text-sm">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            AI Generate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card !p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="input-field !pl-10"
            />
          </div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="input-field !w-auto"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-field !w-auto"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {['easy', 'medium', 'hard'].map(level => (
          <div key={level} className="glass-card !p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {questions.filter(q => q.difficulty === level).length}
            </p>
            <DifficultyBadge difficulty={level} />
          </div>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map((q, i) => (
          <motion.div
            key={q._id || i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <div className="glass-card !p-0 overflow-hidden">
              {/* Question Header */}
              <button
                onClick={() => setExpandedId(expandedId === (q._id || i) ? null : (q._id || i))}
                className="w-full p-4 flex items-start gap-3 text-left hover:bg-dark-700/30 transition-colors"
              >
                <span className="text-xs font-mono text-dark-500 mt-1 shrink-0">
                  Q{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{q.question}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <DifficultyBadge difficulty={q.difficulty} />
                    {q.company && (
                      <span className="text-xs text-dark-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {q.company}
                      </span>
                    )}
                    {q.topic && (
                      <span className="text-xs text-dark-500">{q.topic}</span>
                    )}
                  </div>
                </div>
                {expandedId === (q._id || i)
                  ? <ChevronUp className="w-5 h-5 text-dark-500 shrink-0 mt-1" />
                  : <ChevronDown className="w-5 h-5 text-dark-500 shrink-0 mt-1" />}
              </button>

              {/* Expanded Answer */}
              <AnimatePresence>
                {expandedId === (q._id || i) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-dark-700">
                      {/* Hints */}
                      {q.hints?.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-sm font-medium text-yellow-400 flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4" /> Hints
                          </p>
                          <ul className="space-y-1">
                            {q.hints.map((h, hi) => (
                              <li key={hi} className="text-sm text-dark-300 flex items-start gap-2">
                                <span className="text-yellow-500 mt-0.5">•</span> {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Answer */}
                      {q.answer && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-green-400 mb-2">✅ Model Answer</p>
                          <div className="p-3 bg-dark-800/80 rounded-lg markdown-content text-sm">
                            <MarkdownRenderer content={q.answer} />
                          </div>
                        </div>
                      )}

                      {/* Follow-ups */}
                      {q.followUps?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-primary-400 mb-2">🔗 Follow-up Questions</p>
                          <ul className="space-y-1">
                            {q.followUps.map((f, fi) => (
                              <li key={fi} className="text-sm text-dark-300 p-2 bg-dark-800/40 rounded-lg">
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )) : (
          <div className="glass-card text-center py-12">
            <Brain className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">No Questions Found</h3>
            <p className="text-dark-400 text-sm mb-4">Try adjusting your filters or generate new questions with AI</p>
            <button onClick={generateQuestions} disabled={generating} className="btn-primary inline-flex items-center gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
