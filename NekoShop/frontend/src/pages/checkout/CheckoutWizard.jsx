// File: frontend/src/pages/checkout/CheckoutWizard.jsx
import React, { useState, useMemo } from "react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import "./CheckoutWizard.css";

export default function CheckoutWizard() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Calcula total
  const total = useMemo(
    () =>
      cartItems
        .reduce((sum, p) => sum + p.price * p.quantity, 0)
        .toFixed(2),
    [cartItems]
  );

  const handleSuccess = () => {
    clearCart();
    navigate("/exito");
  };

  return (
    <div className="cw-wrapper">
      <header className="cw-header">
        <h1>Finalizar Compra</h1>
      </header>

      <section className="cw-summary">
        <h2>Tu pedido</h2>
        {cartItems.length === 0 ? (
          <p className="cw-empty">No hay productos en el carrito.</p>
        ) : (
          <ul className="cw-list">
            {cartItems.map(item => {
              // Igual que en ProductBlock: elige la fuente de imagen correcta
              const { imageUrl, cover_image, image_url } = item;
              const imgSrc = imageUrl || cover_image || image_url || "";
              return (
                <li key={item.id} className="cw-item-card">
                  <div className="cw-thumb-wrap">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="cw-thumb"
                        onError={e => (e.target.style.display = "none")}
                      />
                    ) : (
                      <div className="cw-placeholder">🐱</div>
                    )}
                  </div>
                  <div className="cw-info">
                    <span className="cw-name">{item.name}</span>
                    <span className="cw-qty">×{item.quantity}</span>
                  </div>
                  <div className="cw-price">
                    €{(item.price * item.quantity).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="cw-total">
          <span>Total</span>
          <span>€{total}</span>
        </div>
      </section>

      <section className="cw-paypal-section">
        <h2>Pagar con PayPal</h2>
        <PayPalButtons
          style={{ layout: "vertical", shape: "pill", label: "pay" }}
          createOrder={(data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: total } }],
            })
          }
          onApprove={(data, actions) =>
            actions.order
              .capture()
              .then(handleSuccess)
              .catch(() => setError("❗ Error al procesar el pago"))
          }
          onError={() => setError("❗ Error al procesar el pago")}
        />
        {error && <div className="cw-error">{error}</div>}
      </section>
    </div>
  );
}
