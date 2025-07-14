import React, { useEffect, useState } from "react";
import { fetchEmailLogs } from "../../../services/emailLogService";

export default function EmailLogsTab() {
  const [logs, setLogs]   = useState([]);
  const [error, setError] = useState(null);

  const refresh = () => {
    fetchEmailLogs()
      .then(setLogs)
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📧 Historial de Correos</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <button onClick={refresh}>🔄 Recargar Correos</button>
      <table border="1" cellPadding="8" style={{ marginTop: 20, width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th><th>Tipo</th><th>Pedido #</th>
            <th>Destinatario</th><th>Asunto</th><th>Enviado en</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.kind}</td>
              <td>{l.order_id ?? "–"}</td>
              <td>{l.recipient}</td>
              <td>{l.subject}</td>
              <td>{new Date(l.sent_at * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
