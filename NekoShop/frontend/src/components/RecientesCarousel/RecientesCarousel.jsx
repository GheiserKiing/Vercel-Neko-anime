// File: frontend/src/pages/home/RecientesCarousel.jsx

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../../services/productService";
import "./RecientesCarousel.css";

export default function RecientesCarousel({ title = "Nuevos en tienda", count = 11 }) {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        // → Llamar sin pasar objeto, sólo query si hace falta
        const all = await fetchProducts(); 
        const recent = Array.isArray(all) ? all.slice(-count).reverse() : [];
        setProducts(recent);
      } catch (err) {
        console.error(err);
        setError("Error cargando recientes");
      } finally {
        setLoading(false);
      }
    })();
  }, [count]);

  const scrollBy = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left: track.scrollLeft + dir * track.clientWidth,
      behavior: "smooth"
    });
  };

  if (loading) return <div className="RecientesCarousel__message">Cargando…</div>;
  if (error)   return <div className="RecientesCarousel__message error">{error}</div>;

  return (
    <section className="RecientesCarousel">
      <h2 className="RecientesCarousel__title">{title}</h2>
      <button className="RecientesCarousel__nav prev" onClick={() => scrollBy(-1)}>
        &lsaquo;
      </button>
      <button className="RecientesCarousel__nav next" onClick={() => scrollBy(1)}>
        &rsaquo;
      </button>
      <div className="RecientesCarousel__track" ref={trackRef}>
        {products.map((p) => {
          const imgs = Array.isArray(p.images) ? p.images : [];
          const first  = p.cover_image_url || imgs[0] || "";
          const second = imgs[1] || first;
          const showSecond = hoveredId === p.id;
          const src = showSecond ? second : first;

          return (
            <Link
              to={`/producto/${p.id}`}
              key={p.id}
              className="RecientesCarousel__card"
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="RecientesCarousel__imgWrap">
                {src ? (
                  <img src={src} alt={p.name} className="RecientesCarousel__img" />
                ) : (
                  <div className="RecientesCarousel__placeholder">🐱</div>
                )}
              </div>
              <div className="RecientesCarousel__info">
                <p className="RecientesCarousel__name">{p.name}</p>
                <p className="RecientesCarousel__price">€{p.price.toFixed(2)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
);
}
