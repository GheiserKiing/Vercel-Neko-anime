import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import Hero from "../../components/Hero/Hero";
import RecientesCarousel from "../../components/RecientesCarousel/RecientesCarousel";
import TopVentas from "../../components/TopVentas/TopVentas";
import { getSettings } from "../../services/settingsService";
import { fetchProductById, fetchProducts } from "../../services/productService";

export default function Home() {
  const [settings, setSettings] = useState({
    heroText: "",
    heroSubtext: "",
    heroImageUrl: "",
    dailyProductId: "",
    heroPositionX: 50,
    heroPositionY: 50,
    heroScale: 100,
  });
  const [product, setProduct] = useState(null);
  const [loadingProd, setLoadingProd] = useState(true);
  const [errorProd, setErrorProd] = useState(null);
  const recientesRef = useRef();

  // Carga ajustes
  useEffect(() => {
    getSettings()
      .then((data) => {
        const s = data.siteSettings || {};
        setSettings({
          heroText:       s.heroText       || "NekoShop Otaku Hub",
          heroSubtext:    s.heroSubtext    || "Figuras, mangas y mucho más",
          heroImageUrl:   s.heroImageUrl   || "/images/hero.jpg",
          dailyProductId: s.dailyProductId || "",
          heroPositionX:  s.heroPositionX  ?? 50,
          heroPositionY:  s.heroPositionY  ?? 50,
          heroScale:      s.heroScale      ?? 100,
        });
      })
      .catch(() => {});
  }, []);

  // Carga Producto del Día
  useEffect(() => {
    async function load() {
      setLoadingProd(true);
      try {
        let p;
        if (settings.dailyProductId) {
          p = await fetchProductById(settings.dailyProductId);
        } else {
          const all = await fetchProducts();
          if (all.length) {
            const rand = all[Math.floor(Math.random() * all.length)];
            p = await fetchProductById(rand.id);
          } else {
            setErrorProd("No hay productos");
          }
        }
        setProduct(p);
      } catch {
        setErrorProd("Error cargando producto");
      } finally {
        setLoadingProd(false);
      }
    }
    load();
  }, [settings.dailyProductId]);

  // Scroll suave al carrusel
  const handleCTAClick = () => {
    if (recientesRef.current) {
      recientesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="Home">
      <Hero
        imageUrl={settings.heroImageUrl}
        title={settings.heroText}
        subtitle={settings.heroSubtext}
        posX={settings.heroPositionX}
        posY={settings.heroPositionY}
        scale={settings.heroScale}
        onCTAClick={handleCTAClick}
        height="60vh"
      />

      <section className="Home__section">
        <h2 className="SectionTitle">Producto del Día</h2>
        {loadingProd && <div className="home-message">Cargando…</div>}
        {errorProd && <div className="home-message error">{errorProd}</div>}
        {product && (
          <a href={`/producto/${product.id}`} className="Highlight">
            <div className="Highlight__frame Highlight__frame--aura Highlight__frame--fixed">
              {product.cover_image_url ? (
                <img
                  src={product.cover_image_url}
                  alt={product.name}
                  className="Highlight__img"
                />
              ) : (
                <div className="Highlight__placeholder">🐱 No image</div>
              )}
            </div>
            <div className="Highlight__info">
              <h3 className="Highlight__title">{product.name}</h3>
              <p className="Highlight__desc">{product.description}</p>
              <button className="Highlight__btn">Comprar ahora</button>
            </div>
          </a>
        )}
      </section>

      <section ref={recientesRef} className="Home__section">
        <RecientesCarousel count={6} />
      </section>

      <section className="Home__section">
        <TopVentas count={6} />
      </section>
    </div>
  );
}
