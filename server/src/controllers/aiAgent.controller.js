const nexusAgent = require('../ai/NexusAgent');
const ChatSession = require('../models/ChatSession');

// @desc    Chat with NEXUS AI Agent
// @route   POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { message, sessionId, context } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, user: req.user.id });
    }

    if (!session) {
      session = await ChatSession.create({
        user: req.user.id,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        context: {
          userLevel: req.user.level,
          preferredLanguage: req.user.preferredLanguage,
          ...context
        }
      });
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      metadata: {
        subject: context?.subject,
        topic: context?.topic,
        type: context?.type || 'general'
      }
    });

    // Build message history for context
    const recentMessages = session.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Get AI response
    const aiResponse = await nexusAgent.chat(recentMessages, {
      level: req.user.level,
      preferredLanguage: req.user.preferredLanguage,
      currentSubject: context?.subject,
      currentTopic: context?.topic
    });

    // Add AI response to session
    session.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      metadata: {
        type: context?.type || 'general'
      }
    });

    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      response: aiResponse.content,
      source: aiResponse.source
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Explain a topic with AI
// @route   POST /api/ai/explain
exports.explainTopic = async (req, res) => {
  try {
    const { subject, topic, level, language } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ message: 'Subject and topic are required' });
    }

    const response = await nexusAgent.explainTopic(
      subject,
      topic,
      level || req.user.level,
      language || req.user.preferredLanguage
    );

    res.json({ success: true, explanation: response.content, source: response.source });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate visual representation
// @route   POST /api/ai/visual
exports.generateVisual = async (req, res) => {
  try {
    const { concept, type } = req.body;

    if (!concept) {
      return res.status(400).json({ message: 'Concept is required' });
    }

    const response = await nexusAgent.generateVisual(concept, type || 'diagram');

    res.json({ success: true, visual: response.content, source: response.source });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate code for a concept
// @route   POST /api/ai/code
exports.generateCode = async (req, res) => {
  try {
    const { description, language, context } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const response = await nexusAgent.generateCode(
      description,
      language || req.user.preferredLanguage,
      context || {}
    );

    res.json({ success: true, code: response.content, source: response.source });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve a doubt
// @route   POST /api/ai/doubt
exports.resolveDoubt = async (req, res) => {
  try {
    const { doubt, subject, topic, codeSnippet } = req.body;

    if (!doubt) {
      return res.status(400).json({ message: 'Doubt/question is required' });
    }

    const response = await nexusAgent.resolveDoubt(doubt, {
      subject,
      topic,
      codeSnippet,
      level: req.user.level,
      preferredLanguage: req.user.preferredLanguage
    });

    res.json({ success: true, answer: response.content, source: response.source });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat history
// @route   GET /api/ai/sessions
exports.getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user.id, isActive: true })
      .select('title context createdAt updatedAt')
      .sort('-updatedAt')
      .limit(20);

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific chat session
// @route   GET /api/ai/sessions/:sessionId
exports.getChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      user: req.user.id
    });

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a chat session
// @route   DELETE /api/ai/sessions/:sessionId
exports.deleteChatSession = async (req, res) => {
  try {
    await ChatSession.findOneAndUpdate(
      { _id: req.params.sessionId, user: req.user.id },
      { isActive: false }
    );

    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
