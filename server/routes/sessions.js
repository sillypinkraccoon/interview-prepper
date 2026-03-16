import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = join(__dirname, '..', 'storage', 'sessions');

const router = express.Router();

function sessionPath(id) {
  return join(SESSIONS_DIR, `${id}.json`);
}

export async function saveSession(session) {
  await fs.writeFile(sessionPath(session.id), JSON.stringify(session, null, 2), 'utf-8');
  return session;
}

// GET /api/sessions — list summaries, newest first
router.get('/', async (_req, res, next) => {
  try {
    const files = await fs.readdir(SESSIONS_DIR).catch(() => []);
    const sessions = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(async f => {
          const raw = await fs.readFile(join(SESSIONS_DIR, f), 'utf-8');
          const s = JSON.parse(raw);
          return { id: s.id, roleTitle: s.roleTitle, company: s.company, createdAt: s.createdAt };
        })
    );
    sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

// GET /api/sessions/:id — full session
router.get('/:id', async (req, res, next) => {
  try {
    const path = sessionPath(req.params.id);
    if (!existsSync(path)) return res.status(404).json({ error: 'Session not found.' });
    const raw = await fs.readFile(path, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sessions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const path = sessionPath(req.params.id);
    if (!existsSync(path)) return res.status(404).json({ error: 'Session not found.' });
    await fs.unlink(path);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
