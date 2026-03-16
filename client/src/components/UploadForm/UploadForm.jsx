import React, { useState } from 'react';
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
  const [linkedInMode, setLinkedInMode] = useState('text');
  const [linkedInFile, setLinkedInFile] = useState(null);
  const [companyContext, setCompanyContext] = useState('');
  const [companyContextOpen, setCompanyContextOpen] = useState(false);
  const [companyContextMode, setCompanyContextMode] = useState('text');
  const [companyContextFile, setCompanyContextFile] = useState(null);

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

    if (companyContextMode === 'file' && companyContextFile) fd.append('companyContextFile', companyContextFile);
    else if (companyContext.trim()) fd.append('companyContext', companyContext);

    if (linkedInMode === 'file' && linkedInFile) fd.append('linkedInFile', linkedInFile);
    else if (linkedInText.trim()) fd.append('linkedInText', linkedInText);
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
      <p className="page-subtitle">Upload your resume and job description to generate 25 tailored interview questions.</p>

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

          {/* Company Context collapsible */}
          <div className="collapsible-section">
            <button
              type="button"
              className="collapsible-trigger"
              aria-expanded={companyContextOpen}
              onClick={() => setCompanyContextOpen(o => !o)}
            >
              <span>🏢 Add Company Context <span style={{fontWeight:400,color:'#94a3b8',fontSize:'12px'}}>(optional)</span></span>
              <span className="collapsible-chevron">▼</span>
            </button>
            {companyContextOpen && (
              <div className="collapsible-body">
                <p className="collapsible-hint">
                  Add anything useful about the company — mission, recent news, products, strategy, culture, or challenges. Claude will use this to sharpen Culture Fit and Role-Specific questions.
                </p>
                <div className="jd-toggle" style={{marginBottom: '12px'}}>
                  <button type="button" className={`jd-toggle-btn${companyContextMode === 'text' ? ' active' : ''}`} onClick={() => setCompanyContextMode('text')}>Paste Text</button>
                  <button type="button" className={`jd-toggle-btn${companyContextMode === 'file' ? ' active' : ''}`} onClick={() => setCompanyContextMode('file')}>Upload PDF</button>
                </div>
                {companyContextMode === 'text' ? (
                  <textarea
                    placeholder="e.g. Company mission, values, recent product launches, funding stage, known challenges..."
                    value={companyContext}
                    onChange={e => setCompanyContext(e.target.value)}
                    rows={5}
                  />
                ) : (
                  <div className="file-input-wrapper">
                    <label className={`file-input-label${companyContextFile ? ' has-file' : ''}`}>
                      <span className="file-input-icon">{companyContextFile ? '✅' : '📎'}</span>
                      <span className="file-input-text">{companyContextFile ? companyContextFile.name : 'Click to upload company context PDF'}</span>
                      <input type="file" accept=".pdf" onChange={e => setCompanyContextFile(e.target.files[0] || null)} />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

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
                  Add the hiring manager's profile. Claude will use their background to tailor question framing and emphasis.
                </p>
                <div className="jd-toggle" style={{marginBottom: '12px'}}>
                  <button type="button" className={`jd-toggle-btn${linkedInMode === 'text' ? ' active' : ''}`} onClick={() => setLinkedInMode('text')}>Paste Text</button>
                  <button type="button" className={`jd-toggle-btn${linkedInMode === 'file' ? ' active' : ''}`} onClick={() => setLinkedInMode('file')}>Upload PDF</button>
                </div>
                {linkedInMode === 'text' ? (
                  <textarea
                    placeholder="Open the LinkedIn profile, select all (Ctrl+A / Cmd+A), copy, and paste here..."
                    value={linkedInText}
                    onChange={e => setLinkedInText(e.target.value)}
                    rows={5}
                  />
                ) : (
                  <div className="file-input-wrapper">
                    <label className={`file-input-label${linkedInFile ? ' has-file' : ''}`}>
                      <span className="file-input-icon">{linkedInFile ? '✅' : '📎'}</span>
                      <span className="file-input-text">{linkedInFile ? linkedInFile.name : 'Click to upload hiring manager profile PDF'}</span>
                      <input type="file" accept=".pdf" onChange={e => setLinkedInFile(e.target.files[0] || null)} />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Generate 25 Interview Questions →
        </button>
      </form>
    </div>
  );
}
