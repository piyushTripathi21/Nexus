require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const InterviewQuestion = require('../models/InterviewQuestion');

const subjects = [
  {
    name: 'Data Structures & Algorithms',
    slug: 'data-structures-algorithms',
    description: 'Master fundamental data structures and algorithms — the backbone of programming interviews and competitive coding.',
    icon: '🏗️',
    color: '#6366f1',
    semester: 3,
    difficulty: 'intermediate',
    tags: ['dsa', 'arrays', 'trees', 'graphs', 'sorting', 'dynamic-programming']
  },
  {
    name: 'Database Management Systems',
    slug: 'database-management-systems',
    description: 'Learn SQL, normalization, transactions, indexing, and database design principles used in every software application.',
    icon: '🗄️',
    color: '#8b5cf6',
    semester: 4,
    difficulty: 'intermediate',
    tags: ['sql', 'normalization', 'acid', 'indexing', 'nosql']
  },
  {
    name: 'Operating Systems',
    slug: 'operating-systems',
    description: 'Understand process management, memory management, file systems, and CPU scheduling algorithms.',
    icon: '⚙️',
    color: '#ec4899',
    semester: 4,
    difficulty: 'intermediate',
    tags: ['process', 'threads', 'memory', 'scheduling', 'deadlock']
  },
  {
    name: 'Computer Networks',
    slug: 'computer-networks',
    description: 'Explore the OSI model, TCP/IP, routing protocols, network security, and how the internet works.',
    icon: '🌐',
    color: '#14b8a6',
    semester: 5,
    difficulty: 'intermediate',
    tags: ['osi', 'tcp-ip', 'routing', 'http', 'dns', 'security']
  },
  {
    name: 'Object-Oriented Programming',
    slug: 'object-oriented-programming',
    description: 'Master OOP concepts — encapsulation, inheritance, polymorphism, abstraction, and SOLID principles.',
    icon: '🧩',
    color: '#f59e0b',
    semester: 2,
    difficulty: 'beginner',
    tags: ['oop', 'classes', 'inheritance', 'polymorphism', 'design-patterns']
  },
  {
    name: 'Software Engineering',
    slug: 'software-engineering',
    description: 'Learn SDLC models, Agile methodology, software testing, project management, and design patterns.',
    icon: '📐',
    color: '#10b981',
    semester: 5,
    difficulty: 'intermediate',
    tags: ['sdlc', 'agile', 'testing', 'uml', 'design-patterns']
  },
  {
    name: 'Compiler Design',
    slug: 'compiler-design',
    description: 'Understand lexical analysis, parsing, syntax trees, code generation, and optimization techniques.',
    icon: '🔧',
    color: '#ef4444',
    semester: 6,
    difficulty: 'advanced',
    tags: ['lexer', 'parser', 'ast', 'code-generation', 'optimization']
  },
  {
    name: 'Theory of Computation',
    slug: 'theory-of-computation',
    description: 'Study automata theory, formal languages, Turing machines, and computational complexity.',
    icon: '🧮',
    color: '#6d28d9',
    semester: 5,
    difficulty: 'advanced',
    tags: ['automata', 'turing-machine', 'grammar', 'decidability', 'complexity']
  },
  {
    name: 'Computer Architecture',
    slug: 'computer-architecture',
    description: 'Learn CPU design, instruction sets, pipelining, memory hierarchy, and parallel processing.',
    icon: '🖥️',
    color: '#0ea5e9',
    semester: 3,
    difficulty: 'intermediate',
    tags: ['cpu', 'pipeline', 'cache', 'risc', 'cisc', 'assembly']
  },
  {
    name: 'Discrete Mathematics',
    slug: 'discrete-mathematics',
    description: 'Build mathematical foundations — logic, sets, relations, graph theory, and combinatorics for CS.',
    icon: '🔢',
    color: '#84cc16',
    semester: 1,
    difficulty: 'beginner',
    tags: ['logic', 'sets', 'graph-theory', 'combinatorics', 'probability']
  },
  {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description: 'Explore search algorithms, knowledge representation, machine learning, neural networks, and NLP.',
    icon: '🤖',
    color: '#f97316',
    semester: 6,
    difficulty: 'advanced',
    tags: ['search', 'ml', 'neural-networks', 'nlp', 'deep-learning']
  },
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Full-stack web development — HTML, CSS, JavaScript, React, Node.js, REST APIs, and deployment.',
    icon: '🌍',
    color: '#06b6d4',
    semester: 4,
    difficulty: 'beginner',
    tags: ['html', 'css', 'javascript', 'react', 'nodejs', 'api']
  },
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Learn cryptography, network security, ethical hacking, vulnerabilities, and security protocols.',
    icon: '🔒',
    color: '#dc2626',
    semester: 7,
    difficulty: 'advanced',
    tags: ['cryptography', 'encryption', 'firewall', 'ethical-hacking', 'owasp']
  },
  {
    name: 'Cloud Computing',
    slug: 'cloud-computing',
    description: 'Understand cloud architectures, AWS/Azure/GCP, containerization, serverless, and DevOps practices.',
    icon: '☁️',
    color: '#3b82f6',
    semester: 7,
    difficulty: 'intermediate',
    tags: ['aws', 'docker', 'kubernetes', 'serverless', 'devops']
  },
  {
    name: 'System Design',
    slug: 'system-design',
    description: 'Design scalable systems — load balancing, caching, databases, microservices, and distributed systems.',
    icon: '🏛️',
    color: '#7c3aed',
    semester: 8,
    difficulty: 'advanced',
    tags: ['scalability', 'load-balancing', 'caching', 'microservices', 'distributed']
  }
];

