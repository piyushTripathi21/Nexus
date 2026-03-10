const InterviewQuestion = require('../models/InterviewQuestion');
const nexusAgent = require('../ai/NexusAgent');

// @desc    Get interview questions for a subject
// @route   GET /api/interview/questions/:subjectId
exports.getQuestions = async (req, res) => {
  try {
    const { difficulty, type, company, limit = 10 } = req.query;
    const filter = { subject: req.params.subjectId, isActive: true };

    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (company) filter.company = { $regex: company, $options: 'i' };

    const questions = await InterviewQuestion.find(filter)
      .populate('subject', 'name slug')
      .populate('topic', 'title slug')
      .limit(parseInt(limit))
      .sort('-createdAt');

    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate interview questions with AI
// @route   POST /api/interview/generate
exports.generateQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, count } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ message: 'Subject and topic required' });
    }

    const response = await nexusAgent.generateInterviewQuestions(
      subject, topic, difficulty || 'medium', count || 5
    );

    res.json({
      success: true,
      questions: response.content,
      source: response.source
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a random interview question
// @route   GET /api/interview/random
exports.getRandomQuestion = async (req, res) => {
  try {
    const { subject, difficulty } = req.query;
    const filter = { isActive: true };
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;

    const count = await InterviewQuestion.countDocuments(filter);
    if (count === 0) {
      return res.status(404).json({ message: 'No questions found' });
    }

    const random = Math.floor(Math.random() * count);
    const question = await InterviewQuestion.findOne(filter)
      .skip(random)
      .populate('subject', 'name slug')
      .populate('topic', 'title slug');

    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create interview question (admin)
// @route   POST /api/interview/questions
exports.createQuestion = async (req, res) => {
  try {
    const question = await InterviewQuestion.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
