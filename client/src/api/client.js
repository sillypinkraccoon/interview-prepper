async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res;
}

export async function generateSession(formData) {
  const res = await fetch('/api/generate', { method: 'POST', body: formData });
  await handleResponse(res);
  return res.json();
}

export async function listSessions() {
  const res = await fetch('/api/sessions');
  await handleResponse(res);
  return res.json();
}

export async function loadSession(id) {
  const res = await fetch(`/api/sessions/${id}`);
  await handleResponse(res);
  return res.json();
}

export async function deleteSession(id) {
  const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
  await handleResponse(res);
  return res.json();
}

export async function exportSession(sessionId, filename) {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  await handleResponse(res);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'interview-prep.docx';
  a.click();
  URL.revokeObjectURL(url);
}
