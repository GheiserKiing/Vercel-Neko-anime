// File: frontend/src/services/dropshipService.js
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function importDropshipProducts(products) {
  return fetch(`${API}/api/dropship/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  })
    .then(res => {
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    });
}
