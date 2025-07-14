// frontend/src/pages/manga/manga.js
import React, { useEffect, useState } from "react";
import ProductBlock from "../../components/blocks/ProductBlock";
import "./manga.css";

export default function Manga() {
  const [manga, setManga] = useState([]);

  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        // Filtrar por category === "manga"
        const soloManga = data.filter((prod) => prod.category === "manga");
        setManga(soloManga);
      })
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  return (
    <main className="manga">
      <section className="manga__hero">
        <div className="manga__hero-overlay">
          <h1 className="manga__hero-title">Manga</h1>
          <p className="manga__hero-subtitle">
            Sumérgete en las mejores historias de tus series favoritas.
          </p>
        </div>
      </section>

      <section className="manga__productos">
        <h2 className="manga__section-title">Nuestros Productos de Manga</h2>
        <div className="manga__productos-grid">
          {manga.map((prod) => (
            <ProductBlock
              key={prod.id}
              id={prod.id}
              data={{
                name: prod.name,
                description: prod.description,
                price: prod.price,
                imageUrl: prod.imageUrl,
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
