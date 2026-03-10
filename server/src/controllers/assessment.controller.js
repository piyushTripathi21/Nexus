const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const User = require('../models/User');
const nexusAgent = require('../ai/NexusAgent');

// @desc    Get assessments by subject
// @route   GET /api/assessments/subject/:subjectId
exports.getAssessments = async (req, res) => {
  try {
    const { type, difficulty } = req.query;
    const filter = { subject: req.params.subjectId, isActive: true };
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    const assessments = await Assessment.find(filter)
      .select('title type difficulty totalPoints timeLimit passingScore questionsCount')
      .sort('-createdAt');

    // Add question count
    const result = assessments.map(a => ({
      ...a.toObject(),
      questionsCount: a.questions?.length || 0
    }));

    res.json({ success: true, assessments: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assessment (without answers for taking)
// @route   GET /api/assessments/:id
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('subject', 'name slug')
      .populate('topics', 'title slug');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Strip correct answers when student is taking the assessment
    const sanitized = assessment.toObject();
    sanitized.questions = sanitized.questions.map(q => ({
      ...q,
      options: q.options.map(o => ({ text: o.text, _id: o._id })),
      explanation: undefined
    }));

    res.json({ success: true, assessment: sanitized });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit assessment answers
// @route   POST /api/assessments/:id/submit
exports.submitAssessment = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Grade the assessment
    let totalScore = 0;
    const gradedAnswers = answers.map((ans, index) => {
      const question = assessment.questions[index];
      if (!question) return { ...ans, isCorrect: false, pointsEarned: 0 };

      let isCorrect = false;
      if (question.type === 'mcq' || question.type === 'true-false' || question.type === 'code-output') {
        const correctOption = question.options.findIndex(o => o.isCorrect);
        isCorrect = ans.selectedOption === correctOption;
      }

      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      return {
        questionIndex: index,
        selectedOption: ans.selectedOption,
        textAnswer: ans.textAnswer,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = Math.round((totalScore / assessment.totalPoints) * 100);
    const passed = percentage >= assessment.passingScore;

    // Save result
    const result = await AssessmentResult.create({
      user: req.user.id,
      assessment: assessment._id,
      answers: gradedAnswers,
      score: totalScore,
      totalPoints: assessment.totalPoints,
      percentage,
      passed,
      timeTaken
    });

    // Award XP
    const xpEarned = passed ? Math.round(percentage / 2) : Math.round(percentage / 4);
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalXP: xpEarned }
    });

    // Return result with explanations
    const questionsWithExplanations = assessment.questions.map((q, i) => ({
      question: q.question,
      correctOption: q.options.findIndex(o => o.isCorrect),
      explanation: q.explanation,
      yourAnswer: gradedAnswers[i]
    }));

    res.json({
      success: true,
      result: {
        score: totalScore,
        totalPoints: assessment.totalPoints,
        percentage,
        passed,
        xpEarned,
        timeTaken,
        questions: questionsWithExplanations
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI assessment
// @route   POST /api/assessments/generate
exports.generateAssessment = async (req, res) => {
  try {
    const { subject, topics, difficulty, questionCount } = req.body;

    const response = await nexusAgent.generateAssessment(
      subject,
      topics,
      difficulty || 'mixed',
      questionCount || 10
    );

    res.json({
      success: true,
      assessment: response.content,
      source: response.source
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's assessment history
// @route   GET /api/assessments/history
exports.getHistory = async (req, res) => {
  try {
    const results = await AssessmentResult.find({ user: req.user.id })
      .populate({
        path: 'assessment',
        select: 'title subject type difficulty',
        populate: { path: 'subject', select: 'name slug' }
      })
      .sort('-completedAt')
      .limit(20);

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
