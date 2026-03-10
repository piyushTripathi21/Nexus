const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const { semester, difficulty } = req.query;
    const filter = { isActive: true };
    
    if (semester) filter.semester = parseInt(semester);
    if (difficulty) filter.difficulty = difficulty;

    const subjects = await Subject.find(filter)
      .populate('prerequisites', 'name slug')
      .sort('semester name');

    res.json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single subject by slug
// @route   GET /api/subjects/:slug
exports.getSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug, isActive: true })
      .populate('prerequisites', 'name slug icon');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create subject (admin)
// @route   POST /api/subjects
exports.createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, subject });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update subject (admin)
// @route   PUT /api/subjects/:id
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
