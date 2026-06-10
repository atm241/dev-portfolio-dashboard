import { config } from '../config.js';
import { apiCache } from './cache.js';

const GITHUB_API = 'https://api.github.com';

async function ghFetch<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-dashboard',
  };
  if (config.githubToken) {
    headers.Authorization = `Bearer ${config.githubToken}`;
  }
  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

interface GhRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
}

interface GhEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    commits?: { message: string }[];
    action?: string;
    pull_request?: { title: string; html_url: string };
    ref_type?: string;
    ref?: string | null;
  };
}

export async function getProfile() {
  return apiCache.getOrFetch('gh:profile', () =>
    ghFetch<{
      login: string;
      name: string | null;
      avatar_url: string;
      html_url: string;
      bio: string | null;
      public_repos: number;
      followers: number;
      following: number;
      created_at: string;
    }>(`/users/${config.githubUsername}`)
  );
}

export async function getRepos() {
  return apiCache.getOrFetch('gh:repos', async () => {
    const repos = await ghFetch<GhRepo[]>(
      `/users/${config.githubUsername}/repos?per_page=100&sort=pushed`
    );
    const own = repos.filter((r) => !r.fork);

    const languages: Record<string, number> = {};
    for (const repo of own) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] ?? 0) + 1;
      }
    }

    return {
      repos: own.slice(0, 12).map((r) => ({
        name: r.name,
        url: r.html_url,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        pushedAt: r.pushed_at,
      })),
      languages,
      totalRepos: own.length,
    };
  });
}

/** Recent public activity, flattened into a human-readable feed. */
export async function getActivity() {
  return apiCache.getOrFetch('gh:activity', async () => {
    const events = await ghFetch<GhEvent[]>(
      `/users/${config.githubUsername}/events/public?per_page=50`
    );
    return events
      .map((e) => {
        const base = { repo: e.repo.name, date: e.created_at };
        switch (e.type) {
          case 'PushEvent': {
            const commits = e.payload.commits ?? [];
            return {
              ...base,
              type: 'push',
              summary: `Pushed ${commits.length} commit${commits.length === 1 ? '' : 's'}`,
              detail: commits[commits.length - 1]?.message.split('\n')[0] ?? '',
            };
          }
          case 'PullRequestEvent':
            return {
              ...base,
              type: 'pr',
              summary: `${e.payload.action} a pull request`,
              detail: e.payload.pull_request?.title ?? '',
            };
          case 'CreateEvent':
            return {
              ...base,
              type: 'create',
              summary: `Created ${e.payload.ref_type}${e.payload.ref ? ` ${e.payload.ref}` : ''}`,
              detail: '',
            };
          default:
            return null;
        }
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .slice(0, 15);
  });
}
