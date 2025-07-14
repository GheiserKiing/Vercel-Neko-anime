import { fetchMessages, deleteMessage } from "./messageService";

// Alertas: solo lectura y eliminación
export function fetchAlerts() {
  return fetchMessages();
}

export function deleteAlert(id) {
  return deleteMessage(id);
}
