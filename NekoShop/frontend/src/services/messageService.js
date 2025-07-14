// File: frontend/src/services/messageService.js

// ---------- AL PRINCIPIO: import genérico para fetch ----------
async function doFetch(path, options = {}) {
  const url = `${process.env.REACT_APP_API_URL}${path}`;
  const opts = { ...options };
  if (opts.body != null) {
    opts.headers = { "Content-Type": "application/json", ...(opts.headers||{}) };
    opts.body = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Error ${res.status}`);
  }
  return res.json();
}

// ─── Fetch messages ────────────────────────────────────────────
export async function fetchMessages() {
  return await doFetch("/api/messages");
}

// ─── CREA un mensaje (antes faltaba) ───────────────────────────
export async function createMessage({ type, title, text }) {
  // El backend espera { type, title, text }
  return await doFetch("/api/messages", {
    method: "POST",
    body: { type, title, text }
  });
}

// ─── Borra un mensaje ──────────────────────────────────────────
export async function deleteMessage(id) {
  await doFetch(`/api/messages/${id}`, { method: "DELETE" });
}
