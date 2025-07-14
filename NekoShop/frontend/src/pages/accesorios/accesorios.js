// frontend/src/pages/accesorios/accesorios.js
import React, { useEffect, useState } from "react";
import ProductBlock from "../../components/blocks/ProductBlock";
import "./accesorios.css";

export default function Accesorios() {
  // Estado para guardar sólo productos categoría "accesorios"
  const [accesorios, setAccesorios] = useState([]);

  useEffect(() => {
    fetch("/products.json")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar products.json");
        return res.json();
      })
      .then((data) => {
        // Filtrar por category === "accesorios"
        const soloAccesorios = data.filter(
          (prod) =>
            prod.category && prod.category.toLowerCase() === "accesorios",
        );
        setAccesorios(soloAccesorios);
      })
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  return (
    <main className="accesorios">
      {/* Hero “Accesorios” */}
      <section className="accesorios__hero">
        <div className="accesorios__hero-overlay">
          <h1 className="accesorios__hero-title">Accesorios</h1>
          <p className="accesorios__hero-subtitle">
            Encuentra los mejores accesorios para tu colección otaku.
          </p>
        </div>
      </section>

      {/* Listado de accesorios */}
      <section className="accesorios__productos">
        <h2 className="accesorios__section-title">Nuestros Accesorios</h2>
        <div className="accesorios__productos-grid">
          {accesorios.map((prod) => (
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
