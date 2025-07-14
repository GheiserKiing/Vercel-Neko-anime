// File: frontend/src/pages/admin/tabs/NewsletterTab.jsx
import React, { useEffect, useState, useMemo } from "react";
import { fetchSubscribers } from "../../../services/newsletterService";

export default function NewsletterTab() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    fetchSubscribers()
      .then(data => setSubs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filtrado según dominio y rango de fechas
  const filtered = useMemo(() => {
    return subs.filter(s => {
      // Dominio
      if (filterDomain) {
        const domain = s.email.split("@")[1] || "";
        if (!domain.includes(filterDomain.trim().toLowerCase())) {
          return false;
        }
      }
      // Fecha
      const date = new Date(s.subscribedAt);
      if (filterFrom && date < new Date(filterFrom)) return false;
      if (filterTo   && date > new Date(filterTo))   return false;
      return true;
    });
  }, [subs, filterDomain, filterFrom, filterTo]);

  // Exportar CSV de suscriptores filtrados
  const downloadCSV = () => {
    const header = ["ID", "Email", "Suscrito"];
    const rows = filtered.map(s => [s.id, s.email, s.subscribedAt]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `subscribers_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  if (loading) return <p>Cargando suscriptores…</p>;
  if (!loading && subs.length === 0) return <p>No hay suscriptores aún.</p>;

  return (
    <div>
      <h2>📰 Suscriptores Newsletter</h2>

      {/* Filtros */}
      <div style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div>
          <label>Dominio:</label>{' '}
          <input
            type="text"
            placeholder="ej: gmail.com"
            value={filterDomain}
            onChange={e => setFilterDomain(e.target.value)}
          />
        </div>
        <div>
          <label>Desde:</label>{' '}
          <input
            type="date"
            value={filterFrom}
            onChange={e => setFilterFrom(e.target.value)}
          />
        </div>
        <div>
          <label>Hasta:</label>{' '}
          <input
            type="date"
            value={filterTo}
            onChange={e => setFilterTo(e.target.value)}
          />
        </div>
        <button onClick={() => {
          setFilterDomain("");
          setFilterFrom("");
          setFilterTo("");
        }}>
          🔄 Restablecer filtros
        </button>
      </div>

      <button onClick={downloadCSV} style={{ marginBottom: 12 }}>
        📥 Descargar CSV filtrado
      </button>

      <table
        border="1"
        cellPadding="6"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Suscrito</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.email}</td>
              <td>{new Date(s.subscribedAt).toLocaleString()}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No hay resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
