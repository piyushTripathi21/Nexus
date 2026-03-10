const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    textAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: {
    type: Number,
    required: true
  },
  totalPoints: Number,
  percentage: Number,
  passed: Boolean,
  timeTaken: Number, // in seconds
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);
