import React from 'react';
import useAppStore from '../../store/appStore.js';
import { exportSession } from '../../api/client.js';

export default function QuestionBank() {
  const { currentSession, activeCategoryIndex, setActiveCategoryIndex, isExporting, setExporting, startNewSession } = useAppStore();
  const { id, roleTitle, company, createdAt, categories } = currentSession;

  async function handleExport() {
    setExporting(true);
    try {
      const safeName = `${roleTitle}-${company}`.replace(/[^a-z0-9\-]/gi, '_').slice(0, 60);
      await exportSession(id, `interview-prep-${safeName}.docx`);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  }

  const activeCategory = categories[activeCategoryIndex];

  return (
    <div className="question-bank">
      <div className="bank-header">
        <div>
          <div className="bank-title">{roleTitle} at {company}</div>
          <div className="bank-meta">
            Generated {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}{categories.reduce((n, c) => n + c.questions.length, 0)} questions across {categories.length} categories
          </div>
        </div>
        <button className="export-btn" onClick={handleExport} disabled={isExporting}>
          {isExporting ? '⏳ Exporting...' : '⬇ Export .docx'}
        </button>
      </div>

      <div className="category-tabs">
        {categories.map((cat, i) => (
          <button
            key={cat.name}
            className={`category-tab${activeCategoryIndex === i ? ' active' : ''}`}
            onClick={() => setActiveCategoryIndex(i)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="question-list">
        {activeCategory.questions.map(q => (
          <details key={q.id} className="question-card">
            <summary>
              <span className="q-id-badge">{q.id}</span>
              <span className="q-text">{q.question}</span>
              <span className="q-chevron">▼</span>
            </summary>
            <div className="answer-guide">
              <div className="answer-guide-section">
                <div className="guide-label">Answer Guide</div>
                <p className="guide-description">{q.answerGuide.strongResponseDescription}</p>
              </div>
              <div className="answer-guide-section">
                <div className="guide-label">Keywords & Themes to Hit</div>
                <div className="keyword-list">
                  {q.answerGuide.keywordsAndThemes.map(kw => (
                    <span key={kw} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>

      <div style={{marginTop: '32px', textAlign: 'center'}}>
        <button
          style={{background:'transparent',color:'#64748b',fontSize:'13px',padding:'8px 16px',border:'1px solid #e2e8f0',borderRadius:'8px'}}
          onClick={startNewSession}
        >
          ← Prep for a different role
        </button>
      </div>
    </div>
  );
}
