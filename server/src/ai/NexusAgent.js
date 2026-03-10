/**
 * NEXUS AI Agent — Multi-provider intelligent CS tutor
 *
 * Provider chain (tries in order, first success wins):
 *   1. Groq   (FREE — Llama 3.3 70B, 30 req/min)   ← RECOMMENDED
 *   2. Gemini (FREE — Google AI, 15 req/min)
 *   3. OpenAI (PAID — GPT-4o-mini, optional)
 *   4. Built-in knowledge base (always works, zero config)
 *
 * Get free keys:
 *   Groq:   https://console.groq.com/keys
 *   Gemini: https://aistudio.google.com/apikey
 */

const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let OpenAIClass;
try { OpenAIClass = require('openai'); } catch (_) {}

class NexusAIAgent {
  constructor() {
    this.groq = null;
    this.gemini = null;
    this.openai = null;
    this.provider = 'fallback';
    this._cachedKeys = {};
    this._initProviders();

    this.systemPrompt = `You are NEXUS AI — an expert Computer Science tutor and mentor.

Your personality:
- Warm, encouraging, patient, and thorough
- Adapt complexity to student level (beginner/intermediate/advanced)
- Use real-world analogies and industry examples
- Write code in Python, Java, C++, JavaScript, or C as appropriate

What you do:
1. EXPLAIN concepts with clear structure and visual diagrams (Mermaid.js)
2. GENERATE working code with line-by-line explanations
3. CREATE diagrams using Mermaid.js syntax in \`\`\`mermaid blocks
4. PREPARE interview questions with detailed model answers
5. GENERATE quizzes and assessments with explanations
6. BUILD personalized learning paths
7. RESOLVE doubts thoroughly with examples

Subjects: Data Structures & Algorithms, DBMS, OS, Computer Networks, OOP, Software Engineering, Compiler Design, Theory of Computation, Computer Architecture, Discrete Mathematics, AI/ML, Web Development, Cybersecurity, Cloud Computing, System Design.

Response format:
- Use markdown: headings, bold, bullets, numbered lists, tables
- Include code blocks with language tags (\`\`\`python, \`\`\`java, etc.)
- Use \`\`\`mermaid blocks for visual diagrams when they help
- Break complex topics into clear numbered steps
- End responses with 2-3 key takeaways
- Be thorough — give complete, detailed answers`;
  }

  // ═══════════════════════════════════════════════════════════════
  //  PROVIDER INITIALIZATION (hot-reload on every request)
  // ═══════════════════════════════════════════════════════════════

  _initProviders() {
    const env = process.env;

    // ── Groq (FREE — Llama 3.3 70B) ──
    const groqKey = env.GROQ_API_KEY;
    if (groqKey && groqKey !== 'your_groq_api_key_here' && groqKey.length > 10) {
      if (this._cachedKeys.groq !== groqKey) {
        try {
          this.groq = new Groq({ apiKey: groqKey });
          this._cachedKeys.groq = groqKey;
          console.log('✅ Groq AI initialized (FREE — Llama 3.3 70B)');
        } catch (e) {
          console.error('Groq init failed:', e.message);
          this.groq = null;
        }
      }
    } else {
      this.groq = null;
    }

    // ── Gemini (FREE) ──
    const gemKey = env.GEMINI_API_KEY;
    if (gemKey && gemKey !== 'your_gemini_api_key_here' && gemKey.length > 10) {
      if (this._cachedKeys.gemini !== gemKey) {
        try {
          const genAI = new GoogleGenerativeAI(gemKey);
          this.gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
          this._cachedKeys.gemini = gemKey;
          console.log('✅ Gemini AI initialized (FREE)');
        } catch (e) {
          console.error('Gemini init failed:', e.message);
          this.gemini = null;
        }
      }
    } else {
      this.gemini = null;
    }

    // ── OpenAI (paid, optional) ──
    const oaiKey = env.OPENAI_API_KEY;
    if (OpenAIClass && oaiKey && oaiKey !== 'your_openai_api_key_here' && oaiKey.startsWith('sk-')) {
      if (this._cachedKeys.openai !== oaiKey) {
        try {
          this.openai = new OpenAIClass({ apiKey: oaiKey });
          this._cachedKeys.openai = oaiKey;
          console.log('✅ OpenAI initialized (paid)');
        } catch (e) {
          console.error('OpenAI init failed:', e.message);
          this.openai = null;
        }
      }
    } else {
      this.openai = null;
    }

    // Active provider label
    if (this.groq) this.provider = 'groq';
    else if (this.gemini) this.provider = 'gemini';
    else if (this.openai) this.provider = 'openai';
    else this.provider = 'fallback';
  }

