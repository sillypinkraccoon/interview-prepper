import React, { useState, useRef } from 'react';
import useAppStore from '../../store/appStore.js';
import { generateSession, listSessions } from '../../api/client.js';

export default function UploadForm() {
  const { setCurrentSession, setSessions, setGenerating, setGenerateError, generateError, lastFormData, setLastFormData } = useAppStore();

  const [resumeFile, setResumeFile] = useState(null);
  const [jdMode, setJdMode] = useState('text'); // 'text' | 'file'
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [company, setCompany] = useState('');
  const [linkedInText, setLinkedInText] = useState('');
  const [linkedInOpen, setLinkedInOpen] = useState(false);

  async function submit(e) {
    e?.preventDefault();
    setGenerateError(null);

    const fd = new FormData();
    if (!resumeFile) { setGenerateError('Please upload your resume PDF.'); return; }
    fd.append('resume', resumeFile);

    if (jdMode === 'file') {
      if (!jdFile) { setGenerateError('Please upload a job description PDF.'); return; }
      fd.append('jobDescriptionFile', jdFile);
    } else {
      if (!jdText.trim()) { setGenerateError('Please paste the job description text.'); return; }
      fd.append('jobDescriptionText', jdText);
    }

    if (linkedInText.trim()) fd.append('linkedInText', linkedInText);
    setLastFormData(fd);

    setGenerating(true);
    try {
      const session = await generateSession(fd);
      setCurrentSession(session);
      const sessions = await listSessions();
      setSessions(sessions);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="upload-form">
      <h1 className="page-title">Interview Prep Studio</h1>
      <p className="page-subtitle">Upload your resume and job description to generate 35 tailored interview questions.</p>

      {generateError && (
        <div className="error-banner">
          <span>⚠️</span>
          <div>
            {generateError}
            {lastFormData && (
              <div>
                <button className="error-retry-btn" onClick={() => submit()}>Retry</button>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={submit}>
        {/* Role Info */}
        <div className="form-card">
          <div className="form-card-title">📋 Role Information</div>
          <div className="form-row">
            <div className="form-group">
              <label>Role Title <span className="label-optional">(optional)</span></label>
              <input type="text" placeholder="e.g. Senior Product Manager" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Company <span className="label-optional">(optional)</span></label>
              <input type="text" placeholder="e.g. Acme Corp" value={company} onChange={e => setCompany(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Resume */}
        <div className="form-card">
          <div className="form-card-title">📄 Your Resume</div>
          <div className="form-group">
            <div className="file-input-wrapper">
              <label className={`file-input-label${resumeFile ? ' has-file' : ''}`}>
                <span className="file-input-icon">{resumeFile ? '✅' : '📎'}</span>
                <span className="file-input-text">
                  {resumeFile ? resumeFile.name : 'Click to upload resume PDF'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setResumeFile(e.target.files[0] || null)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="form-card">
          <div className="form-card-title">💼 Job Description</div>
          <div className="jd-toggle">
            <button type="button" className={`jd-toggle-btn${jdMode === 'text' ? ' active' : ''}`} onClick={() => setJdMode('text')}>Paste Text</button>
            <button type="button" className={`jd-toggle-btn${jdMode === 'file' ? ' active' : ''}`} onClick={() => setJdMode('file')}>Upload PDF</button>
          </div>

          {jdMode === 'text' ? (
            <div className="form-group">
              <textarea
                placeholder="Paste the full job description here..."
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                rows={8}
              />
            </div>
          ) : (
            <div className="form-group">
              <div className="file-input-wrapper">
                <label className={`file-input-label${jdFile ? ' has-file' : ''}`}>
                  <span className="file-input-icon">{jdFile ? '✅' : '📎'}</span>
                  <span className="file-input-text">
                    {jdFile ? jdFile.name : 'Click to upload job description PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setJdFile(e.target.files[0] || null)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* LinkedIn collapsible */}
          <div className="collapsible-section">
            <button
              type="button"
              className="collapsible-trigger"
              aria-expanded={linkedInOpen}
              onClick={() => setLinkedInOpen(o => !o)}
            >
              <span>👤 Add Hiring Manager Context <span style={{fontWeight:400,color:'#94a3b8',fontSize:'12px'}}>(optional)</span></span>
              <span className="collapsible-chevron">▼</span>
            </button>
            {linkedInOpen && (
              <div className="collapsible-body">
                <p className="collapsible-hint">
                  Open the hiring manager's LinkedIn profile, select all text on the page (Ctrl+A / Cmd+A), copy, and paste below. Claude will use their background to tailor question framing and emphasis.
                </p>
                <textarea
                  placeholder="Paste LinkedIn profile text here..."
                  value={linkedInText}
                  onChange={e => setLinkedInText(e.target.value)}
                  rows={5}
                />
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Generate 35 Interview Questions →
        </button>
      </form>
    </div>
  );
}
