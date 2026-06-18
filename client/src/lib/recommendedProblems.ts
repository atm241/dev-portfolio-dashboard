// A curated Blind 75-style study set, grouped by the pattern each problem
// teaches. Slugs map to https://leetcode.com/problems/<slug>/.
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  slug: string;
  title: string;
  difficulty: Difficulty;
}

export interface ProblemGroup {
  pattern: string;
  problems: Problem[];
}

export const RECOMMENDED_PROBLEMS: ProblemGroup[] = [
  {
    pattern: 'Arrays & Hashing',
    problems: [
      { slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy' },
      { slug: 'contains-duplicate', title: 'Contains Duplicate', difficulty: 'Easy' },
      { slug: 'valid-anagram', title: 'Valid Anagram', difficulty: 'Easy' },
      { slug: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium' },
      { slug: 'top-k-frequent-elements', title: 'Top K Frequent Elements', difficulty: 'Medium' },
      { slug: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Two Pointers',
    problems: [
      { slug: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy' },
      { slug: '3sum', title: '3Sum', difficulty: 'Medium' },
      { slug: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Sliding Window',
    problems: [
      { slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' },
      { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium' },
      { slug: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Stack',
    problems: [
      { slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy' },
      { slug: 'min-stack', title: 'Min Stack', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Binary Search',
    problems: [
      { slug: 'binary-search', title: 'Binary Search', difficulty: 'Easy' },
      { slug: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium' },
      { slug: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Linked List',
    problems: [
      { slug: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy' },
      { slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy' },
      { slug: 'linked-list-cycle', title: 'Linked List Cycle', difficulty: 'Easy' },
      { slug: 'reorder-list', title: 'Reorder List', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Trees',
    problems: [
      { slug: 'invert-binary-tree', title: 'Invert Binary Tree', difficulty: 'Easy' },
      { slug: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', difficulty: 'Easy' },
      { slug: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium' },
      { slug: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Dynamic Programming',
    problems: [
      { slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy' },
      { slug: 'house-robber', title: 'House Robber', difficulty: 'Medium' },
      { slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium' },
      { slug: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Graphs',
    problems: [
      { slug: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium' },
      { slug: 'clone-graph', title: 'Clone Graph', difficulty: 'Medium' },
      { slug: 'course-schedule', title: 'Course Schedule', difficulty: 'Medium' },
    ],
  },
  {
    pattern: 'Intervals',
    problems: [
      { slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium' },
      { slug: 'insert-interval', title: 'Insert Interval', difficulty: 'Medium' },
    ],
  },
];

/** Pull the problem slug out of a LeetCode problem URL, e.g. .../problems/two-sum/. */
export function slugFromUrl(url: string): string | null {
  return url.match(/\/problems\/([^/]+)/)?.[1] ?? null;
}
