require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const subjectRoutes = require('./routes/subject.routes');
const topicRoutes = require('./routes/topic.routes');
const aiAgentRoutes = require('./routes/aiAgent.routes');
const interviewRoutes = require('./routes/interview.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const learningPathRoutes = require('./routes/learningPath.routes');
const progressRoutes = require('./routes/progress.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// AI Agent has higher rate limit
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many AI requests, please try again later.'
});
app.use('/api/ai/', aiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/ai', aiAgentRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ 
    status: 'OK', 
    message: 'NEXUS API is running',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbState: mongoose.connection.readyState
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 NEXUS Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
