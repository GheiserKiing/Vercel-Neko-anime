// File: frontend/src/services/supplierService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const client = axios.create({ baseURL: API });

export function fetchSuppliers() {
  return client.get('/api/suppliers').then(res => res.data);
}

export function createSupplier(supplier) {
  return client.post('/api/suppliers', supplier).then(res => res.data);
}

export function updateSupplier(id, data) {
  return client.put(`/api/suppliers/${id}`, data).then(res => res.data);
}

export function deleteSupplier(id) {
  return client.delete(`/api/suppliers/${id}`).then(res => res.data);
}

export function startSupplierAuth(id) {
  // URL de redirección a OAuth
  return `${API}/api/suppliers/${id}/auth`;
}

export function syncSupplier(id) {
  return client.post(`/api/suppliers/${id}/sync-products`).then(res => res.data);
}
