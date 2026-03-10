const Topic = require('../models/Topic');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Get topics for a subject
// @route   GET /api/topics/subject/:subjectSlug
exports.getTopicsBySubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.subjectSlug });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { difficulty } = req.query;
    const filter = { subject: subject._id, isActive: true };
    if (difficulty) filter.difficulty = difficulty;

    const topics = await Topic.find(filter)
      .select('title slug order difficulty estimatedTime xpReward tags overview')
      .sort('order');

    res.json({ success: true, count: topics.length, subject: subject.name, topics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single topic with full content
// @route   GET /api/topics/:subjectSlug/:topicSlug
exports.getTopic = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.subjectSlug });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topic = await Topic.findOne({
      subject: subject._id,
      slug: req.params.topicSlug,
      isActive: true
    }).populate('relatedTopics', 'title slug difficulty');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.json({ success: true, topic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark topic as completed
// @route   POST /api/topics/:topicId/complete
exports.completeTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const user = await User.findById(req.user.id);

    // Add to completed if not already
    if (!user.completedTopics.includes(topic._id)) {
      user.completedTopics.push(topic._id);
      user.totalXP += topic.xpReward;
      user.updateStreak();
      await user.save();
    }

    res.json({
      success: true,
      message: 'Topic completed!',
      xpEarned: topic.xpReward,
      totalXP: user.totalXP
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bookmark/unbookmark a topic
// @route   POST /api/topics/:topicId/bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const topicId = req.params.topicId;

    const index = user.bookmarks.indexOf(topicId);
    if (index > -1) {
      user.bookmarks.splice(index, 1);
      await user.save();
      res.json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    } else {
      user.bookmarks.push(topicId);
      await user.save();
      res.json({ success: true, bookmarked: true, message: 'Topic bookmarked' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search topics
// @route   GET /api/topics/search?q=query
exports.searchTopics = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const topics = await Topic.find({
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { overview: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('subject', 'name slug icon')
      .select('title slug difficulty subject tags overview')
      .limit(20);

    res.json({ success: true, count: topics.length, topics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create topic (admin)
// @route   POST /api/topics
exports.createTopic = async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    
    // Update subject topic count
    await Subject.findByIdAndUpdate(topic.subject, {
      $inc: { totalTopics: 1 }
    });

    res.status(201).json({ success: true, topic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
