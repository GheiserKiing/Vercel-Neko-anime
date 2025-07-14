import React, { useMemo, useEffect, useRef, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import "./checkout.css";

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const paypalRef = useRef(null);
  const [error, setError] = useState(null);

  // Calcula total
  const total = useMemo(
    () =>
      cartItems
        .reduce(
          (sum, p) =>
            sum +
            (typeof p.price === "string" ? parseFloat(p.price) : p.price) *
              p.quantity,
          0
        )
        .toFixed(2),
    [cartItems]
  );

  // Render PayPal Smart Buttons (incluye Google Pay si está habilitado en tu cuenta PayPal)
  useEffect(() => {
    if (!window.paypal || !paypalRef.current) return;
    paypalRef.current.innerHTML = "";
    window.paypal
      .Buttons({
        style: { layout: "vertical" },
        createOrder: () =>
          fetch("/api/payments/paypal/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ total }),
          })
            .then((r) => r.json())
            .then((d) => d.orderID),

        onApprove: (data) =>
          fetch("/api/payments/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          })
            .then((r) => r.json())
            .then(() => {
              clearCart();
              navigate("/exito");
            }),

        onError: (err) => {
          console.error(err);
          setError("Error en PayPal");
        },
      })
      .render(paypalRef.current);
  }, [total, clearCart, navigate]);

  if (!cartItems.length) {
    return <p>Tu carrito está vacío.</p>;
  }

  return (
    <div className="checkout-page">
      <h2>Resumen del pedido</h2>
      <ul>
        {cartItems.map((p) => (
          <li key={p.id}>
            {p.name} × {p.quantity} — €{(p.price * p.quantity).toFixed(2)}
          </li>
        ))}
      </ul>
      <p>Total: €{total}</p>
      {error && <p className="error">{error}</p>}

      {/* PayPal (+ Google Pay si PayPal lo habilita) */}
      <div ref={paypalRef}></div>

      {/* Bizum manual */}
      <button
        onClick={() =>
          alert(
            "Para pagar con Bizum:\n1. Abre tu app bancaria.\n2. Escanea este QR o envía 10€ a 600123456 con concepto 'NekoShop'.\n3. Vuelve y pulsa 'Confirmar pago'."
          )
        }
      >
        Pagar con Bizum
      </button>
      <button onClick={() => navigate("/confirmar-bizum")}>
        Confirmar pago Bizum
      </button>
    </div>
  );
}
