const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  type: {
    type: String,
    enum: ['mcq', 'true-false', 'fill-blank', 'code-output', 'short-answer'],
    default: 'mcq'
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10
  }
});

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  type: {
    type: String,
    enum: ['quiz', 'test', 'practice', 'ai-generated'],
    default: 'quiz'
  },
  questions: [questionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  passingScore: {
    type: Number, // percentage
    default: 60
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-calculate total points
assessmentSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);
