// File: frontend/src/pages/CookiesPolicy.jsx
import React from "react";

export default function CookiesPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Política de Cookies</h1>
      <p><em>Fecha de última actualización: 2 de julio de 2025</em></p>

      <p>Esta web utiliza cookies para mejorar tu experiencia. A continuación detallamos:</p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tipo</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Nombre(s)</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Finalidad</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Expiración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Esenciales</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}><code>_sid, _csrf</code></td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Sesión y seguridad.</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Sesión</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Analíticas</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}><code>_ga, _gid, _gat</code></td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Google Analytics.</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>2 años / 24 h / 1 min</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Publicidad</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}><code>_fbp, IDE</code></td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Personalización de anuncios.</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>3–13 meses</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Funcionales</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}><code>cookieConsent</code></td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Guardar tu elección de cookies.</td>
            <td style={{ border: "1px solid #ddd", padding: "8px" }}>1 año</td>
          </tr>
        </tbody>
      </table>

      <h2>¿Qué son las cookies?</h2>
      <p>Pequeños archivos de texto que se almacenan en tu dispositivo para recordar preferencias, medir tráfico o personalizar anuncios.</p>

      <h2>Consentimiento</h2>
      <p>Al pulsar “Acepto” consientes su uso según esta política. Para revocarlo, haz clic en el icono de cookies y desactiva categorías.</p>

      <h2>Cómo desactivar cookies</h2>
      <ul>
        <li><strong>Chrome:</strong> Ajustes → Privacidad y seguridad → Cookies.</li>
        <li><strong>Firefox:</strong> Preferencias → Privacidad y seguridad → Cookies.</li>
        <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos de sitios.</li>
      </ul>

      <p>Más info en <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer">allaboutcookies.org</a>.</p>
    </div>
  );
}
