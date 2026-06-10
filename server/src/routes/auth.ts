import { Router } from 'express';
import { z } from 'zod';
import { AUTH_COOKIE, createSessionToken, passwordMatches, verifySessionToken } from '../auth.js';
import { config } from '../config.js';

export const authRouter = Router();

const loginSchema = z.object({ password: z.string().min(1) });

authRouter.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }
  if (!passwordMatches(parsed.data.password, config.adminPassword)) {
    res.status(401).json({ error: 'Incorrect password' });
    return;
  }
  res.cookie(AUTH_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE);
  res.json({ ok: true });
});

authRouter.get('/me', (req, res) => {
  const token = req.cookies?.[AUTH_COOKIE];
  res.json({ authenticated: typeof token === 'string' && verifySessionToken(token) });
});
