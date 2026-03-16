import React from 'react';
import useAppStore from './store/appStore.js';
import SessionSidebar from './components/SessionSidebar/SessionSidebar.jsx';
import UploadForm from './components/UploadForm/UploadForm.jsx';
import QuestionBank from './components/QuestionBank/QuestionBank.jsx';

function LoadingView() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <div className="loading-text">Generating your 35 interview questions...</div>
      <div className="loading-subtext">Claude is analyzing your resume and the job description. This takes 20–40 seconds.</div>
    </div>
  );
}

export default function App() {
  const { view, currentSession, isGenerating } = useAppStore();

  let mainContent;
  if (isGenerating) {
    mainContent = <LoadingView />;
  } else if (currentSession) {
    mainContent = <QuestionBank />;
  } else {
    mainContent = <UploadForm />;
  }

  return (
    <div className="app-layout">
      <SessionSidebar />
      <main className="main-content">
        {mainContent}
      </main>
    </div>
  );
}
