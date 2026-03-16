import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx';

function titleBlock(roleTitle, company, date) {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: `Interview Prep: ${roleTitle} at ${company}`, bold: true, size: 40, color: '1a3a5c' }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Generated: ${date}`, color: '6b7280', size: 20 }),
      ],
      spacing: { after: 600 },
    }),
  ];
}

function categoryHeader(name, isFirst) {
  return new Paragraph({
    children: [new TextRun({ text: name.toUpperCase(), bold: true, size: 32, color: '1a3a5c' })],
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: !isFirst,
    spacing: { before: isFirst ? 0 : 200, after: 200 },
  });
}

function questionHeading(id, question) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${id}. `, bold: true, color: '2563eb', size: 24 }),
      new TextRun({ text: question, bold: true, size: 24 }),
    ],
    spacing: { before: 240, after: 80 },
  });
}

function sectionLabel(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: '6b7280', size: 18, allCaps: true })],
    spacing: { before: 120, after: 60 },
  });
}

function bodyText(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 80 },
  });
}

function bulletItem(text) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 22 })],
    indent: { left: 360 },
    spacing: { after: 40 },
  });
}

export async function generateDocx(session) {
  const { roleTitle, company, createdAt, categories, answers = {} } = session;
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const children = [...titleBlock(roleTitle, company, date)];

  categories.forEach((category, catIdx) => {
    children.push(categoryHeader(category.name, catIdx === 0));

    category.questions.forEach(q => {
      children.push(questionHeading(q.id, q.question));
      children.push(sectionLabel('Answer Guide'));
      children.push(bodyText(q.answerGuide.strongResponseDescription));
      children.push(sectionLabel('Keywords & Themes to Hit'));
      q.answerGuide.keywordsAndThemes.forEach(kw => children.push(bulletItem(kw)));
      if (answers[q.id]) {
        children.push(sectionLabel('Sample Answer'));
        children.push(bodyText(answers[q.id]));
      }
    });
  });

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
