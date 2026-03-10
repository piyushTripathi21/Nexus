const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  title: String,
  description: String,
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  order: Number,
  estimatedDays: Number,
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const learningPathSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['ai-generated', 'custom', 'template'],
    default: 'ai-generated'
  },
  goal: {
    type: String,
    enum: ['placement', 'semester-exam', 'competitive-programming', 'research', 'general'],
    default: 'general'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  milestones: [milestoneSchema],
  totalEstimatedDays: Number,
  progress: {
    type: Number, // percentage
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startedAt: Date,
  targetCompletionDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('LearningPath', learningPathSchema);
