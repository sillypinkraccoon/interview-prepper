import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert interview coach helping a candidate prepare for a job interview. Write a sample answer the candidate could give out loud in an interview.

Guidelines:
- Draw on the candidate's specific experience from their resume — reference actual roles, projects, or achievements where relevant
- For behavioral questions, use the STAR method (Situation, Task, Action, Result) naturally woven into paragraphs — do not use STAR as explicit headers
- You must incorporate at least 2 of the provided keywords or themes into your answer; weave them in naturally
- Write 3–5 concise paragraphs; aim for ~250–400 words
- Sound authentic and conversational, not robotic or overly formal
- Return only the sample answer — no labels, no preamble, no explanation`;

export async function generateAnswer(session, question) {
  const { resumeContext, jdContext } = session;
  const { question: questionText, answerGuide } = question;
  const { strongResponseDescription, keywordsAndThemes } = answerGuide;

  const userContent = `CANDIDATE RESUME:
---
${resumeContext}
---

JOB DESCRIPTION:
---
${jdContext}
---

QUESTION: ${questionText}

ANSWER GUIDE: ${strongResponseDescription}

KEYWORDS TO WEAVE IN: ${keywordsAndThemes.join(', ')}

Write the sample answer now.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = response.content[0]?.text || '';
  if (!text.trim()) {
    throw Object.assign(new Error('No answer was generated. Please try again.'), { status: 422 });
  }
  return text.trim();
}
