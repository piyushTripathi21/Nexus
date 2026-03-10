const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  interests: [{
    type: String,
    enum: [
      'data-structures', 'algorithms', 'databases', 'operating-systems',
      'computer-networks', 'web-development', 'machine-learning',
      'artificial-intelligence', 'cybersecurity', 'cloud-computing',
      'software-engineering', 'compiler-design', 'theory-of-computation',
      'discrete-mathematics', 'computer-architecture', 'object-oriented-programming',
      'system-design'
    ]
  }],
  learningStreak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date }
  },
  totalXP: {
    type: Number,
    default: 0
  },
  completedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  preferredLanguage: {
    type: String,
    enum: ['python', 'java', 'cpp', 'javascript', 'c'],
    default: 'python'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update learning streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.learningStreak.lastActiveDate) {
    const lastActive = new Date(this.learningStreak.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.learningStreak.current += 1;
    } else if (diffDays > 1) {
      this.learningStreak.current = 1;
    }
  } else {
    this.learningStreak.current = 1;
  }
  
  if (this.learningStreak.current > this.learningStreak.longest) {
    this.learningStreak.longest = this.learningStreak.current;
  }
  
  this.learningStreak.lastActiveDate = today;
};

module.exports = mongoose.model('User', userSchema);
