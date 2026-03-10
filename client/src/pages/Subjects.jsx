import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, Filter } from 'lucide-react';
import { LoadingSpinner, DifficultyBadge } from '../components/ui';
import { subjectsAPI } from '../services/api';

// Fallback subjects when API isn't connected
const fallbackSubjects = [
  { _id: '1', name: 'Data Structures & Algorithms', slug: 'data-structures-algorithms', description: 'Master fundamental data structures and algorithms — arrays, trees, graphs, sorting, DP.', icon: '🏗️', color: '#6366f1', semester: 3, difficulty: 'intermediate', totalTopics: 5, tags: ['dsa', 'arrays', 'trees'] },
  { _id: '2', name: 'Database Management Systems', slug: 'database-management-systems', description: 'Learn SQL, normalization, transactions, indexing, and database design.', icon: '🗄️', color: '#8b5cf6', semester: 4, difficulty: 'intermediate', totalTopics: 0, tags: ['sql'] },
  { _id: '3', name: 'Operating Systems', slug: 'operating-systems', description: 'Process management, memory management, scheduling, and deadlocks.', icon: '⚙️', color: '#ec4899', semester: 4, difficulty: 'intermediate', totalTopics: 0, tags: ['process'] },
  { _id: '4', name: 'Computer Networks', slug: 'computer-networks', description: 'OSI model, TCP/IP, routing, protocols, and network security.', icon: '🌐', color: '#14b8a6', semester: 5, difficulty: 'intermediate', totalTopics: 0, tags: ['networking'] },
  { _id: '5', name: 'Object-Oriented Programming', slug: 'object-oriented-programming', description: 'OOP concepts — encapsulation, inheritance, polymorphism, SOLID.', icon: '🧩', color: '#f59e0b', semester: 2, difficulty: 'beginner', totalTopics: 0, tags: ['oop'] },
  { _id: '6', name: 'Software Engineering', slug: 'software-engineering', description: 'SDLC, Agile, testing, UML diagrams, and design patterns.', icon: '📐', color: '#10b981', semester: 5, difficulty: 'intermediate', totalTopics: 0, tags: ['sdlc'] },
  { _id: '7', name: 'Compiler Design', slug: 'compiler-design', description: 'Lexical analysis, parsing, syntax trees, code generation.', icon: '🔧', color: '#ef4444', semester: 6, difficulty: 'advanced', totalTopics: 0, tags: ['compiler'] },
  { _id: '8', name: 'Theory of Computation', slug: 'theory-of-computation', description: 'Automata theory, formal languages, Turing machines.', icon: '🧮', color: '#6d28d9', semester: 5, difficulty: 'advanced', totalTopics: 0, tags: ['automata'] },
  { _id: '9', name: 'Computer Architecture', slug: 'computer-architecture', description: 'CPU design, pipelining, memory hierarchy, instruction sets.', icon: '🖥️', color: '#0ea5e9', semester: 3, difficulty: 'intermediate', totalTopics: 0, tags: ['cpu'] },
  { _id: '10', name: 'Discrete Mathematics', slug: 'discrete-mathematics', description: 'Logic, sets, relations, graph theory, and combinatorics.', icon: '🔢', color: '#84cc16', semester: 1, difficulty: 'beginner', totalTopics: 0, tags: ['math'] },
  { _id: '11', name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'Search, knowledge representation, ML, neural networks.', icon: '🤖', color: '#f97316', semester: 6, difficulty: 'advanced', totalTopics: 0, tags: ['AI', 'ML'] },
  { _id: '12', name: 'Web Development', slug: 'web-development', description: 'HTML, CSS, JavaScript, React, Node.js, REST APIs.', icon: '🌍', color: '#06b6d4', semester: 4, difficulty: 'beginner', totalTopics: 0, tags: ['web'] },
  { _id: '13', name: 'Cybersecurity', slug: 'cybersecurity', description: 'Cryptography, network security, ethical hacking, OWASP.', icon: '🔒', color: '#dc2626', semester: 7, difficulty: 'advanced', totalTopics: 0, tags: ['security'] },
  { _id: '14', name: 'Cloud Computing', slug: 'cloud-computing', description: 'AWS, Docker, Kubernetes, serverless, DevOps.', icon: '☁️', color: '#3b82f6', semester: 7, difficulty: 'intermediate', totalTopics: 0, tags: ['cloud'] },
  { _id: '15', name: 'System Design', slug: 'system-design', description: 'Scalable systems, load balancing, caching, microservices.', icon: '🏛️', color: '#7c3aed', semester: 8, difficulty: 'advanced', totalTopics: 0, tags: ['design'] },
];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await subjectsAPI.getAll();
      setSubjects(res.data.subjects.length > 0 ? res.data.subjects : fallbackSubjects);
    } catch {
      setSubjects(fallbackSubjects);
    } finally {
      setLoading(false);
    }
  };

  const filtered = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = filterDifficulty === 'all' || s.difficulty === filterDifficulty;
    const matchesSem = filterSemester === 'all' || s.semester === parseInt(filterSemester);
    return matchesSearch && matchesDiff && matchesSem;
  });

  if (loading) return <LoadingSpinner text="Loading subjects..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">CSE Subjects</h1>
        <p className="text-dark-400">Explore every Computer Science subject in detail</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}
          className="input-field w-auto min-w-[160px]">
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}
          className="input-field w-auto min-w-[160px]">
          <option value="all">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
        </select>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((subject, i) => (
          <motion.div
            key={subject._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/subjects/${subject.slug}`}
              className="glass-card card-hover block h-full group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${subject.color}20`, border: `1px solid ${subject.color}40` }}
                >
                  {subject.icon}
                </div>
                <DifficultyBadge difficulty={subject.difficulty} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {subject.name}
              </h3>
              <p className="text-sm text-dark-400 mb-4 line-clamp-2">{subject.description}</p>
              <div className="flex items-center justify-between text-xs text-dark-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {subject.totalTopics || 0} topics
                </span>
                {subject.semester && <span>Sem {subject.semester}</span>}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No subjects match your filters</p>
        </div>
      )}
    </div>
  );
}
