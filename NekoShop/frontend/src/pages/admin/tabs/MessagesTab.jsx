import React, { useEffect, useState } from "react";
import {
  fetchMessages,
  createMessage,
  deleteMessage,
} from "../../../services/messageService";

export default function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg]     = useState({ type: "info", title: "", text: "" });
  const [error, setError]       = useState(null);

  const refresh = () => {
    fetchMessages()
      .then(setMessages)
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = () => {
    createMessage(newMsg)
      .then(() => {
        setNewMsg({ type: "info", title: "", text: "" });
        refresh();
      })
      .catch(err => setError(err.message));
  };

  const handleDelete = id => {
    deleteMessage(id)
      .then(refresh)
      .catch(err => setError(err.message));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>✉️ Mensajes del Sistema</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div style={{ marginBottom: 20 }}>
        <h3>Crear nuevo mensaje</h3>
        <select
          value={newMsg.type}
          onChange={e => setNewMsg({ ...newMsg, type: e.target.value })}
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <input
          placeholder="Título"
          value={newMsg.title}
          onChange={e => setNewMsg({ ...newMsg, title: e.target.value })}
        />
        <input
          placeholder="Texto"
          value={newMsg.text}
          onChange={e => setNewMsg({ ...newMsg, text: e.target.value })}
        />
        <button onClick={handleCreate}>➕ Crear</button>
      </div>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th><th>Tipo</th><th>Título</th><th>Texto</th>
            <th>Creado</th><th>Leído</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {messages.map(m => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.type}</td>
              <td>{m.title}</td>
              <td>{m.text}</td>
              <td>{new Date(m.created_at * 1000).toLocaleString()}</td>
              <td>{m.read ? "✅" : "❌"}</td>
              <td>
                <button onClick={() => handleDelete(m.id)}>🗑️ Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
