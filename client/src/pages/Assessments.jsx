import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Sparkles, Loader2, Clock, CheckCircle, XCircle,
  ChevronRight, Trophy, BarChart3, BookOpen, Zap, ArrowLeft
} from 'lucide-react';
import { DifficultyBadge, LoadingSpinner } from '../components/ui';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { assessmentAPI, subjectsAPI } from '../services/api';

export default function Assessments() {
  const [view, setView] = useState('list'); // list | take | result
  const [assessments, setAssessments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [genSubject, setGenSubject] = useState('');
  const [genDifficulty, setGenDifficulty] = useState('medium');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, sRes, hRes] = await Promise.all([
        assessmentAPI.getAll(),
        subjectsAPI.getAll(),
        assessmentAPI.getHistory()
      ]);
      setAssessments(aRes.data.assessments || []);
      setSubjects(sRes.data.subjects || []);
      setHistory(hRes.data.results || []);
    } catch {
      setAssessments([]);
      setSubjects([]);
      setHistory([]);
    } finally { setLoading(false); }
  };

  const generateAssessment = async () => {
    if (!genSubject) return;
    setGenerating(true);
    try {
      const sub = subjects.find(s => s._id === genSubject);
      const res = await assessmentAPI.generate({
        topic: sub?.name || genSubject,
        difficulty: genDifficulty,
        questionCount: 10
      });
      if (res.data.assessment) {
        startAssessment(res.data.assessment);
      }
    } catch {} finally { setGenerating(false); }
  };

  const startAssessment = (assessment) => {
    setCurrentAssessment(assessment);
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setView('take');
  };

  const selectAnswer = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitAssessment = async () => {
    try {
      const formatted = Object.entries(answers).map(([qIdx, optIdx]) => ({
        questionIndex: parseInt(qIdx),
        selectedOption: optIdx
      }));
      const res = await assessmentAPI.submit(currentAssessment._id, { answers: formatted });
      setResult(res.data.result || res.data);
      setView('result');
    } catch {
      // Calculate locally
      const qs = currentAssessment.questions || [];
      let correct = 0;
      qs.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) correct++;
      });
      setResult({ score: Math.round((correct / qs.length) * 100), correct, total: qs.length });
      setView('result');
    }
  };

  if (loading) return <LoadingSpinner text="Loading assessments..." />;

  // --- TAKE ASSESSMENT VIEW ---
  if (view === 'take' && currentAssessment) {
    const questions = currentAssessment.questions || [];
    const q = questions[currentQ];
    const progress = ((Object.keys(answers).length / questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => setView('list')} className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit Assessment
        </button>

        {/* Progress */}
        <div className="glass-card !p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-dark-400">Question {currentQ + 1} of {questions.length}</span>
            <span className="text-primary-400">{Object.keys(answers).length} answered</span>
          </div>
          <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        {q && (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
          >
            <p className="text-lg font-semibold text-white mb-6">{q.question}</p>
            <div className="space-y-3">
              {q.options?.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => selectAnswer(currentQ, oi)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    answers[currentQ] === oi
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-dark-700 bg-dark-800/50 text-dark-300 hover:border-dark-500 hover:bg-dark-700/50'
                  }`}
                >
                  <span className={`inline-block w-7 h-7 rounded-lg text-center leading-7 text-sm font-medium mr-3 ${
                    answers[currentQ] === oi
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-dark-400'
                  }`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              className="btn-primary"
            >
              Next <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          ) : (
            <button
              onClick={submitAssessment}
              disabled={Object.keys(answers).length < questions.length}
              className="btn-primary disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Submit
            </button>
          )}
        </div>

        {/* Question Nav Dots */}
        <div className="glass-card !p-3 flex gap-2 flex-wrap justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                currentQ === i
                  ? 'bg-primary-500 text-white'
                  : answers[i] !== undefined
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-dark-700 text-dark-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (view === 'result' && result) {
    const score = result.score || 0;
    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
    const gradeColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card text-center py-8"
        >
          <div className={`text-6xl font-bold ${gradeColor} mb-2`}>{grade}</div>
          <p className="text-3xl font-bold text-white mb-1">{score}%</p>
          <p className="text-dark-400">
            {result.correct || 0} correct out of {result.total || 0} questions
          </p>

          {result.xpEarned && (
            <p className="mt-4 text-primary-400 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" /> +{result.xpEarned} XP earned!
            </p>
          )}
        </motion.div>

        {/* Review answers if available */}
        {currentAssessment?.questions && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Review Answers</h3>
            {currentAssessment.questions.map((q, i) => {
              const userAnswer = answers[i];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={i} className={`glass-card !p-4 border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect
                      ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                    <p className="text-white text-sm font-medium">{q.question}</p>
                  </div>
                  {!isCorrect && q.options && (
                    <div className="ml-7 text-sm space-y-1">
                      {userAnswer !== undefined && (
                        <p className="text-red-400">Your answer: {q.options[userAnswer]}</p>
                      )}
                      <p className="text-green-400">Correct: {q.options[q.correctAnswer]}</p>
                    </div>
                  )}
                  {q.explanation && (
                    <p className="ml-7 mt-2 text-xs text-dark-400">{q.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button onClick={() => setView('list')} className="btn-secondary">Back to Assessments</button>
          {currentAssessment && (
            <button onClick={() => startAssessment(currentAssessment)} className="btn-primary flex items-center gap-2">
              <RefreshIcon /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-primary-400" /> Assessments
        </h1>
        <p className="text-dark-400 mt-1">Test your knowledge with quizzes and AI-generated assessments</p>
      </div>

      {/* AI Generate */}
      <div className="glass-card">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" /> Generate AI Assessment
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={genSubject}
            onChange={(e) => setGenSubject(e.target.value)}
            className="input-field flex-1"
          >
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <select
            value={genDifficulty}
            onChange={(e) => setGenDifficulty(e.target.value)}
            className="input-field !w-auto"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button
            onClick={generateAssessment}
            disabled={!genSubject || generating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>

      {/* Available Assessments */}
      {assessments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Available Assessments</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {assessments.map((a, i) => (
              <motion.div
                key={a._id || i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card card-hover cursor-pointer"
                onClick={() => startAssessment(a)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{a.title}</h3>
                  <DifficultyBadge difficulty={a.difficulty} />
                </div>
                <p className="text-sm text-dark-400 mb-3 line-clamp-2">{a.description}</p>
                <div className="flex items-center gap-3 text-xs text-dark-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {a.questions?.length || 0} questions
                  </span>
                  {a.timeLimit && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.timeLimit} min
                    </span>
                  )}
                  {a.xpReward && (
                    <span className="flex items-center gap-1 text-primary-400">
                      <Zap className="w-3 h-3" /> {a.xpReward} XP
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Recent Results
          </h2>
          <div className="space-y-2">
            {history.slice(0, 10).map((r, i) => (
              <div key={r._id || i} className="glass-card !p-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  r.score >= 80 ? 'bg-green-500/20 text-green-400'
                    : r.score >= 60 ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                }`}>
                  {r.score}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{r.assessmentTitle || 'Assessment'}</p>
                  <p className="text-xs text-dark-500">
                    {r.correct}/{r.total} correct
                    {r.completedAt && (' · ' + new Date(r.completedAt).toLocaleDateString())}
                  </p>
                </div>
                {r.xpEarned && (
                  <span className="text-xs text-primary-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> +{r.xpEarned}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {assessments.length === 0 && history.length === 0 && (
        <div className="glass-card text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">No Assessments Yet</h3>
          <p className="text-dark-400 text-sm">Generate your first AI assessment above!</p>
        </div>
      )}
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
