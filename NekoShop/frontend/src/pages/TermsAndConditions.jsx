// File: frontend/src/pages/TermsAndConditions.jsx
import React from "react";

export default function TermsAndConditions() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Términos y Condiciones</h1>
      <p><em>Fecha de última actualización: 2 de julio de 2025</em></p>

      <h2>1. Producto y precios</h2>
      <p>Todos los precios incluyen IVA. Nos reservamos el derecho de modificar precios y stock.</p>

      <h2>2. Proceso de pedido</h2>
      <p>El contrato se perfecciona al confirmar tu pedido por email con número y detalles.</p>

      <h2>3. Pago</h2>
      <p>Aceptamos tarjeta, PayPal y Bizum. Los datos se procesan de forma segura (SSL).</p>

      <h2>4. Entrega y envío</h2>
      <p>Trabajamos en dropshipping: el proveedor envía directamente al cliente en 5–10 días laborables. Gastos calculados en el carrito.</p>

      <h2>5. Devoluciones y cancelaciones</h2>
      <ul>
        <li>Desistimiento en 14 días sin indicar motivo.</li>
        <li>Gastos de devolución a cargo del cliente, salvo defecto de fabricación.</li>
        <li>Producto en perfecto estado y embalaje original.</li>
      </ul>

      <h2>6. Garantía</h2>
      <p>2 años conforme a la ley. Defectos de fabricación cubiertos según legislación.</p>

      <h2>7. Responsabilidad</h2>
      <p>No somos responsables de retrasos por fuerza mayor o terceros.</p>

      <h2>8. Legislación aplicable</h2>
      <p>Se rige por la ley española. Cualquier disputa se someterá a los Juzgados de [Ciudad].</p>
    </div>
  );
}
