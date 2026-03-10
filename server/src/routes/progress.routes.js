const express = require('express');
const router = express.Router();
const { getDashboard, getSubjectProgress, getLeaderboard } = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboard);
router.get('/subject/:subjectId', protect, getSubjectProgress);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
