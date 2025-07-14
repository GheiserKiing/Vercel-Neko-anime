import React from "react";
import { Link } from "react-router-dom";
import "./ProductoDelDia.css";

export default function ProductoDelDia({ product }) {
  const { id, name, description, cover_image, image_url } = product;
  let src = cover_image || image_url || "";
  if (src && !/^https?:\/\//.test(src)) {
    src = (process.env.REACT_APP_API_URL || "") + src;
  }

  return (
    <section className="PDd">
      <h2 className="PDd__title">Producto del Día</h2>
      <Link to={`/producto/${id}`} className="PDd__card">
        <div className="PDd__imgWrap">
          {src ? (
            <img src={src} alt={name} className="PDd__img" />
          ) : (
            <div className="PDd__placeholder">🐱 No image</div>
          )}
        </div>
        <div className="PDd__info">
          <h3 className="PDd__name">{name}</h3>
          <p className="PDd__desc">{description}</p>
          <button className="PDd__btn">Comprar ahora</button>
        </div>
      </Link>
    </section>
  );
}
