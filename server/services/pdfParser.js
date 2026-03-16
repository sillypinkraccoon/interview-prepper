import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const MAX_CHARS = 8000;

export async function extractText(buffer) {
  const data = await pdfParse(buffer);
  const text = data.text?.trim() || '';
  if (!text) {
    throw Object.assign(new Error('Could not extract text from this PDF. Please try a text-based PDF or paste the content manually.'), { status: 422 });
  }
  return text.slice(0, MAX_CHARS);
}
