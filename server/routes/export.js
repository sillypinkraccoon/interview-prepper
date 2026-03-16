import express from 'express';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateDocx } from '../services/docxExporter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = join(__dirname, '..', 'storage', 'sessions');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });

    const path = join(SESSIONS_DIR, `${sessionId}.json`);
    if (!existsSync(path)) return res.status(404).json({ error: 'Session not found.' });

    const raw = await fs.readFile(path, 'utf-8');
    const session = JSON.parse(raw);
    const buffer = await generateDocx(session);

    const safeName = `${session.roleTitle}-${session.company}`.replace(/[^a-z0-9\-]/gi, '_').slice(0, 60);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="interview-prep-${safeName}.docx"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

export default router;
