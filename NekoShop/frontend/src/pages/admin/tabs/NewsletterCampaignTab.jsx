// File: frontend/src/pages/admin/tabs/NewsletterCampaignTab.jsx
import React, { useState } from "react";
import { sendCampaign } from "../../../services/newsletterService";

export default function NewsletterCampaignTab() {
  const [segment, setSegment] = useState({ interest: "", country: "", domain: "" });
  const [subject, setSubject] = useState("");
  const [body, setBody]       = useState("");
  const [result, setResult]   = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await sendCampaign(segment, subject, body);
      setResult(`✅ Emails enviados: ${res.sent}`);
    } catch (err) {
      setResult(err.response?.data?.error || "❌ Error al enviar campaña");
    }
  };

  return (
    <div>
      <h2>🚀 Enviar Campaña Newsletter</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, display: "grid", gap: 12 }}>
        <div>
          <label>Interest:</label>
          <select
            value={segment.interest}
            onChange={e => setSegment({ ...segment, interest: e.target.value })}
          >
            <option value="">— Todos —</option>
            <option value="figuras">Figuras</option>
            <option value="manga">Manga</option>
            <option value="accesorios">Accesorios</option>
          </select>
        </div>

        <div>
          <label>Country:</label>
          <input
            type="text"
            value={segment.country}
            onChange={e => setSegment({ ...segment, country: e.target.value })}
            placeholder="p.ej. España"
          />
        </div>

        <div>
          <label>Domain:</label>
          <input
            type="text"
            value={segment.domain}
            onChange={e => setSegment({ ...segment, domain: e.target.value })}
            placeholder="p.ej. gmail.com"
          />
        </div>

        <div>
          <label>Asunto:</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Cuerpo del mensaje:</label>
          <textarea
            rows="6"
            value={body}
            onChange={e => setBody(e.target.value)}
            required
          />
        </div>

        <button type="submit">Enviar Campaña</button>
      </form>
      {result && <p style={{ marginTop: 16 }}>{result}</p>}
    </div>
  );
}
