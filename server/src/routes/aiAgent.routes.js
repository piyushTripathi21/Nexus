const express = require('express');
const router = express.Router();
const {
  chat, explainTopic, generateVisual, generateCode,
  resolveDoubt, getChatSessions, getChatSession, deleteChatSession
} = require('../controllers/aiAgent.controller');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

router.post('/chat', chat);
router.post('/explain', explainTopic);
router.post('/visual', generateVisual);
router.post('/code', generateCode);
router.post('/doubt', resolveDoubt);
router.get('/sessions', getChatSessions);
router.get('/sessions/:sessionId', getChatSession);
router.delete('/sessions/:sessionId', deleteChatSession);

module.exports = router;
