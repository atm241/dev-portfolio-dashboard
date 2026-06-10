const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 3001),
  githubUsername: required('GITHUB_USERNAME', 'atm241'),
  leetcodeUsername: required('LEETCODE_USERNAME', 'atm241'),
  githubToken: process.env.GITHUB_TOKEN || undefined,
  adminPassword: required('ADMIN_PASSWORD', 'change-me'),
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-do-not-use-in-prod'),
  databaseUrl: required(
    'DATABASE_URL',
    'postgres://portfolio:portfolio@localhost:5432/portfolio'
  ),
  isProduction: process.env.NODE_ENV === 'production',
};
