const mongoose = require('mongoose');

const codeExampleSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ['python', 'java', 'cpp', 'javascript', 'c', 'pseudocode'],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  explanation: String
});

const visualRepresentationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['diagram', 'flowchart', 'animation-steps', 'tree', 'graph', 'table', 'comparison'],
    required: true
  },
  title: String,
  data: mongoose.Schema.Types.Mixed, // flexible JSON for different visual types
  description: String,
  mermaidCode: String // for rendering diagrams with Mermaid.js
});

const topicSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  order: {
    type: Number,
    default: 0
  },
  
  // Content sections
  overview: {
    type: String,
    required: true
  },
  
  detailedContent: {
    type: String, // markdown content
    required: true
  },
  
  keyPoints: [String],
  
  // Visual representations
  visualRepresentations: [visualRepresentationSchema],
  
  // Code examples in multiple languages
  codeExamples: [codeExampleSchema],
  
  // Real world applications
  realWorldApplications: [String],
  
  // Time & Space complexity (for DSA topics)
  complexity: {
    time: {
      best: String,
      average: String,
      worst: String
    },
    space: String
  },
  
  // Related topics
  relatedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  
  // Metadata
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  
  xpReward: {
    type: Number,
    default: 50
  },
  
  tags: [String],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for subject + slug uniqueness
topicSchema.index({ subject: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
