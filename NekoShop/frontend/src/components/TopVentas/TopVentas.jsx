// File: src/components/TopVentas/TopVentas.jsx

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../services/productService";
import "../RecientesCarousel/RecientesCarousel.css"; // estilos compartidos
import "./TopVentas.css";

export default function TopVentas({ title = "Top Ventas", count = 4 }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await fetchProducts();
        const sorted = Array.isArray(all)
          ? [...all].sort((a, b) => (b.sales || 0) - (a.sales || 0))
          : [];
        setItems(sorted.slice(0, count));
      } catch (err) {
        console.error(err);
        setError("Error cargando Top Ventas");
      } finally {
        setLoading(false);
      }
    })();
  }, [count]);

  const scrollBy = (dir) => {
    const w = trackRef.current.offsetWidth * 0.8;
    trackRef.current.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  if (loading) return <div className="RecientesCarousel__message">Cargando…</div>;
  if (error)   return <div className="RecientesCarousel__message error">{error}</div>;

  return (
    <section className="RecientesCarousel TopVentas">
      <h2 className="RecientesCarousel__title TopVentas__title">{title}</h2>
      <button className="RecientesCarousel__nav prev" onClick={() => scrollBy(-1)}>
        &lsaquo;
      </button>
      <button className="RecientesCarousel__nav next" onClick={() => scrollBy(1)}>
        &rsaquo;
      </button>
      <div className="RecientesCarousel__track" ref={trackRef}>
        {items.map((p) => {
          const raw = p.cover_image_url || (p.images && p.images[0]) || "";
          let src = raw;
          if (raw && !/^https?:\/\//.test(raw)) {
            src = (process.env.REACT_APP_API_URL || "") + raw;
          }
          return (
            <Link
              to={`/producto/${p.id}`}
              key={p.id}
              className="RecientesCarousel__card TopVentas__card"
            >
              <div className="RecientesCarousel__imgWrap TopVentas__imgWrap">
                {src ? (
                  <img src={src} alt={p.name} className="RecientesCarousel__img TopVentas__img" />
                ) : (
                  <div className="RecientesCarousel__placeholder">🐱</div>
                )}
              </div>
              <div className="RecientesCarousel__info TopVentas__info">
                <p className="RecientesCarousel__name TopVentas__name">{p.name}</p>
                <p className="RecientesCarousel__price TopVentas__price">€{p.price.toFixed(2)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
