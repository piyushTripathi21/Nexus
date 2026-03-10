import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff, Code2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const levels = [
  { value: 'beginner', label: '🌱 Beginner', desc: 'New to CS concepts' },
  { value: 'intermediate', label: '📚 Intermediate', desc: 'Know basics, want depth' },
  { value: 'advanced', label: '🚀 Advanced', desc: 'Preparing for interviews' }
];

const languages = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'javascript', label: 'JavaScript', icon: '🌐' },
  { value: 'c', label: 'C', icon: '🔧' }
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    level: 'beginner', preferredLanguage: 'python', interests: []
  });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) { setStep(2); return; }
    const success = await register(form);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-black gradient-text">NEXUS</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-400'
              }`}>
                {s}
              </div>
              {s < 2 && <div className={`w-16 h-0.5 ${step > 1 ? 'bg-primary-500' : 'bg-dark-700'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
                <p className="text-dark-400">Start your CS learning journey</p>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="Your name" className="input-field pl-11" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)}
                      placeholder="you@example.com" className="input-field pl-11" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input type={showPass ? 'text' : 'password'} value={form.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      placeholder="Min 6 characters" className="input-field pl-11 pr-11" required minLength={6} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Personalize Your Experience</h2>
                <p className="text-dark-400">Help us tailor content for you</p>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-3">Your Level</label>
                  <div className="grid grid-cols-1 gap-2">
                    {levels.map(l => (
                      <button key={l.value} type="button"
                        onClick={() => updateForm('level', l.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          form.level === l.value
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 bg-dark-800 hover:border-dark-500'
                        }`}>
                        <span className="font-medium text-white">{l.label}</span>
                        <span className="text-xs text-dark-400 ml-2">{l.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-3">Preferred Language</label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map(l => (
                      <button key={l.value} type="button"
                        onClick={() => updateForm('preferredLanguage', l.value)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          form.preferredLanguage === l.value
                            ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                            : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500'
                        }`}>
                        {l.icon} {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-dark-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
