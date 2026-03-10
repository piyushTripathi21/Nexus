import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Bot, BookOpen, Briefcase, Route, BarChart3, 
  Code2, Brain, ArrowRight, Star, Users, Zap
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const features = [
  { icon: BookOpen, title: '15+ CS Subjects', desc: 'Comprehensive coverage from DSA to System Design with detailed visual explanations', color: 'from-blue-500 to-cyan-500' },
  { icon: Bot, title: 'AI Tutor Agent', desc: 'Personal AI assistant that adapts to your level, resolves doubts, and generates content', color: 'from-purple-500 to-pink-500' },
  { icon: Code2, title: 'Code Examples', desc: 'Multi-language code samples in Python, Java, C++, JavaScript with line-by-line explanations', color: 'from-green-500 to-emerald-500' },
  { icon: Brain, title: 'Visual Learning', desc: 'Interactive diagrams, flowcharts, and Mermaid visualizations for every concept', color: 'from-orange-500 to-red-500' },
  { icon: Briefcase, title: 'Interview Prep', desc: 'Curated interview questions from top companies with model answers and follow-ups', color: 'from-yellow-500 to-orange-500' },
  { icon: Route, title: 'Learning Paths', desc: 'AI-generated personalized roadmaps based on your goals and skill level', color: 'from-indigo-500 to-purple-500' },
];

const subjects = [
  '🏗️ Data Structures & Algorithms', '🗄️ Database Systems', '⚙️ Operating Systems',
  '🌐 Computer Networks', '🧩 OOP', '📐 Software Engineering',
  '🔧 Compiler Design', '🧮 Theory of Computation', '🖥️ Computer Architecture',
  '🤖 Artificial Intelligence', '🌍 Web Development', '🔒 Cybersecurity',
  '☁️ Cloud Computing', '🏛️ System Design', '🔢 Discrete Mathematics'
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navbar */}
      <nav className="border-b border-dark-800 bg-dark-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">NEXUS</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-2">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost font-medium">Log In</Link>
                <Link to="/register" className="btn-primary">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" /> AI-Powered Learning for CS Students
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              Master Computer Science
              <br />
              <span className="gradient-text">with AI by Your Side</span>
            </h1>
            
            <p className="text-xl text-dark-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              NEXUS is an AI-powered personalized learning platform that adapts to your needs.
              Get custom learning paths, visual explanations, interview prep, and an AI tutor —
              all designed for CSE students.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Start Learning Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                I have an account
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
              {[
                { icon: BookOpen, value: '15+', label: 'CS Subjects' },
                { icon: Code2, value: '500+', label: 'Code Examples' },
                { icon: Users, value: 'Free', label: 'For All Students' },
                { icon: Star, value: 'AI', label: 'Powered Agent' }
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary-400" />
                  <div className="text-left">
                    <p className="text-xl font-bold text-white">{value}</p>
                    <p className="text-xs text-dark-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subjects Marquee */}
      <section className="py-12 border-y border-dark-800 bg-dark-900/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
          <h2 className="text-2xl font-bold text-white">Every CSE Subject. In Detail.</h2>
        </div>
        <div className="flex gap-4 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused]">
          {[...subjects, ...subjects].map((s, i) => (
            <div key={i} className="shrink-0 px-5 py-3 rounded-xl bg-dark-800 border border-dark-700 text-sm text-dark-200 whitespace-nowrap">
              {s}
            </div>
          ))}
        </div>
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Excel</h2>
            <p className="text-lg text-dark-400 max-w-2xl mx-auto">
              From beginner to interview-ready, NEXUS covers your entire CS learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How NEXUS Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create free account, tell us your level & interests' },
              { step: '02', title: 'Get Your Path', desc: 'AI generates a personalized learning roadmap' },
              { step: '03', title: 'Learn & Practice', desc: 'Study topics with visuals, code, and quizzes' },
              { step: '04', title: 'Ace Interviews', desc: 'Practice with real interview questions & AI mock' }
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black gradient-text">{step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-dark-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass-card !p-12 bg-gradient-to-br from-primary-500/10 to-purple-500/10 border-primary-500/20">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your CS Journey?</h2>
            <p className="text-lg text-dark-300 mb-8">
              Join NEXUS today and get access to AI-powered learning, completely free.
            </p>
            <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            <span className="text-lg font-bold gradient-text">NEXUS</span>
          </div>
          <p className="text-sm text-dark-500">
            AI-Powered Learning Platform for Computer Science Students
          </p>
          <p className="text-xs text-dark-600 mt-2">
            Making quality CS education accessible for all.
          </p>
        </div>
      </footer>
    </div>
  );
}
