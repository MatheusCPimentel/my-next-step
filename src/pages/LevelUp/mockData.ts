import type { WeakPoint, WeakPointCategory } from "@/pages/LevelUp/types";

export const INITIAL_CATEGORIES: WeakPointCategory[] = [
  { id: "algorithms", name: "Algorithms", color: "coral" },
  { id: "system-design", name: "System Design", color: "purple" },
  { id: "behavioral", name: "Behavioral", color: "teal" },
];

export const INITIAL_WEAK_POINTS: WeakPoint[] = [
  {
    id: "wp-1",
    categoryId: "algorithms",
    question: "How would you find the longest substring without repeating characters?",
    answer:
      "Use a sliding window with a Set or Map. Track the start of the window and move it forward when you hit a duplicate. Update the max length on each iteration. O(n) time, O(min(m, n)) space where m is the charset size.",
    sourceJob: "Senior Frontend @ Nubank",
    mastered: false,
  },
  {
    id: "wp-2",
    categoryId: "algorithms",
    question: "Explain how a binary search tree's in-order traversal produces a sorted sequence.",
    answer:
      "In-order traversal visits left subtree, then the node, then right subtree. Because every left descendant is less than the node and every right descendant is greater, this naturally yields ascending order for any BST.",
    sourceJob: "Backend Engineer @ Stripe",
    mastered: true,
  },
  {
    id: "wp-3",
    categoryId: "algorithms",
    question: "When would you choose a heap over a sorted array?",
    answer:
      "Heaps give O(log n) insertion and O(1) peek for the min/max element, which is faster than maintaining a sorted array (O(n) insertion). Use a heap when you only care about the extreme element and the data is dynamic — schedulers, top-k problems, Dijkstra.",
    sourceJob: "Senior Frontend @ Nubank",
    mastered: false,
  },
  {
    id: "wp-4",
    categoryId: "system-design",
    question: "How would you design a URL shortener that handles 1B requests per day?",
    answer:
      "Generate short keys via base62 encoding of an auto-incrementing ID or a hash of the URL. Store the mapping in a key-value store like Redis for hot reads, with Postgres as the source of truth. Use a CDN for redirects, rate-limit per IP, and shard by key prefix for horizontal scale.",
    sourceJob: "Staff Engineer @ Cloudflare",
    mastered: false,
  },
  {
    id: "wp-5",
    categoryId: "system-design",
    question: "How do you handle eventual consistency in a multi-region database?",
    answer:
      "Pick a consistency model that fits the use case: strong for financial data (Spanner-style consensus), eventual for feeds and counters (CRDTs or last-write-wins). Surface staleness to the user when relevant ('updated 5s ago'), and design retries to be idempotent so reconciliation is safe.",
    sourceJob: "Staff Engineer @ Cloudflare",
    mastered: false,
  },
  {
    id: "wp-6",
    categoryId: "behavioral",
    question: "Tell me about a time you disagreed with a senior engineer on a technical decision.",
    answer:
      "Use STAR. Be specific: name the decision, your concern, the data you brought, and the eventual outcome. Emphasize the conversation pattern — listen first, surface trade-offs in writing, propose a small experiment when possible. End with what you learned, not who 'won'.",
    sourceJob: "Senior Frontend @ Nubank",
    mastered: false,
  },
];
