// File: frontend/src/pages/admin/metricsService.js

import { getToken } from "../../services/authService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

/**
 * Ventas por día en los últimos N días.
 * @param {number} range
 */
export async function fetchSalesByDay(range) {
  const res = await fetch(
    `${API_URL}/api/metrics/sales-by-day?range=${range}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    },
  );
  if (!res.ok) throw new Error("Error cargando ventas diarias");
  return res.json();
}

/**
 * Top productos vendidos en los últimos N días.
 * @param {number} range
 */
export async function fetchTopProducts(range) {
  const res = await fetch(
    `${API_URL}/api/metrics/top-products?range=${range}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    },
  );
  if (!res.ok) throw new Error("Error cargando top productos");
  return res.json();
}
