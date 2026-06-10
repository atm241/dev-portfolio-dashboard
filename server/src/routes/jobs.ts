import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { pool } from '../db.js';

export const jobsRouter = Router();
jobsRouter.use(requireAuth);

export const STATUSES = ['applied', 'screening', 'interview', 'offer', 'rejected', 'ghosted'] as const;

const applicationSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  status: z.enum(STATUSES).default('applied'),
  appliedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  url: z.string().url().nullish().or(z.literal('').transform(() => null)),
  notes: z.string().max(5000).nullish(),
});

const rowToJson = (row: Record<string, unknown>) => ({
  id: row.id,
  company: row.company,
  role: row.role,
  status: row.status,
  appliedDate: row.applied_date instanceof Date
    ? row.applied_date.toISOString().slice(0, 10)
    : row.applied_date,
  url: row.url,
  notes: row.notes,
  updatedAt: row.updated_at,
});

jobsRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM applications ORDER BY applied_date DESC, id DESC');
  res.json(rows.map(rowToJson));
});

jobsRouter.get('/stats', async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT status, COUNT(*)::int AS count FROM applications GROUP BY status'
  );
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const row of rows) counts[row.status] = row.count;
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const responses = total - counts.applied - counts.ghosted;
  res.json({
    total,
    counts,
    responseRate: total > 0 ? responses / total : 0,
  });
});

jobsRouter.post('/', async (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    return;
  }
  const a = parsed.data;
  const { rows } = await pool.query(
    `INSERT INTO applications (company, role, status, applied_date, url, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [a.company, a.role, a.status, a.appliedDate, a.url ?? null, a.notes ?? null]
  );
  res.status(201).json(rowToJson(rows[0]));
});

jobsRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    return;
  }
  const a = parsed.data;
  const { rows } = await pool.query(
    `UPDATE applications
     SET company = $1, role = $2, status = $3, applied_date = $4, url = $5, notes = $6, updated_at = now()
     WHERE id = $7 RETURNING *`,
    [a.company, a.role, a.status, a.appliedDate, a.url ?? null, a.notes ?? null, id]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(rowToJson(rows[0]));
});

jobsRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const { rowCount } = await pool.query('DELETE FROM applications WHERE id = $1', [id]);
  if (rowCount === 0) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.status(204).end();
});
