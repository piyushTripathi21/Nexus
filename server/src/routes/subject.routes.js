const express = require('express');
const router = express.Router();
const { getAllSubjects, getSubject, createSubject, updateSubject } = require('../controllers/subject.controller');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAllSubjects);
router.get('/:slug', getSubject);
router.post('/', protect, adminOnly, createSubject);
router.put('/:id', protect, adminOnly, updateSubject);

module.exports = router;
