import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, BookOpen, Code2, Eye, Brain,
  ChevronDown, ChevronUp, Zap, Clock, Bookmark, BookmarkCheck,
  Copy, Check, Play
} from 'lucide-react';
import { LoadingSpinner, DifficultyBadge } from '../components/ui';
import MarkdownRenderer from '../components/MarkdownRenderer';
import MermaidDiagram from '../components/MermaidDiagram';
import { topicsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const tabs = [
  { id: 'content', label: 'Content', icon: BookOpen },
  { id: 'visuals', label: 'Visual', icon: Eye },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'practice', label: 'Practice', icon: Brain },
];

export default function TopicView() {
  const { subjectSlug, topicSlug } = useParams();
  const { user } = useAuthStore();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [selectedLang, setSelectedLang] = useState('python');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    loadTopic();
  }, [subjectSlug, topicSlug]);

  const loadTopic = async () => {
    setLoading(true);
    try {
      const res = await topicsAPI.getBySlug(subjectSlug, topicSlug);
      setTopic(res.data.topic);
      setIsCompleted(res.data.topic?.isCompleted || false);
      setIsBookmarked(res.data.topic?.isBookmarked || false);
      if (res.data.topic?.codeExamples?.length > 0) {
        setSelectedLang(res.data.topic.codeExamples[0].language);
      }
    } catch {
      setTopic(null);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await topicsAPI.markComplete(topic._id);
      setIsCompleted(true);
    } catch {}
  };

  const handleBookmark = async () => {
    try {
      await topicsAPI.toggleBookmark(topic._id);
      setIsBookmarked(!isBookmarked);
    } catch {}
  };

  const copyCode = (code, lang) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(lang);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return <LoadingSpinner text="Loading topic..." />;

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <BookOpen className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Topic Not Found</h2>
        <p className="text-dark-400 mb-6">This topic doesn't exist or hasn't been created yet.</p>
        <Link to={`/subjects/${subjectSlug}`} className="btn-primary">Go Back</Link>
      </div>
    );
  }

  const currentCode = topic.codeExamples?.find(c => c.language === selectedLang);
  const languages = topic.codeExamples?.map(c => c.language) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Nav */}
      <Link to={`/subjects/${subjectSlug}`} className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Subject
      </Link>

      {/* Header */}
      <div className="glass-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{topic.title}</h1>
            <p className="text-dark-300 mb-3">{topic.overview}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <DifficultyBadge difficulty={topic.difficulty} />
              {topic.estimatedTime && (
                <span className="text-sm text-dark-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {topic.estimatedTime} min
                </span>
              )}
              {topic.xpReward && (
                <span className="text-sm text-primary-400 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> {topic.xpReward} XP
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleBookmark} className="p-2 rounded-lg hover:bg-dark-700 transition-colors" title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
              {isBookmarked
                ? <BookmarkCheck className="w-5 h-5 text-primary-400" />
                : <Bookmark className="w-5 h-5 text-dark-400" />}
            </button>
            {!isCompleted ? (
              <button onClick={handleComplete} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Mark Complete
              </button>
            ) : (
              <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-800/60 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="glass-card">
              <div className="markdown-content">
                <MarkdownRenderer content={topic.content || 'No content available yet.'} />
              </div>

              {/* Key Points */}
              {topic.keyPoints?.length > 0 && (
                <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                  <h3 className="flex items-center gap-2 text-primary-400 font-semibold mb-3">
                    <Brain className="w-5 h-5" /> Key Points
                  </h3>
                  <ul className="space-y-2">
                    {topic.keyPoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-dark-200 text-sm">
                        <span className="text-primary-400 mt-1">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Real World Applications */}
              {topic.realWorldApplications?.length > 0 && (
                <div className="mt-6 p-4 bg-dark-800/60 rounded-xl">
                  <h3 className="text-white font-semibold mb-3">🌍 Real World Applications</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {topic.realWorldApplications.map((app, i) => (
                      <div key={i} className="p-3 bg-dark-700/50 rounded-lg text-sm text-dark-300">
                        {app}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visual Tab */}
          {activeTab === 'visuals' && (
            <div className="space-y-6">
              {topic.visualRepresentations?.length > 0 ? (
                topic.visualRepresentations.map((vis, i) => (
                  <div key={i} className="glass-card">
                    <h3 className="text-lg font-semibold text-white mb-2">{vis.title}</h3>
                    {vis.description && <p className="text-dark-400 text-sm mb-4">{vis.description}</p>}
                    {vis.type === 'mermaid' && vis.data ? (
                      <div className="bg-dark-800/80 rounded-xl p-4 overflow-x-auto">
                        <MermaidDiagram chart={vis.data} />
                      </div>
                    ) : vis.type === 'ascii' && vis.data ? (
                      <pre className="bg-dark-800 rounded-xl p-4 text-sm text-dark-200 font-mono overflow-x-auto whitespace-pre">
                        {vis.data}
                      </pre>
                    ) : (
                      <div className="bg-dark-800/50 rounded-xl p-6 text-center text-dark-500 text-sm">
                        Visual representation not available
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-card text-center py-12">
                  <Eye className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Visuals Yet</h3>
                  <p className="text-dark-400 text-sm mb-4">Ask our AI to generate visual explanations!</p>
                  <Link to="/ai-chat" className="btn-primary inline-flex items-center gap-2">
                    Generate Visual <Play className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Complexity */}
              {topic.complexity && (
                <div className="glass-card">
                  <h3 className="text-lg font-semibold text-white mb-4">⏱️ Complexity Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {topic.complexity.timeComplexity && (
                      <div className="p-4 bg-dark-800/60 rounded-xl">
                        <p className="text-sm text-dark-400 mb-1">Time Complexity</p>
                        <p className="text-xl font-mono text-primary-400">{topic.complexity.timeComplexity}</p>
                      </div>
                    )}
                    {topic.complexity.spaceComplexity && (
                      <div className="p-4 bg-dark-800/60 rounded-xl">
                        <p className="text-sm text-dark-400 mb-1">Space Complexity</p>
                        <p className="text-xl font-mono text-primary-400">{topic.complexity.spaceComplexity}</p>
                      </div>
                    )}
                  </div>
                  {topic.complexity.explanation && (
                    <p className="text-dark-300 text-sm mt-4">{topic.complexity.explanation}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <div className="glass-card">
              {languages.length > 0 ? (
                <>
                  {/* Language Selector */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {languages.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLang(lang)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                          selectedLang === lang
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-700/50 text-dark-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  {/* Code Block */}
                  {currentCode && (
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-dark-400">{currentCode.title || currentCode.language}</span>
                        <button
                          onClick={() => copyCode(currentCode.code, currentCode.language)}
                          className="flex items-center gap-1 text-xs text-dark-400 hover:text-white transition-colors px-2 py-1 rounded bg-dark-700/50"
                        >
                          {copiedCode === currentCode.language
                            ? <><Check className="w-3 h-3 text-green-400" /> Copied!</>
                            : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <div className="bg-dark-900 rounded-xl overflow-hidden">
                        <MarkdownRenderer content={`\`\`\`${currentCode.language}\n${currentCode.code}\n\`\`\``} />
                      </div>
                      {currentCode.explanation && (
                        <p className="text-sm text-dark-400 mt-3 p-3 bg-dark-800/50 rounded-lg">
                          💡 {currentCode.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Code2 className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Code Examples Yet</h3>
                  <p className="text-dark-400 text-sm mb-4">Ask our AI to generate code in any language!</p>
                  <Link to="/ai-chat" className="btn-primary inline-flex items-center gap-2">
                    Generate Code <Code2 className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Practice Tab */}
          {activeTab === 'practice' && (
            <div className="space-y-6">
              {/* Practice Problems */}
              {topic.practiceProblems?.length > 0 ? (
                topic.practiceProblems.map((prob, i) => (
                  <PracticeCard key={i} problem={prob} index={i} />
                ))
              ) : (
                <div className="glass-card text-center py-12">
                  <Brain className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Practice Problems Coming Soon</h3>
                  <p className="text-dark-400 text-sm mb-4">Try an AI-generated assessment instead!</p>
                  <Link to="/assessments" className="btn-primary inline-flex items-center gap-2">
                    Take Assessment <Zap className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Interview Questions */}
              <div className="glass-card">
                <h3 className="text-lg font-semibold text-white mb-4">🎯 Related Interview Questions</h3>
                <Link
                  to="/interview-prep"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  Browse Interview Questions <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PracticeCard({ problem, index }) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="glass-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-dark-500">#{index + 1}</span>
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <h3 className="text-white font-semibold mb-2">{problem.title || problem.question}</h3>
          {problem.description && <p className="text-dark-400 text-sm">{problem.description}</p>}
        </div>
      </div>

      {(problem.solution || problem.hint) && (
        <div className="mt-4">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            {showSolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
          <AnimatePresence>
            {showSolution && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 bg-dark-800/60 rounded-xl">
                  {problem.hint && (
                    <p className="text-sm text-yellow-400 mb-3">💡 Hint: {problem.hint}</p>
                  )}
                  {problem.solution && (
                    <div className="markdown-content">
                      <MarkdownRenderer content={problem.solution} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
