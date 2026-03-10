import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Plus, Trash2, MessageSquare, Sparkles,
  Code2, Eye, Brain, BookOpen, Loader2, Copy, Check
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { aiAPI } from '../services/api';

const quickActions = [
  { label: 'Explain a Topic', icon: BookOpen, prompt: 'Explain the concept of ' },
  { label: 'Generate Code', icon: Code2, prompt: 'Write code in Python for ' },
  { label: 'Create Visual', icon: Eye, prompt: 'Create a visual diagram of ' },
  { label: 'Interview Prep', icon: Brain, prompt: 'Give me interview questions about ' },
];

export default function AIChat() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await aiAPI.getSessions();
      setSessions(res.data.sessions || []);
    } catch {
      setSessions([]);
    }
  };

  const createSession = () => {
    setActiveSession(null);
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const loadSession = async (sessionId) => {
    try {
      const res = await aiAPI.getSession(sessionId);
      setActiveSession(sessionId);
      setMessages(res.data.session?.messages || []);
      setSidebarOpen(false);
    } catch {
      setMessages([]);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await aiAPI.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      if (activeSession === sessionId) createSession();
    } catch {}
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({
        message: content,
        sessionId: activeSession
      });

      const { response, sessionId } = res.data;
      if (sessionId && !activeSession) {
        setActiveSession(sessionId);
        loadSessions();
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] -mt-2">
      {/* Sessions Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        fixed md:relative z-30 w-64 h-full bg-dark-850 border-r border-dark-700 transition-transform flex flex-col
      `}>
        <div className="p-3 border-b border-dark-700">
          <button onClick={createSession} className="w-full btn-primary !py-2.5 flex items-center justify-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(session => (
            <div
              key={session._id}
              className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                activeSession === session._id
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-dark-300 hover:bg-dark-700'
              }`}
              onClick={() => loadSession(session._id)}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-sm truncate">
                {session.title || 'New Chat'}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(session._id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-dark-600 transition-all"
              >
                <Trash2 className="w-3 h-3 text-dark-400" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-dark-500 text-xs text-center p-4">No conversations yet</p>
          )}
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 p-3 border-b border-dark-700">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-dark-700">
            <MessageSquare className="w-5 h-5 text-dark-400" />
          </button>
          <span className="text-sm text-dark-300">AI Assistant</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">NEXUS AI Assistant</h2>
              <p className="text-dark-400 text-center mb-8 max-w-md">
                I can explain CS concepts, generate code, create visual diagrams, and help you prepare for interviews.
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setInput(action.prompt)}
                    className="glass-card !p-4 text-left card-hover group"
                  >
                    <action.icon className="w-5 h-5 text-primary-400 mb-2" />
                    <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                      {action.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className={`relative group max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary-500/20 border border-primary-500/30 rounded-2xl rounded-tr-md px-4 py-3'
                        : 'bg-dark-800/60 border border-dark-700 rounded-2xl rounded-tl-md px-4 py-3'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="markdown-content text-sm">
                          <MarkdownRenderer content={msg.content} />
                        </div>
                      ) : (
                        <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                      )}

                      {/* Copy button */}
                      <button
                        onClick={() => copyMessage(msg.content, i)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-dark-700/80 transition-opacity"
                      >
                        {copiedIdx === i
                          ? <Check className="w-3 h-3 text-green-400" />
                          : <Copy className="w-3 h-3 text-dark-400" />}
                      </button>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4 text-dark-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-dark-800/60 border border-dark-700 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                      <span className="text-sm text-dark-400">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-dark-700 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about CS topics..."
                  rows={1}
                  className="input-field !pr-12 resize-none min-h-[48px] max-h-[120px]"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="btn-primary !p-3 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-dark-500 mt-2 text-center">
              NEXUS AI can explain concepts, generate code, create diagrams, and help with interview prep
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
