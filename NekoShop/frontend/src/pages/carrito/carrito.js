// File: frontend/src/pages/carrito/carrito.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import "./carrito.css";

export default function Carrito() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <main className="carrito-page">
        <h1>Tu Carrito</h1>
        <p className="carrito-empty">¡Tu carrito está vacío!</p>
        <Link to="/" className="btn-volver">
          Volver al Home
        </Link>
      </main>
    );
  }

  const itemsConPrecio = cartItems.map((item) => {
    const rawPrice = item.price;
    const priceNum =
      typeof rawPrice === "string"
        ? parseFloat(rawPrice.replace(/[^0-9.-]+/g, "")) || 0
        : rawPrice || 0;
    const subtotal = priceNum * item.quantity;
    return { ...item, priceNum, subtotal };
  });

  const total = itemsConPrecio.reduce((acc, item) => acc + item.subtotal, 0);

  const handleQuantityChange = (id, e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      updateQuantity(id, val);
    }
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <main className="carrito-page">
      <h1 className="carrito-title">
        Tu Carrito
        <button
          className="link-clear"
          onClick={() => clearCart()}
          title="Vaciar todo el carrito"
        >
          Vaciar
        </button>
      </h1>

      <div className="carrito-container">
        <div className="carrito-items">
          {itemsConPrecio.map((item) => (
            <div key={item.id} className="carrito-item">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="carrito-item-img"
              />
              <div className="carrito-item-info">
                <span className="carrito-item-name">{item.name}</span>
                <span className="carrito-item-price">
                  Precio: {item.priceNum.toFixed(2)} €
                </span>
                <div className="carrito-item-qty">
                  <label htmlFor={`qty-${item.id}`}>Cantidad:</label>
                  <input
                    type="number"
                    id={`qty-${item.id}`}
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e)}
                  />
                </div>
                <span className="carrito-item-subtotal">
                  Subtotal: {item.subtotal.toFixed(2)} €
                </span>
              </div>
              <button
                className="btn-eliminar"
                onClick={() => removeFromCart(item.id)}
                title="Eliminar este producto"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <aside className="carrito-summary">
          <h2>Resumen del Pedido</h2>
          <p className="carrito-total">
            Total: <strong>{total.toFixed(2)} €</strong>
          </p>
          <button
            className="btn-checkout"
            onClick={handleProceedToCheckout}
          >
            Ir a Checkout
          </button>
        </aside>
      </div>
    </main>
  );
}
