// File: frontend/src/services/productService.js
const API_BASE = process.env.REACT_APP_API_URL || '';

async function doFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const fetchOptions = { ...options };
  if (options.body != null && !(options.body instanceof FormData)) {
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
  }
  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Error ${res.status}`);
  }
  return res.json();
}

export function fetchProducts(query = '') {
  return doFetch(`/api/products${query}`).then(json =>
    Array.isArray(json.data) ? json.data : []
  );
}

export function fetchProductById(id) {
  return doFetch(`/api/products/${id}`);
}

export function createProduct(payload) {
  return doFetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload) {
  return doFetch(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function uploadProductImages(id, formData) {
  return doFetch(`/api/products/${id}/images`, {
    method: 'POST',
    body: formData,
  });
}

export function deleteProduct(id) {
  return doFetch(`/api/products/${id}`, { method: 'DELETE' });
}
