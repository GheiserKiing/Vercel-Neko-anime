// File: frontend/src/pages/admin/bulkService.js

import { getToken } from "../../services/authService"; // este cambio importa getToken

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

/**
 * Subir CSV para bulk upload.
 */
export async function uploadBulkCSV(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_URL}/api/products/bulk-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` }, // este cambio añade header
    body: fd,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error en carga masiva");
  return json;
}
