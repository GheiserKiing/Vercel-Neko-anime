// File: frontend/src/pages/admin/tabs/EmailTemplatesTab.jsx
import React, { useEffect, useState } from "react";
import { fetchEmailTemplates, updateEmailTemplate } from "../../../services/emailTemplateService";

export default function EmailTemplatesTab() {
  const [tpls, setTpls] = useState(null);       // null = cargando, [] = vacío
  const [edit, setEdit] = useState({});
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    setTpls(null);
    fetchEmailTemplates()
      .then(data => {
        setTpls(data);
        const initial = {};
        data.forEach(t => {
          initial[t.key] = {
            subject: t.subject_template,
            body:    t.body_template
          };
        });
        setEdit(initial);
      })
      .catch(err => {
        console.error(err);
        setError("Error al cargar plantillas: " + err.message);
        setTpls([]);
      });
  };

  useEffect(load, []);

  const handleChange = (key, field, value) => {
    setEdit(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handleSave = key => {
    updateEmailTemplate(key, {
      subject_template: edit[key].subject,
      body_template:    edit[key].body
    })
      .then(() => alert(`Plantilla '${key}' guardada.`))
      .catch(err => alert("Error guardando plantilla: " + err.message));
  };

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>✏️ Plantillas de Email</h2>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={load}>🔄 Reintentar</button>
      </div>
    );
  }

  if (tpls === null) {
    return (
      <div style={{ padding: 20 }}>
        <h2>✏️ Plantillas de Email</h2>
        <p>Cargando plantillas…</p>
      </div>
    );
  }

  if (tpls.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        <h2>✏️ Plantillas de Email</h2>
        <p>No hay plantillas disponibles.</p>
        <button onClick={load}>🔄 Recargar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>✏️ Plantillas de Email</h2>
      <button onClick={load} style={{ marginBottom: 16 }}>🔄 Recargar plantillas</button>
      {tpls.map(t => (
        <div key={t.key} style={{ marginBottom: 20, padding: 10, border: "1px solid #ccc" }}>
          <h3>{t.key}</h3>
          <label>Asunto:</label><br/>
          <input
            type="text"
            style={{ width: "100%", margin: "4px 0 12px" }}
            value={edit[t.key]?.subject || ""}
            onChange={e => handleChange(t.key, "subject", e.target.value)}
          />
          <label>Cuerpo:</label><br/>
          <textarea
            style={{ width: "100%", height: 120, margin: "4px 0 12px" }}
            value={edit[t.key]?.body || ""}
            onChange={e => handleChange(t.key, "body", e.target.value)}
          />
          <button onClick={() => handleSave(t.key)}>💾 Guardar</button>
        </div>
      ))}
    </div>
  );
}
