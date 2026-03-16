import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extractText } from '../services/pdfParser.js';
import { generateQuestions } from '../services/claudeClient.js';
import { saveSession } from '../routes/sessions.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 },
  { name: 'companyContextFile', maxCount: 1 },
  { name: 'linkedInFile', maxCount: 1 },
]), async (req, res, next) => {
  try {
    const resumeFile = req.files?.resume?.[0];
    const jdFile = req.files?.jobDescriptionFile?.[0];
    const companyContextFile = req.files?.companyContextFile?.[0];
    const linkedInFile = req.files?.linkedInFile?.[0];
    const jdText = req.body.jobDescriptionText || '';
    const linkedInText = req.body.linkedInText || '';
    const companyContext = req.body.companyContext || '';

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume PDF is required.' });
    }
    if (!jdFile && !jdText.trim()) {
      return res.status(400).json({ error: 'Job description is required (either upload a PDF or paste text).' });
    }

    const resumeText = await extractText(resumeFile.buffer);
    const jobDescText = jdFile ? await extractText(jdFile.buffer) : jdText.trim();
    const resolvedCompanyContext = companyContextFile ? await extractText(companyContextFile.buffer) : companyContext;
    const resolvedLinkedInText = linkedInFile ? await extractText(linkedInFile.buffer) : linkedInText;

    const data = await generateQuestions(resumeText, jobDescText, resolvedLinkedInText, resolvedCompanyContext);

    const session = {
      id: uuidv4(),
      roleTitle: data.roleTitle || 'Target Role',
      company: data.company || 'Target Company',
      createdAt: new Date().toISOString(),
      resumeSnapshot: resumeText.slice(0, 500),
      resumeContext: resumeText.slice(0, 6000),
      jdContext: jobDescText.slice(0, 4000),
      categories: data.categories,
      answers: {},
    };

    await saveSession(session);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

export default router;
