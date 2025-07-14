// File: frontend/src/services/settingsService.js

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export async function getSettings() {
  const res = await fetch(`${API}/api/settings`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error cargando ajustes: ${res.status} ${text}`);
  }
  return res.json();
}

export async function saveSettings(settingsPayload) {
  const res = await fetch(`${API}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsPayload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error guardando ajustes: ${res.status} ${text}`);
  }
  return res.json();
}

export async function uploadHeroImage(file) {
  const fd = new FormData();
  fd.append('hero', file);

  const res = await fetch(`${API}/api/settings/heroImage`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error subiendo imagen: ${res.status} ${text}`);
  }

  // El backend devuelve { url: "https://..." }
  const { url: absoluteUrl } = await res.json();

  // Si quieres usar la ruta relativa en tu front:
  // return { url: new URL(absoluteUrl).pathname };

  // O devuelve la URL absoluta para que siempre funcione:
  return { url: absoluteUrl };
}
