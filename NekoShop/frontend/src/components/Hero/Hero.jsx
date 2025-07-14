// File: frontend/src/components/Hero/Hero.jsx

import React from "react";
import "./Hero.css";

export default function Hero({
  imageUrl = "/images/hero.jpg",
  title = "",
  subtitle = "",
  posX = 50,
  posY = 50,
  scale = 100,
  onCTAClick,
  height = "60vh"
}) {
  return (
    <section className="Hero" style={{ height }}>
      <div
        className="Hero__bg"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `${posX}% ${posY}%`,
          backgroundSize: `${scale}%`
        }}
      />
      <div className="Hero__content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {onCTAClick && (
          <button className="Hero__btn" onClick={onCTAClick}>
            Últimos Recientes
          </button>
        )}
      </div>
    </section>
  );
}
