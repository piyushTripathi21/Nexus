import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Zap, ChevronRight, Lock } from 'lucide-react';
import { LoadingSpinner, DifficultyBadge } from '../components/ui';
import { subjectsAPI, topicsAPI } from '../services/api';

export default function SubjectDetail() {
  const { slug } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, topRes] = await Promise.all([
        subjectsAPI.getBySlug(slug),
        topicsAPI.getBySubject(slug)
      ]);
      setSubject(subRes.data.subject);
      setTopics(topRes.data.topics);
    } catch {
      // Fallback
      setSubject({ name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug, description: 'CS Subject', icon: '📚', color: '#6366f1' });
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading subject..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Link to="/subjects" className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>

      {/* Subject Header */}
      <div className="glass-card" style={{ borderColor: `${subject?.color}30` }}>
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
            style={{ backgroundColor: `${subject?.color}20`, border: `1px solid ${subject?.color}40` }}
          >
            {subject?.icon}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{subject?.name}</h1>
            <p className="text-dark-300 mb-3">{subject?.description}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <DifficultyBadge difficulty={subject?.difficulty} />
              <span className="text-sm text-dark-400 flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {topics.length} Topics
              </span>
              {subject?.semester && (
                <span className="text-sm text-dark-400">Semester {subject.semester}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Topics</h2>
        {topics.length > 0 ? (
          <div className="space-y-3">
            {topics.map((topic, i) => (
              <motion.div
                key={topic._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/topics/${slug}/${topic.slug}`}
                  className="glass-card !p-4 flex items-center gap-4 card-hover group"
                >
                  {/* Number */}
                  <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-sm font-bold text-dark-300 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors shrink-0">
                    {String(topic.order || i + 1).padStart(2, '0')}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {topic.title}
                    </h3>
                    {topic.overview && (
                      <p className="text-sm text-dark-400 mt-1 line-clamp-1">{topic.overview}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <DifficultyBadge difficulty={topic.difficulty} />
                      {topic.estimatedTime && (
                        <span className="text-xs text-dark-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {topic.estimatedTime} min
                        </span>
                      )}
                      {topic.xpReward && (
                        <span className="text-xs text-primary-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> {topic.xpReward} XP
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card text-center py-12">
            <BookOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Topics Coming Soon</h3>
            <p className="text-dark-400 text-sm max-w-md mx-auto">
              We're building detailed content for this subject. Use the AI Assistant to explore topics now!
            </p>
            <Link to="/ai-chat" className="btn-primary mt-4 inline-flex items-center gap-2">
              Ask AI About This Subject <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
