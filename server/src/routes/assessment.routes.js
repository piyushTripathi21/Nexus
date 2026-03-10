const express = require('express');
const router = express.Router();
const {
  getAssessments, getAssessment, submitAssessment,
  generateAssessment, getHistory
} = require('../controllers/assessment.controller');
const { protect } = require('../middleware/auth');

router.get('/history', protect, getHistory);
router.get('/subject/:subjectId', getAssessments);
router.get('/:id', getAssessment);
router.post('/:id/submit', protect, submitAssessment);
router.post('/generate', protect, generateAssessment);

module.exports = router;
