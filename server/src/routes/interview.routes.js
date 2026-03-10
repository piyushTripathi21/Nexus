const express = require('express');
const router = express.Router();
const { getQuestions, generateQuestions, getRandomQuestion, createQuestion } = require('../controllers/interview.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/random', getRandomQuestion);
router.get('/questions/:subjectId', getQuestions);
router.post('/generate', protect, generateQuestions);
router.post('/questions', protect, adminOnly, createQuestion);

module.exports = router;
