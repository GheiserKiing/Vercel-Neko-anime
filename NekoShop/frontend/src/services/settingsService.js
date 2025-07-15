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

  // Devuelve la URL absoluta para funcionar en cualquier entorno
  return { url: absoluteUrl };
}
