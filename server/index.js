import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

import generateRoute from './routes/generate.js';
import sessionsRoute from './routes/sessions.js';
import exportRoute from './routes/export.js';
import errorHandler from './middleware/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// Ensure sessions directory exists
const sessionsDir = join(__dirname, 'storage', 'sessions');
fs.mkdirSync(sessionsDir, { recursive: true });

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/generate', generateRoute);
app.use('/api/sessions', sessionsRoute);
app.use('/api/export', exportRoute);

// Serve Vite build in production
const distPath = join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(join(distPath, 'index.html')));
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
