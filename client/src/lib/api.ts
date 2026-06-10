async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

export interface RepoSummary {
  repos: {
    name: string;
    url: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    pushedAt: string;
  }[];
  languages: Record<string, number>;
  totalRepos: number;
}

export interface ActivityItem {
  repo: string;
  date: string;
  type: string;
  summary: string;
  detail: string;
}

export type LeetCodeStats =
  | { found: false; username: string }
  | {
      found: true;
      username: string;
      ranking: number;
      solved: Record<'easy' | 'medium' | 'hard' | 'all', { solved: number; total: number }>;
      recent: { title: string; url: string; timestamp: number }[];
    };

export type JobStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'ghosted';

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  status: JobStatus;
  appliedDate: string;
  url: string | null;
  notes: string | null;
}

export interface JobStats {
  total: number;
  counts: Record<JobStatus, number>;
  responseRate: number;
}

export const api = {
  githubProfile: () => request<GitHubProfile>('/api/stats/github/profile'),
  githubRepos: () => request<RepoSummary>('/api/stats/github/repos'),
  githubActivity: () => request<ActivityItem[]>('/api/stats/github/activity'),
  leetcode: () => request<LeetCodeStats>('/api/stats/leetcode'),
  me: () => request<{ authenticated: boolean }>('/api/auth/me'),
  login: (password: string) =>
    request<{ ok: boolean }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  jobs: () => request<JobApplication[]>('/api/jobs'),
  jobStats: () => request<JobStats>('/api/jobs/stats'),
  createJob: (job: Omit<JobApplication, 'id'>) =>
    request<JobApplication>('/api/jobs', { method: 'POST', body: JSON.stringify(job) }),
  updateJob: (id: number, job: Omit<JobApplication, 'id'>) =>
    request<JobApplication>(`/api/jobs/${id}`, { method: 'PUT', body: JSON.stringify(job) }),
  deleteJob: (id: number) => request<void>(`/api/jobs/${id}`, { method: 'DELETE' }),
};
