const LearningPath = require('../models/LearningPath');
const nexusAgent = require('../ai/NexusAgent');

// @desc    Get user's learning paths
// @route   GET /api/learning-path
exports.getLearningPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find({ user: req.user.id, isActive: true })
      .populate('subjects', 'name slug icon')
      .sort('-updatedAt');

    res.json({ success: true, paths });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single learning path
// @route   GET /api/learning-path/:id
exports.getLearningPath = async (req, res) => {
  try {
    const path = await LearningPath.findOne({ _id: req.params.id, user: req.user.id })
      .populate('subjects', 'name slug icon color')
      .populate('milestones.topics', 'title slug difficulty estimatedTime');

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    res.json({ success: true, path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI learning path
// @route   POST /api/learning-path/generate
exports.generateLearningPath = async (req, res) => {
  try {
    const { goal, interests, availableHoursPerDay } = req.body;

    const response = await nexusAgent.generateLearningPath({
      level: req.user.level,
      interests: interests || req.user.interests,
      goal: goal || 'general',
      availableHoursPerDay: availableHoursPerDay || 2
    });

    res.json({
      success: true,
      learningPath: response.content,
      source: response.source
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save a learning path
// @route   POST /api/learning-path
exports.createLearningPath = async (req, res) => {
  try {
    const path = await LearningPath.create({
      user: req.user.id,
      ...req.body,
      startedAt: new Date()
    });

    res.status(201).json({ success: true, path });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update milestone completion
// @route   PUT /api/learning-path/:id/milestone/:milestoneId
exports.completeMilestone = async (req, res) => {
  try {
    const path = await LearningPath.findOne({ _id: req.params.id, user: req.user.id });

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const milestone = path.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    milestone.isCompleted = true;
    milestone.completedAt = new Date();

    // Recalculate progress
    const completed = path.milestones.filter(m => m.isCompleted).length;
    path.progress = Math.round((completed / path.milestones.length) * 100);

    await path.save();

    res.json({ success: true, path, message: 'Milestone completed!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete learning path
// @route   DELETE /api/learning-path/:id
exports.deleteLearningPath = async (req, res) => {
  try {
    await LearningPath.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false }
    );

    res.json({ success: true, message: 'Learning path deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
