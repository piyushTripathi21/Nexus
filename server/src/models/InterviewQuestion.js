const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['conceptual', 'coding', 'scenario', 'system-design', 'behavioral'],
    default: 'conceptual'
  },
  company: {
    type: String, // e.g. "Google", "Amazon", "Microsoft"
    default: 'General'
  },
  followUpQuestions: [String],
  hints: [String],
  codeSnippet: String,
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

interviewQuestionSchema.index({ subject: 1, difficulty: 1 });
interviewQuestionSchema.index({ tags: 1 });

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
