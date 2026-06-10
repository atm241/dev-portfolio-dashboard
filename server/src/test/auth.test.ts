import { describe, expect, it } from 'vitest';
import { createSessionToken, passwordMatches, verifySessionToken } from '../auth.js';

describe('passwordMatches', () => {
  it('accepts the correct password', () => {
    expect(passwordMatches('hunter2', 'hunter2')).toBe(true);
  });

  it('rejects wrong passwords, including different lengths', () => {
    expect(passwordMatches('hunter3', 'hunter2')).toBe(false);
    expect(passwordMatches('hunter22', 'hunter2')).toBe(false);
    expect(passwordMatches('', 'hunter2')).toBe(false);
  });
});

describe('session tokens', () => {
  it('round-trips a valid token', () => {
    const token = createSessionToken('test-secret');
    expect(verifySessionToken(token, 'test-secret')).toBe(true);
  });

  it('rejects tokens signed with a different secret', () => {
    const token = createSessionToken('test-secret');
    expect(verifySessionToken(token, 'other-secret')).toBe(false);
  });

  it('rejects garbage tokens', () => {
    expect(verifySessionToken('not-a-jwt', 'test-secret')).toBe(false);
  });
});
