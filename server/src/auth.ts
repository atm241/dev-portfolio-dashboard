import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const AUTH_COOKIE = 'portfolio_session';
const SESSION_HOURS = 24 * 7;

export function passwordMatches(candidate: string, actual: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(actual);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(secret = config.jwtSecret): string {
  return jwt.sign({ role: 'admin' }, secret, { expiresIn: `${SESSION_HOURS}h` });
}

export function verifySessionToken(token: string, secret = config.jwtSecret): boolean {
  try {
    const payload = jwt.verify(token, secret);
    return typeof payload === 'object' && payload.role === 'admin';
  } catch {
    return false;
  }
}

/** Guards the private job-tracker routes. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE];
  if (typeof token !== 'string' || !verifySessionToken(token)) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