  _buildSystemPrompt(ctx = {}) {
    let p = this.systemPrompt;
    if (ctx.level) p += `\n\nStudent level: ${ctx.level}. Adjust depth accordingly.`;
    if (ctx.preferredLanguage) p += `\nPreferred language: ${ctx.preferredLanguage}.`;
    if (ctx.currentSubject) p += `\nSubject: ${ctx.currentSubject}.`;
    if (ctx.currentTopic) p += `\nTopic: ${ctx.currentTopic}.`;
    return p;
  }

  // ═══════════════════════════════════════════════════════════════
  //  CORE CHAT — Groq → Gemini → OpenAI → Fallback
  // ═══════════════════════════════════════════════════════════════

  async chat(messages, userContext = {}) {
    this._initProviders();
    const userMsg = messages[messages.length - 1]?.content || '';

    // 1. Groq (free, fast)
    if (this.groq) {
      try {
        return await this._chatGroq(messages, userContext);
      } catch (e) {
        console.error('⚠️ Groq failed:', e.message?.substring(0, 120));
      }
    }

    // 2. Gemini (free)
    if (this.gemini) {
      try {
        return await this._chatGemini(messages, userContext);
      } catch (e) {
        console.error('⚠️ Gemini failed:', e.message?.substring(0, 120));
      }
    }

    // 3. OpenAI (paid)
    if (this.openai) {
      try {
        return await this._chatOpenAI(messages, userContext);
      } catch (e) {
        console.error('⚠️ OpenAI failed:', e.message?.substring(0, 120));
      }
    }

    // 4. Fallback
    console.log('📚 Using fallback for:', userMsg.substring(0, 60));
    return this._getFallbackResponse(userMsg);
  }

