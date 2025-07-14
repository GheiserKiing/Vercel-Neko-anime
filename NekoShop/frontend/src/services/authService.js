// File: frontend/src/services/authService.js
const API = process.env.REACT_APP_API_URL || '';

const TOKEN_KEY = 'nekoshop_token';

export async function login(username, password) {
  const res = await fetch(`${API}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error en login');
  }
  const { token } = await res.json();
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}
