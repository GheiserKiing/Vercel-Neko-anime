// File: frontend/src/components/ProductReview.js
import React, { useState, useEffect } from "react";
import "./ProductReview.css";

export default function ProductReview({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });

  // Cargar reseñas desde localStorage
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("reviews-" + productId) || "[]",
    );
    setReviews(stored);
  }, [productId]);

  // Manejar envío
  function handleSubmit(e) {
    e.preventDefault();
    const newRev = {
      ...form,
      timestamp: Date.now(),
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem("reviews-" + productId, JSON.stringify(updated));
    // Reset formulario
    setForm({ name: "", rating: 5, comment: "" });
  }

  // Calcular media de estrellas
  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(
        1,
      )
    : null;

  return (
    <div className="product-review">
      <h2>Valoraciones {avg && `(⭐ ${avg})`}</h2>

      <form onSubmit={handleSubmit} className="review-form">
        <input
          type="text"
          placeholder="Tu nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <select
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} estrella{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Escribe tu comentario"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          required
        />
        <button type="submit">Enviar</button>
      </form>

      <ul className="reviews-list">
        {reviews.map((r, i) => (
          <li key={i}>
            <div className="review-header">
              <strong>{r.name}</strong> –{" "}
              {new Date(r.timestamp).toLocaleDateString()}
            </div>
            <div className="review-stars">
              {"★".repeat(r.rating)} {"☆".repeat(5 - r.rating)}
            </div>
            <p>{r.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
