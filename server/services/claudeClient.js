import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXPECTED_Q_COUNT = 7;

function parseResponse(text) {
  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw Object.assign(new Error('Claude did not return valid JSON. Please try again.'), { status: 422 });
    data = JSON.parse(match[0]);
  }

  if (!Array.isArray(data.categories) || data.categories.length !== 5) {
    throw Object.assign(new Error('Response missing expected categories. Please try again.'), { status: 422 });
  }
  for (const cat of data.categories) {
    if (!Array.isArray(cat.questions) || cat.questions.length !== EXPECTED_Q_COUNT) {
      throw Object.assign(new Error(`Category "${cat.name}" does not have ${EXPECTED_Q_COUNT} questions. Please try again.`), { status: 422 });
    }
  }

  return data;
}

export async function generateQuestions(resumeText, jdText, linkedInText, companyContext) {
  const { buildMessages } = await import('./promptBuilder.js');
  const { system, messages } = buildMessages(resumeText, jdText, linkedInText, companyContext);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system,
    messages,
  });

  const text = response.content[0]?.text || '';
  return parseResponse(text);
}
