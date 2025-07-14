// File: frontend/src/pages/admin/ordersService.js

import { getToken } from "../../services/authService"; // este cambio importa getToken desde servicios

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000"; // base URL de la API
const BASE = `${API_URL}/api/orders`; // endpoint de pedidos

/**
 * Construye headers comunes, incluyendo Authorization si hay token.
 */
function makeHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Obtiene todos los pedidos.
 * @returns {Promise<Array>}
 */
export async function fetchOrders() {
  const res = await fetch(BASE, { headers: makeHeaders() });
  if (!res.ok) throw new Error("Error al cargar pedidos");
  const json = await res.json();
  // La API responde { data: [...] }
  return Array.isArray(json.data) ? json.data : [];
}

/**
 * Crea un nuevo pedido (usado en checkout).
 * @param {{ customer_name: string, items: Array }} orderData
 */
export async function createOrder(orderData) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error creando pedido");
  }
  return res.json();
}

/**
 * Actualiza el estado de un pedido.
 * @param {number} id
 * @param {string} status
 */
export async function updateOrderStatus(id, status) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: makeHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error actualizando estado");
  }
  return res.json();
}

/**
 * Actualiza las notas internas de un pedido.
 * @param {number} id
 * @param {string} notes
 */
export async function updateOrderNotes(id, notes) {
  const res = await fetch(`${BASE}/${id}/notes`, {
    method: "PUT",
    headers: makeHeaders(),
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error guardando notas");
  }
  return res.json();
}

/**
 * Elimina un pedido.
 * @param {number} id
 */
export async function deleteOrder(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: makeHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error borrando pedido");
  }
  return true;
}
