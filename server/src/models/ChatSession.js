const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    subject: String,
    topic: String,
    type: {
      type: String,
      enum: ['explanation', 'code', 'quiz', 'visual', 'interview-prep', 'doubt', 'general']
    },
    codeLanguage: String,
    visualData: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [chatMessageSchema],
  context: {
    currentSubject: String,
    currentTopic: String,
    userLevel: String,
    preferredLanguage: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
