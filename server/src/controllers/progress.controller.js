const User = require('../models/User');
const AssessmentResult = require('../models/AssessmentResult');
const Topic = require('../models/Topic');

// @desc    Get user's overall progress & dashboard stats
// @route   GET /api/progress/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('completedTopics', 'title slug subject difficulty xpReward');

    // Get assessment stats
    const assessmentResults = await AssessmentResult.find({ user: req.user.id });
    
    const assessmentStats = {
      totalAttempted: assessmentResults.length,
      totalPassed: assessmentResults.filter(r => r.passed).length,
      averageScore: assessmentResults.length > 0
        ? Math.round(assessmentResults.reduce((sum, r) => sum + r.percentage, 0) / assessmentResults.length)
        : 0,
      bestScore: assessmentResults.length > 0
        ? Math.max(...assessmentResults.map(r => r.percentage))
        : 0
    };

    // Get total available topics
    const totalTopics = await Topic.countDocuments({ isActive: true });

    const dashboard = {
      user: {
        name: user.name,
        level: user.level,
        totalXP: user.totalXP,
        learningStreak: user.learningStreak
      },
      progress: {
        completedTopics: user.completedTopics.length,
        totalTopics,
        completionPercentage: totalTopics > 0
          ? Math.round((user.completedTopics.length / totalTopics) * 100)
          : 0
      },
      assessmentStats,
      recentTopics: user.completedTopics.slice(-5).reverse(),
      xpLevel: getXPLevel(user.totalXP)
    };

    res.json({ success: true, dashboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get progress by subject
// @route   GET /api/progress/subject/:subjectId
exports.getSubjectProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const topics = await Topic.find({ subject: req.params.subjectId, isActive: true });
    
    const completedInSubject = topics.filter(t => 
      user.completedTopics.includes(t._id)
    );

    res.json({
      success: true,
      progress: {
        total: topics.length,
        completed: completedInSubject.length,
        percentage: topics.length > 0
          ? Math.round((completedInSubject.length / topics.length) * 100)
          : 0,
        topics: topics.map(t => ({
          id: t._id,
          title: t.title,
          slug: t.slug,
          isCompleted: user.completedTopics.includes(t._id),
          difficulty: t.difficulty
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/progress/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name totalXP learningStreak level')
      .sort('-totalXP')
      .limit(50);

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      name: u.name,
      totalXP: u.totalXP,
      level: u.level,
      streak: u.learningStreak.current,
      xpLevel: getXPLevel(u.totalXP)
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: Calculate XP level
function getXPLevel(xp) {
  if (xp >= 10000) return { name: 'Grandmaster', tier: 10, icon: '👑' };
  if (xp >= 7500) return { name: 'Master', tier: 9, icon: '🏆' };
  if (xp >= 5000) return { name: 'Expert', tier: 8, icon: '💎' };
  if (xp >= 3500) return { name: 'Advanced', tier: 7, icon: '🌟' };
  if (xp >= 2500) return { name: 'Proficient', tier: 6, icon: '⭐' };
  if (xp >= 1500) return { name: 'Intermediate', tier: 5, icon: '🔥' };
  if (xp >= 1000) return { name: 'Developing', tier: 4, icon: '📈' };
  if (xp >= 500) return { name: 'Learner', tier: 3, icon: '📚' };
  if (xp >= 200) return { name: 'Explorer', tier: 2, icon: '🔍' };
  return { name: 'Beginner', tier: 1, icon: '🌱' };
}