// Sample topics for DSA subject
const dsaTopics = [
  {
    title: 'Arrays and Strings',
    slug: 'arrays-and-strings',
    order: 1,
    overview: 'Arrays are the most fundamental data structure — a contiguous memory block storing elements of the same type. Strings are arrays of characters with special operations.',
    detailedContent: `# Arrays and Strings

## Arrays
An array is a collection of items stored at contiguous memory locations. The idea is to store multiple items of the same type together.

### Key Operations:
- **Access**: O(1) — direct index access
- **Search**: O(n) — linear scan, O(log n) with binary search if sorted
- **Insert**: O(n) — need to shift elements
- **Delete**: O(n) — need to shift elements

### Types of Arrays:
1. **Static Array** — Fixed size, declared at compile time
2. **Dynamic Array** — Resizable (ArrayList in Java, vector in C++, list in Python)
3. **2D Array/Matrix** — Array of arrays

## Common Array Techniques:
- Two Pointer Technique
- Sliding Window
- Prefix Sum
- Kadane's Algorithm (Maximum Subarray)

## Strings
Strings are immutable in most languages. Key operations include concatenation, substring, and pattern matching.

### String Algorithms:
- KMP Pattern Matching
- Rabin-Karp Algorithm
- Z-Algorithm`,
    keyPoints: [
      'Arrays provide O(1) random access by index',
      'Insertion and deletion are O(n) due to shifting',
      'Two-pointer and sliding window are essential techniques',
      'Strings are immutable in Java, Python, JavaScript',
      'Dynamic arrays double in size when capacity is reached'
    ],
    visualRepresentations: [
      {
        type: 'diagram',
        title: 'Array Memory Layout',
        mermaidCode: `graph LR
    A["Index 0<br/>Value: 10"] --> B["Index 1<br/>Value: 20"]
    B --> C["Index 2<br/>Value: 30"]
    C --> D["Index 3<br/>Value: 40"]
    D --> E["Index 4<br/>Value: 50"]
    style A fill:#6366f1,color:#fff
    style B fill:#8b5cf6,color:#fff
    style C fill:#a78bfa,color:#fff
    style D fill:#8b5cf6,color:#fff
    style E fill:#6366f1,color:#fff`,
        description: 'Array elements stored in contiguous memory locations with direct index access.'
      },
      {
        type: 'comparison',
        title: 'Array vs Linked List',
        data: {
          headers: ['Feature', 'Array', 'Linked List'],
          rows: [
            ['Access', 'O(1)', 'O(n)'],
            ['Search', 'O(n)', 'O(n)'],
            ['Insert (beginning)', 'O(n)', 'O(1)'],
            ['Insert (end)', 'O(1)*', 'O(n)'],
            ['Memory', 'Contiguous', 'Scattered'],
            ['Size', 'Fixed/Dynamic', 'Dynamic']
          ]
        }
      }
    ],
    codeExamples: [
      {
        language: 'python',
        code: `# Two Sum Problem - Classic Array Problem
def two_sum(nums, target):
    """Find two numbers that add up to target. Return their indices."""
    seen = {}  # value -> index mapping
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Example
print(two_sum([2, 7, 11, 15], 9))  # Output: [0, 1]

# Sliding Window - Maximum Sum Subarray of size K
def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum

print(max_sum_subarray([1, 4, 2, 10, 2, 3, 1, 0, 20], 4))  # Output: 24`,
        explanation: 'Two Sum uses a hash map for O(n) solution. Sliding Window maintains a window of size K.'
      },
      {
        language: 'java',
        code: `// Two Sum in Java
import java.util.*;

public class ArrayProblems {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
        explanation: 'Same approach using Java HashMap for O(n) time complexity.'
      }
    ],
    realWorldApplications: [
      'Image processing — pixels stored as 2D arrays',
      'Database records stored in arrays for fast access',
      'String manipulation in text editors and compilers',
      'Financial data — time series stored as arrays'
    ],
    complexity: {
      time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
      space: 'O(n)'
    },
    difficulty: 'beginner',
    estimatedTime: 45,
    xpReward: 50,
    tags: ['array', 'string', 'two-pointer', 'sliding-window', 'hash-map']
  },
  {
    title: 'Linked Lists',
    slug: 'linked-lists',
    order: 2,
    overview: 'A linked list is a linear data structure where elements are stored in nodes, each pointing to the next node. Unlike arrays, linked lists don\'t need contiguous memory.',
    detailedContent: `# Linked Lists\n\n## Types:\n1. **Singly Linked List** — Each node points to next\n2. **Doubly Linked List** — Nodes point to both next and previous\n3. **Circular Linked List** — Last node points back to first\n\n## Operations:\n- Insert at head: O(1)\n- Insert at tail: O(n) for singly, O(1) with tail pointer\n- Delete: O(n) to find, O(1) to remove\n- Search: O(n)`,
    keyPoints: ['Dynamic size — no need to pre-allocate', 'O(1) insertion at head', 'No random access — must traverse', 'Extra memory for pointers', 'Used in stacks, queues, hash table chaining'],
    visualRepresentations: [{
      type: 'diagram',
      title: 'Singly Linked List',
      mermaidCode: `graph LR\n    H[Head] --> A["10 | →"]\n    A --> B["20 | →"]\n    B --> C["30 | →"]\n    C --> D["40 | null"]\n    style H fill:#f59e0b,color:#000\n    style A fill:#6366f1,color:#fff\n    style B fill:#8b5cf6,color:#fff\n    style C fill:#a78bfa,color:#fff\n    style D fill:#6366f1,color:#fff`,
      description: 'Each node stores data and a reference to the next node.'
    }],
    codeExamples: [{
      language: 'python',
      code: `class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n\n    def insert_at_head(self, data):\n        new_node = Node(data)\n        new_node.next = self.head\n        self.head = new_node\n\n    def insert_at_tail(self, data):\n        new_node = Node(data)\n        if not self.head:\n            self.head = new_node\n            return\n        current = self.head\n        while current.next:\n            current = current.next\n        current.next = new_node\n\n    def display(self):\n        current = self.head\n        while current:\n            print(current.data, end=" -> ")\n            current = current.next\n        print("None")\n\n# Usage\nll = LinkedList()\nll.insert_at_head(30)\nll.insert_at_head(20)\nll.insert_at_head(10)\nll.insert_at_tail(40)\nll.display()  # 10 -> 20 -> 30 -> 40 -> None`,
      explanation: 'Basic singly linked list with insert at head and tail operations.'
    }],
    realWorldApplications: ['Browser back/forward navigation', 'Music playlist', 'Undo functionality', 'Hash table collision chaining'],
    complexity: { time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }, space: 'O(n)' },
    difficulty: 'beginner',
    estimatedTime: 40,
    xpReward: 50,
    tags: ['linked-list', 'singly', 'doubly', 'circular', 'pointers']
  },
  {
    title: 'Stacks and Queues',
    slug: 'stacks-and-queues',
    order: 3,
    overview: 'Stacks follow LIFO (Last In First Out) and Queues follow FIFO (First In First Out). Both are fundamental abstract data types used everywhere in CS.',
    detailedContent: `# Stacks and Queues\n\n## Stack (LIFO)\nOperations: push, pop, peek — all O(1)\nApplications: function calls, undo, expression parsing\n\n## Queue (FIFO)\nOperations: enqueue, dequeue, front — all O(1)\nVariants: Circular Queue, Priority Queue, Deque`,
    keyPoints: ['Stack: LIFO — Last In First Out', 'Queue: FIFO — First In First Out', 'Both have O(1) core operations', 'Stack used in recursion, backtracking', 'Queue used in BFS, task scheduling'],
    visualRepresentations: [{
      type: 'diagram',
      title: 'Stack vs Queue',
      mermaidCode: `graph TD\n    subgraph Stack_LIFO\n        S1["TOP → 40"] --> S2["30"] --> S3["20"] --> S4["10"]\n    end\n    subgraph Queue_FIFO\n        Q1["FRONT → 10"] --> Q2["20"] --> Q3["30"] --> Q4["40 ← REAR"]\n    end`,
      description: 'Stack pushes/pops from top. Queue enqueues at rear, dequeues from front.'
    }],
    codeExamples: [{
      language: 'python',
      code: `# Stack implementation\nclass Stack:\n    def __init__(self):\n        self.items = []\n    \n    def push(self, item):\n        self.items.append(item)\n    \n    def pop(self):\n        if not self.is_empty():\n            return self.items.pop()\n    \n    def peek(self):\n        if not self.is_empty():\n            return self.items[-1]\n    \n    def is_empty(self):\n        return len(self.items) == 0\n\n# Balanced Parentheses check\ndef is_balanced(expr):\n    stack = Stack()\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in expr:\n        if char in '({[':\n            stack.push(char)\n        elif char in ')}]':\n            if stack.is_empty() or stack.pop() != mapping[char]:\n                return False\n    return stack.is_empty()\n\nprint(is_balanced("{[()]}"))  # True\nprint(is_balanced("{[(])}"))  # False`,
      explanation: 'Stack-based solution for balanced parentheses — classic interview question.'
    }],
    realWorldApplications: ['Function call stack in programming', 'Browser back button (stack)', 'Print queue (queue)', 'CPU task scheduling (priority queue)'],
    complexity: { time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' }, space: 'O(n)' },
    difficulty: 'beginner',
    estimatedTime: 35,
    xpReward: 50,
    tags: ['stack', 'queue', 'lifo', 'fifo', 'priority-queue']
  },
  {
    title: 'Trees and Binary Search Trees',
    slug: 'trees-and-bst',
    order: 4,
    overview: 'Trees are hierarchical data structures. Binary Search Trees (BST) maintain sorted order enabling O(log n) search, insert, and delete operations.',
    detailedContent: '# Trees\n\nA tree is a connected acyclic graph. Key concepts: root, parent, child, leaf, height, depth.\n\n## Binary Search Tree\nLeft child < Parent < Right child\n\n## Traversals:\n- Inorder (Left, Root, Right) — gives sorted order\n- Preorder (Root, Left, Right)\n- Postorder (Left, Right, Root)\n- Level Order (BFS)',
    keyPoints: ['BST: left < root < right property', 'Inorder traversal gives sorted sequence', 'Average operations O(log n), worst O(n)', 'Self-balancing: AVL, Red-Black trees guarantee O(log n)', 'Used in databases, file systems'],
    visualRepresentations: [{
      type: 'tree',
      title: 'Binary Search Tree',
      mermaidCode: `graph TD\n    A((50)) --> B((30))\n    A --> C((70))\n    B --> D((20))\n    B --> E((40))\n    C --> F((60))\n    C --> G((80))\n    style A fill:#6366f1,color:#fff\n    style B fill:#8b5cf6,color:#fff\n    style C fill:#8b5cf6,color:#fff\n    style D fill:#a78bfa,color:#fff\n    style E fill:#a78bfa,color:#fff\n    style F fill:#a78bfa,color:#fff\n    style G fill:#a78bfa,color:#fff`,
      description: 'BST with root 50. All left subtree values < 50, right subtree values > 50.'
    }],
    codeExamples: [{
      language: 'python',
      code: `class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\nclass BST:\n    def __init__(self):\n        self.root = None\n\n    def insert(self, val):\n        self.root = self._insert(self.root, val)\n\n    def _insert(self, node, val):\n        if not node:\n            return TreeNode(val)\n        if val < node.val:\n            node.left = self._insert(node.left, val)\n        else:\n            node.right = self._insert(node.right, val)\n        return node\n\n    def inorder(self, node, result=None):\n        if result is None:\n            result = []\n        if node:\n            self.inorder(node.left, result)\n            result.append(node.val)\n            self.inorder(node.right, result)\n        return result\n\nbst = BST()\nfor val in [50, 30, 70, 20, 40, 60, 80]:\n    bst.insert(val)\nprint(bst.inorder(bst.root))  # [20, 30, 40, 50, 60, 70, 80]`,
      explanation: 'BST with recursive insert and inorder traversal producing sorted output.'
    }],
    realWorldApplications: ['Database indexing (B-trees)', 'File system directory structure', 'DOM tree in web browsers', 'Expression trees in compilers'],
    complexity: { time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' }, space: 'O(n)' },
    difficulty: 'intermediate',
    estimatedTime: 50,
    xpReward: 75,
    tags: ['tree', 'bst', 'traversal', 'binary-tree', 'avl']
  },
  {
    title: 'Graphs',
    slug: 'graphs',
    order: 5,
    overview: 'Graphs model relationships between objects. They consist of vertices (nodes) and edges (connections). Essential for modeling networks, social media, maps, and more.',
    detailedContent: '# Graphs\n\n## Representations:\n1. Adjacency Matrix — O(V²) space\n2. Adjacency List — O(V+E) space\n\n## Traversals:\n- BFS — Level-by-level, shortest path in unweighted\n- DFS — Deep exploration, cycle detection\n\n## Key Algorithms:\n- Dijkstra — Shortest path (weighted)\n- Bellman-Ford — Handles negative weights\n- Kruskal/Prim — Minimum Spanning Tree\n- Topological Sort — DAG ordering',
    keyPoints: ['Directed vs Undirected, Weighted vs Unweighted', 'BFS uses queue, DFS uses stack/recursion', 'Adjacency list preferred for sparse graphs', 'Dijkstra O((V+E) log V) with min-heap', 'Topological sort only for DAGs'],
    visualRepresentations: [{
      type: 'graph',
      title: 'Graph with BFS Traversal',
      mermaidCode: `graph LR\n    A((0)) --- B((1))\n    A --- C((2))\n    B --- D((3))\n    C --- D\n    D --- E((4))\n    style A fill:#6366f1,color:#fff\n    style B fill:#8b5cf6,color:#fff\n    style C fill:#8b5cf6,color:#fff\n    style D fill:#a78bfa,color:#fff\n    style E fill:#c4b5fd,color:#000`,
      description: 'Undirected graph. BFS from 0: visits 0→1→2→3→4.'
    }],
    codeExamples: [{
      language: 'python',
      code: `from collections import deque, defaultdict\n\nclass Graph:\n    def __init__(self):\n        self.adj = defaultdict(list)\n\n    def add_edge(self, u, v):\n        self.adj[u].append(v)\n        self.adj[v].append(u)  # undirected\n\n    def bfs(self, start):\n        visited = set([start])\n        queue = deque([start])\n        order = []\n        while queue:\n            node = queue.popleft()\n            order.append(node)\n            for neighbor in self.adj[node]:\n                if neighbor not in visited:\n                    visited.add(neighbor)\n                    queue.append(neighbor)\n        return order\n\n    def dfs(self, start, visited=None):\n        if visited is None:\n            visited = set()\n        visited.add(start)\n        result = [start]\n        for neighbor in self.adj[start]:\n            if neighbor not in visited:\n                result.extend(self.dfs(neighbor, visited))\n        return result\n\ng = Graph()\nfor u, v in [(0,1), (0,2), (1,3), (2,3), (3,4)]:\n    g.add_edge(u, v)\nprint("BFS:", g.bfs(0))  # [0, 1, 2, 3, 4]\nprint("DFS:", g.dfs(0))  # [0, 1, 3, 2, 4]`,
      explanation: 'Graph with adjacency list, BFS (queue-based) and DFS (recursive) traversals.'
    }],
    realWorldApplications: ['Google Maps — shortest path', 'Social networks — friend recommendations', 'Internet routing protocols', 'Dependency resolution in build systems'],
    complexity: { time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' }, space: 'O(V+E)' },
    difficulty: 'intermediate',
    estimatedTime: 60,
    xpReward: 100,
    tags: ['graph', 'bfs', 'dfs', 'dijkstra', 'mst', 'topological-sort']
  }
];

// Sample interview questions for DSA
const dsaInterviewQuestions = [
  {
    question: 'What is the difference between an Array and a Linked List?',
    answer: 'Arrays store elements in contiguous memory with O(1) access by index but O(n) insertion/deletion. Linked Lists use nodes with pointers, allowing O(1) insertion/deletion at known positions but O(n) access. Arrays have better cache locality. Linked Lists have dynamic size without reallocation.',
    difficulty: 'easy',
    type: 'conceptual',
    company: 'Amazon',
    followUpQuestions: ['When would you prefer a Linked List over an Array?', 'What is cache locality and why does it matter?'],
    hints: ['Think about memory layout', 'Consider common operations and their time complexities'],
    tags: ['array', 'linked-list', 'comparison']
  },
  {
    question: 'Explain how a Hash Map works internally.',
    answer: 'A HashMap uses an array of buckets. A hash function maps keys to bucket indices. On collision (two keys map to same index), it typically uses chaining (linked list at each bucket) or open addressing (probing). Average operations are O(1). When load factor exceeds threshold (usually 0.75), the map resizes (doubles) and rehashes all entries.',
    difficulty: 'medium',
    type: 'conceptual',
    company: 'Google',
    followUpQuestions: ['What happens during a resize operation?', 'How does Java handle HashMap differently in Java 8+?', 'What makes a good hash function?'],
    hints: ['Think about the array + linked list combination', 'Consider what happens when many keys hash to the same bucket'],
    tags: ['hash-map', 'hashing', 'collision']
  },
  {
    question: 'Find the middle element of a linked list in one pass.',
    answer: 'Use the slow-fast pointer technique. Initialize two pointers at head. Move slow by 1 step and fast by 2 steps. When fast reaches the end, slow is at the middle. Time: O(n), Space: O(1).',
    difficulty: 'easy',
    type: 'coding',
    company: 'Microsoft',
    followUpQuestions: ['How would you detect a cycle in a linked list?', 'Can you find the start of the cycle?'],
    hints: ['Think about two pointers moving at different speeds', 'What happens when fast pointer reaches the end?'],
    codeSnippet: 'def find_middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow.data',
    tags: ['linked-list', 'two-pointer', 'fast-slow']
  },
  {
    question: 'Design a stack that supports getMin() in O(1) time.',
    answer: 'Use two stacks: one main stack and one min stack. When pushing, also push to min stack if the value is <= current minimum. When popping, also pop from min stack if the popped value equals the current minimum. getMin() returns the top of the min stack. All operations remain O(1).',
    difficulty: 'medium',
    type: 'coding',
    company: 'Amazon',
    followUpQuestions: ['Can you do it with O(1) extra space?', 'How would you also support getMax()?'],
    hints: ['Think about maintaining extra information', 'What if you kept track of the minimum at each state?'],
    tags: ['stack', 'design', 'min-stack']
  },
  {
    question: 'Explain the time complexity of different sorting algorithms and when to use each.',
    answer: 'Quick Sort: Average O(n log n), worst O(n²) — best general purpose sort. Merge Sort: Always O(n log n), stable — good for linked lists and external sorting. Heap Sort: O(n log n) guaranteed, in-place — when memory is constrained. Counting Sort: O(n+k) — when range is known and small. Tim Sort (Python/Java default): Hybrid merge+insertion sort, O(n log n), excels on partially sorted data.',
    difficulty: 'medium',
    type: 'conceptual',
    company: 'Google',
    followUpQuestions: ['Why is Quick Sort faster in practice than Merge Sort?', 'What is the lower bound for comparison-based sorting?'],
    hints: ['Think about best/average/worst cases', 'Consider stability and space requirements'],
    tags: ['sorting', 'time-complexity', 'comparison']
  }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus');
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await Subject.deleteMany({});
    await Topic.deleteMany({});
    await InterviewQuestion.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed subjects
    const createdSubjects = await Subject.insertMany(subjects);
    console.log(`📚 Seeded ${createdSubjects.length} subjects`);

    // Find DSA subject for topics
    const dsaSubject = createdSubjects.find(s => s.slug === 'data-structures-algorithms');

    // Seed DSA topics
    const topicsWithSubject = dsaTopics.map(t => ({ ...t, subject: dsaSubject._id }));
    const createdTopics = await Topic.insertMany(topicsWithSubject);
    console.log(`📖 Seeded ${createdTopics.length} DSA topics`);

    // Update subject topic count
    await Subject.findByIdAndUpdate(dsaSubject._id, { totalTopics: createdTopics.length });

    // Seed interview questions
    const questionsWithSubject = dsaInterviewQuestions.map(q => ({ ...q, subject: dsaSubject._id }));
    const createdQuestions = await InterviewQuestion.insertMany(questionsWithSubject);
    console.log(`❓ Seeded ${createdQuestions.length} interview questions`);

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedData();
