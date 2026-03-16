import React, { useEffect } from 'react';
import useAppStore from '../../store/appStore.js';
import { listSessions, loadSession, deleteSession } from '../../api/client.js';

export default function SessionSidebar() {
  const { sessions, currentSession, setSessions, setCurrentSession, startNewSession } = useAppStore();

  useEffect(() => {
    listSessions().then(setSessions).catch(console.error);
  }, []);

  async function handleLoad(id) {
    try {
      const session = await loadSession(id);
      setCurrentSession(session);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this session?')) return;
    try {
      await deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      if (currentSession?.id === id) startNewSession();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Interview <span>Prep Studio</span></div>
        <button className="sidebar-new-btn" onClick={startNewSession}>+ New Session</button>
      </div>

      <div className="sidebar-section-title">Past Sessions</div>

      <div className="sidebar-sessions">
        {sessions.length === 0 ? (
          <p className="sidebar-empty">No saved sessions yet.</p>
        ) : (
          sessions.map(s => (
            <div
              key={s.id}
              className={`session-item${currentSession?.id === s.id ? ' active' : ''}`}
              onClick={() => handleLoad(s.id)}
            >
              <div className="session-item-info">
                <div className="session-item-role">{s.roleTitle}</div>
                <div className="session-item-meta">
                  {s.company} · {new Date(s.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                className="session-delete-btn"
                onClick={(e) => handleDelete(e, s.id)}
                title="Delete session"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
