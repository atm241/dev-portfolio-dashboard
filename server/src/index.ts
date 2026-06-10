import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import { config } from './config.js';
import { initDb } from './db.js';
import { authRouter } from './routes/auth.js';
import { jobsRouter } from './routes/jobs.js';
import { statsRouter } from './routes/stats.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);
app.use('/api/jobs', jobsRouter);

// In the Docker image the built client is copied next to dist/; serve it so
// the whole app ships as one container.
const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
app.use(express.static(clientDir));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Not found (client build missing in dev — use the Vite dev server)' });
  });
});

await initDb();
app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
