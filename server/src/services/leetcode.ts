import { config } from '../config.js';
import { apiCache } from './cache.js';

// LeetCode has no official API; this is the same GraphQL endpoint their
// own frontend uses, queried read-only for public profile data.
const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const STATS_QUERY = `
query userProfile($username: String!) {
  allQuestionsCount { difficulty count }
  matchedUser(username: $username) {
    username
    profile { ranking }
    submitStatsGlobal {
      acSubmissionNum { difficulty count }
    }
  }
  recentAcSubmissionList(username: $username, limit: 10) {
    title
    titleSlug
    timestamp
  }
}`;

interface LcResponse {
  data: {
    allQuestionsCount: { difficulty: string; count: number }[];
    matchedUser: {
      username: string;
      profile: { ranking: number };
      submitStatsGlobal: {
        acSubmissionNum: { difficulty: string; count: number }[];
      };
    } | null;
    recentAcSubmissionList: { title: string; titleSlug: string; timestamp: string }[] | null;
  };
}

export async function getLeetCodeStats() {
  return apiCache.getOrFetch('lc:stats', async () => {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (portfolio-dashboard)',
      },
      body: JSON.stringify({
        query: STATS_QUERY,
        variables: { username: config.leetcodeUsername },
      }),
    });
    if (!res.ok) {
      throw new Error(`LeetCode API failed: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as LcResponse;
    const user = json.data.matchedUser;
    if (!user) {
      return { found: false as const, username: config.leetcodeUsername };
    }

    const solvedBy = (difficulty: string) =>
      user.submitStatsGlobal.acSubmissionNum.find((s) => s.difficulty === difficulty)?.count ?? 0;
    const totalBy = (difficulty: string) =>
      json.data.allQuestionsCount.find((q) => q.difficulty === difficulty)?.count ?? 0;

    return {
      found: true as const,
      username: user.username,
      ranking: user.profile.ranking,
      solved: {
        easy: { solved: solvedBy('Easy'), total: totalBy('Easy') },
        medium: { solved: solvedBy('Medium'), total: totalBy('Medium') },
        hard: { solved: solvedBy('Hard'), total: totalBy('Hard') },
        all: { solved: solvedBy('All'), total: totalBy('All') },
      },
      recent: (json.data.recentAcSubmissionList ?? []).map((s) => ({
        title: s.title,
        url: `https://leetcode.com/problems/${s.titleSlug}/`,
        timestamp: Number(s.timestamp) * 1000,
      })),
    };
  });
}
