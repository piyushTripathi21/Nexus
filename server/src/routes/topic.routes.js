const express = require('express');
const router = express.Router();
const { 
  getTopicsBySubject, getTopic, completeTopic, 
  toggleBookmark, searchTopics, createTopic 
} = require('../controllers/topic.controller');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

router.get('/search', searchTopics);
router.get('/subject/:subjectSlug', getTopicsBySubject);
router.get('/:subjectSlug/:topicSlug', optionalAuth, getTopic);
router.post('/:topicId/complete', protect, completeTopic);
router.post('/:topicId/bookmark', protect, toggleBookmark);
router.post('/', protect, adminOnly, createTopic);

module.exports = router;