  // ── Groq: Llama 3.3 70B (free, 30 RPM, 6000 RPD) ──
  async _chatGroq(messages, ctx) {
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: this._buildSystemPrompt(ctx) },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });
    return {
      success: true,
      content: response.choices[0].message.content,
      source: 'groq'
    };
  }

  // ── Gemini (free, 15 RPM) ──
  async _chatGemini(messages, ctx) {
    const history = [];
    for (const msg of messages.slice(0, -1)) {
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const chat = this.gemini.startChat({
      history,
      systemInstruction: { parts: [{ text: this._buildSystemPrompt(ctx) }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
    });

    const result = await chat.sendMessage(messages[messages.length - 1]?.content || '');
    return {
      success: true,
      content: result.response.text(),
      source: 'gemini'
    };
  }

  // ── OpenAI (paid) ──
  async _chatOpenAI(messages, ctx) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: this._buildSystemPrompt(ctx) },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
    return {
      success: true,
      content: response.choices[0].message.content,
      source: 'openai'
    };
  }

  // ═══════════════════════════════════════════════════════════════
  //  SPECIALISED METHODS
  // ═══════════════════════════════════════════════════════════════

  async explainTopic(subject, topic, level = 'intermediate', language = 'python') {
    const prompt = `Explain "${topic}" from ${subject} in Computer Science.

Provide:
1. **Overview** — 2-3 paragraph introduction
2. **Key Concepts** — bullet points
3. **Detailed Explanation** — step-by-step with examples
4. **Visual Diagram** — Mermaid.js diagram in a \`\`\`mermaid block
5. **Code Example** — working ${language} code with comments
6. **Real-World Application** — industry use cases
7. **Key Takeaways**

Level: ${level}`;
    return this.chat(
      [{ role: 'user', content: prompt }],
      { level, preferredLanguage: language, currentSubject: subject, currentTopic: topic }
    );
  }

  async generateInterviewQuestions(subject, topic, difficulty = 'medium', count = 5) {
    const prompt = `Generate ${count} ${difficulty}-level interview questions about "${topic}" in ${subject}.

For each provide:
1. Question
2. Difficulty (easy/medium/hard)
3. Detailed expected answer
4. Follow-up questions (2-3)
5. Hints
6. Company that commonly asks this

Return as JSON array:
[{"question":"...","difficulty":"...","answer":"...","followUpQuestions":["..."],"hints":["..."],"company":"..."}]`;
    return this.chat([{ role: 'user', content: prompt }], { currentSubject: subject, currentTopic: topic });
  }

  async generateAssessment(subject, topics, difficulty = 'mixed', questionCount = 10) {
    const topicList = Array.isArray(topics) ? topics.join(', ') : topics;
    const prompt = `Create a ${difficulty} difficulty quiz with ${questionCount} MCQ questions about "${topicList}" in ${subject}.

Return valid JSON:
{
  "title": "Quiz: ${topicList}",
  "subject": "${subject}",
  "totalQuestions": ${questionCount},
  "questions": [{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":0,"explanation":"...","difficulty":"easy"}]
}`;
    return this.chat([{ role: 'user', content: prompt }], { currentSubject: subject });
  }

  async generateLearningPath(userProfile) {
    const { level, interests, goal, availableHoursPerDay } = userProfile;
    const prompt = `Create a personalized CS learning path.
Student: ${level || 'beginner'} level, interests: ${interests?.join(', ') || 'General CS'}, goal: ${goal || 'become a CS professional'}, ${availableHoursPerDay || 2}h/day.

Return JSON:
{"title":"...","description":"...","totalEstimatedDays":90,"milestones":[{"title":"...","description":"...","subject":"...","topics":["..."],"estimatedDays":14,"order":1}],"tips":["..."]}`;
    return this.chat([{ role: 'user', content: prompt }], { level });
  }

  async generateVisual(concept, type = 'diagram') {
    return this.chat([{ role: 'user', content: `Create a ${type} for: "${concept}". Use a \`\`\`mermaid code block. Add a text explanation.` }]);
  }

  async resolveDoubt(doubt, context = {}) {
    let prompt = `Student doubt: "${doubt}"`;
    if (context.subject) prompt += `\nSubject: ${context.subject}`;
    if (context.topic) prompt += `\nTopic: ${context.topic}`;
    if (context.codeSnippet) prompt += `\nCode:\n\`\`\`\n${context.codeSnippet}\n\`\`\``;
    prompt += `\n\nAddress the doubt with examples, code, and diagrams if helpful.`;
    return this.chat([{ role: 'user', content: prompt }], context);
  }

  async generateCode(description, language = 'python', context = {}) {
    return this.chat(
      [{ role: 'user', content: `Write ${language} code for: "${description}"\nInclude: complete code, comments, time/space complexity, sample I/O.` }],
      { ...context, preferredLanguage: language }
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  FALLBACK (zero-config, always works)
  // ═══════════════════════════════════════════════════════════════

  _getFallbackResponse(query) {
    const q = query.toLowerCase();
    const topics = [
      { keys: ['data structure', 'array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'heap', 'trie'], fn: '_dsa' },
      { keys: ['algorithm', 'sort', 'search', 'dynamic programming', 'greedy', 'recursion', 'bfs', 'dfs', 'dijkstra', 'binary search'], fn: '_algo' },
      { keys: ['database', 'dbms', 'sql', 'normalization', 'acid', 'join', 'index', 'nosql'], fn: '_dbms' },
      { keys: ['operating system', ' os ', 'process', 'thread', 'deadlock', 'scheduling', 'memory management', 'paging', 'semaphore'], fn: '_os' },
      { keys: ['network', 'tcp', 'udp', 'osi', 'http', 'ip address', 'dns', 'routing', 'protocol'], fn: '_networks' },
      { keys: ['oop', 'object oriented', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'class', 'solid'], fn: '_oop' },
    ];

    for (const t of topics) {
      if (t.keys.some(k => q.includes(k))) {
        return { success: true, content: this[t.fn](), source: 'knowledge-base' };
      }
    }

    return {
      success: true,
      content: `# Hello! I'm NEXUS AI 🎓

I can help you with any Computer Science topic! Try asking:

- **"Explain binary search trees with code examples"**
- **"How does TCP/IP work?"**
- **"Write a Python program for merge sort"**
- **"What are ACID properties in DBMS?"**
- **"Explain deadlock with examples"**
- **"Explain OOP pillars with code"**
- **"Design a URL shortener system"**

I cover **15+ CS subjects** with diagrams, code, and real-world examples!`,
      source: 'knowledge-base'
    };
  }

  _dsa() {
    return `# Data Structures 📊

Data structures organize and store data efficiently. Here's a quick overview:

## Common Structures
| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Linked List | O(n) | O(n) | O(1) | O(1) |
| Stack/Queue | O(n) | O(n) | O(1) | O(1) |
| BST | O(log n) | O(log n) | O(log n) | O(log n) |
| Hash Table | N/A | O(1) | O(1) | O(1) |

\`\`\`python
# Binary Search Tree
class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

    def insert(self, val):
        if val < self.val:
            self.left = self.left.insert(val) if self.left else Node(val)
        else:
            self.right = self.right.insert(val) if self.right else Node(val)
        return self
\`\`\`

> **Tip**: Choose arrays for random access, linked lists for frequent inserts, hash tables for O(1) lookups.`;
  }

  _algo() {
    return `# Algorithms 🧮

## Sorting Comparison
| Algorithm | Best | Average | Worst | Stable? |
|-----------|------|---------|-------|---------|
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | ❌ |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | ❌ |

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: left = mid + 1
        else: right = mid - 1
    return -1
\`\`\`

> **Tip**: Master sorting, binary search, BFS/DFS, and dynamic programming for interviews.`;
  }

  _dbms() {
    return `# DBMS 🗄️

## Key Concepts
- **ACID**: Atomicity, Consistency, Isolation, Durability
- **Normalization**: 1NF → 2NF → 3NF → BCNF (eliminate redundancy)
- **Joins**: INNER, LEFT, RIGHT, FULL OUTER
- **Indexing**: B+ Tree (range queries), Hash (exact match)

\`\`\`sql
SELECT s.name, d.dept_name, AVG(s.gpa) as avg_gpa
FROM students s
JOIN departments d ON s.dept_id = d.id
GROUP BY d.dept_name
HAVING AVG(s.gpa) > 3.5;
\`\`\``;
  }

  _os() {
    return `# Operating Systems 🖥️

## Key Topics
- **Process States**: New → Ready → Running → Waiting → Terminated
- **Scheduling**: FCFS, SJF, Round Robin, Priority
- **Deadlock conditions**: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait
- **Memory**: Paging, Segmentation, Virtual Memory, Page Replacement (LRU, FIFO)

> **Tip**: Break any one deadlock condition to prevent deadlocks.`;
  }

  _networks() {
    return `# Computer Networks 🌐

## OSI Model: Application → Presentation → Session → Transport → Network → Data Link → Physical
- **TCP**: Reliable, connection-oriented (HTTP, FTP)
- **UDP**: Fast, connectionless (streaming, gaming, DNS)
- **Key ports**: HTTP=80, HTTPS=443, SSH=22, DNS=53, FTP=21`;
  }

  _oop() {
    return `# OOP 🏗️

## Four Pillars
1. **Encapsulation** — Bundle data + methods, hide internals
2. **Inheritance** — Reuse and extend parent class behavior
3. **Polymorphism** — Same interface, different implementations
4. **Abstraction** — Hide complexity, expose essentials

## SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion`;
  }
}

module.exports = new NexusAIAgent();
