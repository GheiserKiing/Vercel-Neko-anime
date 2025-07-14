// File: frontend/src/pages/figuras/figuras.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar"; // Buscador con autocompletar
import FilterSort from "../../components/FilterSort"; // Filtros y ordenación
import ProductBlock from "../../components/blocks/ProductBlock";
import "./figuras.css";

export default function Figuras() {
  const [all, setAll] = useState([]); // Todos los productos de categoría figura
  const [list, setList] = useState([]); // Lista tras buscador+filtros
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data) => {
        const figs = data.filter((p) => p.category === "figura");
        setAll(figs);
        setList(figs);
      })
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  return (
    <main className="figuras">
      {/* HERO simplificado */}
      <section className="figuras__hero">
        <div className="figuras__hero-overlay">
          <h1 className="figuras__hero-title">Figuras</h1>
          <p className="figuras__hero-subtitle">
            Descubre las mejores figuras de tus personajes de anime favoritos.
          </p>
        </div>
      </section>

      {/* Buscador y Filtros */}
      <section className="figuras__controls">
        <SearchBar onSelect={(p) => navigate(`/producto/${p.id}`)} />
        <FilterSort products={all} onChange={setList} />
      </section>

      {/* Listado de figuras */}
      <section className="figuras__productos">
        <h2 className="figuras__section-title">
          Nuestros Productos de Figuras
        </h2>
        <div className="figuras__productos-grid">
          {list.length > 0 ? (
            list.map((prod) => (
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
            ))
          ) : (
            <p className="no-results">No se encontraron figuras.</p>
          )}
        </div>
      </section>
    </main>
  );
}
