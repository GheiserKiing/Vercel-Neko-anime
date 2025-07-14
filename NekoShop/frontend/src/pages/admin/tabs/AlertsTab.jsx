import React, { useEffect, useState } from "react";
import { fetchAlerts, deleteAlert } from "../../../services/alertService";

export default function AlertsTab() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError]   = useState(null);

  const refresh = () => {
    fetchAlerts()
      .then(setAlerts)
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🔔 Alertas del Sistema</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <button onClick={refresh}>🔄 Recargar Alertas</button>
      <table border="1" cellPadding="8" style={{ marginTop: 20, width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th><th>Tipo</th><th>Título</th><th>Texto</th>
            <th>Creado</th><th>Leído</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.type}</td>
              <td>{a.title}</td>
              <td>{a.text}</td>
              <td>{new Date(a.created_at * 1000).toLocaleString()}</td>
              <td>{a.read ? "✅" : "❌"}</td>
              <td>
                <button onClick={() => deleteAlert(a.id).then(refresh)}>
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
