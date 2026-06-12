import { Router } from 'express';
import { getActivity, getContributions, getProfile, getRepos } from '../services/github.js';
import { getLeetCodeStats } from '../services/leetcode.js';

export const statsRouter = Router();

const handle = (fetcher: () => Promise<unknown>) => {
  return async (_req: unknown, res: import('express').Response) => {
    try {
      res.json(await fetcher());
    } catch (err) {
      console.error(err);
      res.status(502).json({ error: err instanceof Error ? err.message : 'Upstream API error' });
    }
  };
};

statsRouter.get('/github/profile', handle(getProfile));
statsRouter.get('/github/repos', handle(getRepos));
statsRouter.get('/github/activity', handle(getActivity));
statsRouter.get('/github/contributions', handle(getContributions));
statsRouter.get('/leetcode', handle(getLeetCodeStats));
