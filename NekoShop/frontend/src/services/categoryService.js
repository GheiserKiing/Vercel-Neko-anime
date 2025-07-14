// File: frontend/src/services/categoryService.js

const API_BASE = process.env.REACT_APP_API_URL || '';

/**
 * Petición genérica.
 */
async function doFetch(path, body = null, options = {}) {
  const url = `${API_BASE}${path}`;
  const fetchOptions = { ...options };

  if (body !== null) {
    const payload = typeof body === 'string'
      ? { name: body }
      : body;
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers || {})
    };
    fetchOptions.body = JSON.stringify(payload);
  }

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

// — Servicios categorías —

export function fetchCategories() {
  return doFetch('/api/categories');
}

export function createCategory(category) {
  return doFetch('/api/categories', category, { method: 'POST' });
}

export function updateCategory(id, category) {
  return doFetch(`/api/categories/${id}`, category, { method: 'PUT' });
}

export function deleteCategory(id) {
  return doFetch(`/api/categories/${id}`, null, { method: 'DELETE' });
}

export function fetchSubcategories(categoryId) {
  return doFetch(`/api/categories/${categoryId}/subcategories`);
}

export function createSubcategory(categoryId, subcategory) {
  return doFetch(
    `/api/categories/${categoryId}/subcategories`,
    subcategory,
    { method: 'POST' }
  );
}

export function updateSubcategory(categoryId, subcategoryId, subcategory) {
  return doFetch(
    `/api/categories/${categoryId}/subcategories/${subcategoryId}`,
    subcategory,
    { method: 'PUT' }
  );
}

export function deleteSubcategory(categoryId, subcategoryId) {
  return doFetch(
    `/api/categories/${categoryId}/subcategories/${subcategoryId}`,
    null,
    { method: 'DELETE' }
  );
}
