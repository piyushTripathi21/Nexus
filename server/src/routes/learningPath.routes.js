const express = require('express');
const router = express.Router();
const {
  getLearningPaths, getLearningPath, generateLearningPath,
  createLearningPath, completeMilestone, deleteLearningPath
} = require('../controllers/learningPath.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getLearningPaths);
router.get('/:id', getLearningPath);
router.post('/generate', generateLearningPath);
router.post('/', createLearningPath);
router.put('/:id/milestone/:milestoneId', completeMilestone);
router.delete('/:id', deleteLearningPath);

module.exports = router;
