// File: frontend/src/pages/PrivacyPolicy.jsx
import React from "react";

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Política de Privacidad</h1>
      <p><em>Fecha de última actualización: 2 de julio de 2025</em></p>

      <h2>1. Responsable del tratamiento</h2>
      <p><strong>Titular:</strong> NekoDrops Anime S.L.<br/>
         <strong>CIF:</strong> [●]<br/>
         <strong>Domicilio:</strong> [Dirección completa]<br/>
         <strong>Email:</strong> privacidad@nekodrops.com
      </p>

      <h2>2. Datos que recopilamos</h2>
      <ul>
        <li><strong>Datos de registro:</strong> nombre, email, contraseña cifrada.</li>
        <li><strong>Datos de pedido:</strong> dirección de envío, teléfono.</li>
        <li><strong>Cookies y analíticas:</strong> Google Analytics, preferencias.</li>
        <li><strong>Newsletter:</strong> email, país, área de interés.</li>
      </ul>

      <h2>3. Finalidades</h2>
      <ul>
        <li>Gestionar tu cuenta y pedidos.</li>
        <li>Envío de confirmaciones y notificaciones.</li>
        <li>Newsletter y ofertas segmentadas.</li>
        <li>Análisis de uso (Google Analytics).</li>
      </ul>

      <h2>4. Legitimación</h2>
      <ul>
        <li>Ejecución de contrato (pedidos).</li>
        <li>Consentimiento (newsletter, cookies).</li>
        <li>Interés legítimo (analíticas, mejora).</li>
      </ul>

      <h2>5. Destinatarios</h2>
      <p>Proveedores de hosting, envío, email y autoridades según ley.</p>

      <h2>6. Derechos</h2>
      <p>Puedes ejercer acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <a href="mailto:privacidad@nekodrops.com">privacidad@nekodrops.com</a>.</p>

      <h2>7. Conservación</h2>
      <ul>
        <li>Datos de compra: 5 años.</li>
        <li>Datos de newsletter: hasta retiro de consentimiento.</li>
        <li>Cookies: según caducidad individual.</li>
      </ul>
    </div>
  );
}
