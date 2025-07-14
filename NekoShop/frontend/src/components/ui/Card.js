// File: frontend/src/components/ui/Card.js
import React from "react";
import { Link } from "react-router-dom";
import "./Card.css";

export default function Card({ to, title, img, price, badge, highlight }) {
  return (
    <Link to={to} className={`card ${highlight ? "card--highlight" : ""}`}>
      {badge && <span className="card__badge">{badge}</span>}
      <div className="card__image-wrapper">
        <img src={img} alt={title} className="card__image" />
      </div>
      <div className="card__info">
        <p className="card__title">{title}</p>
        {price != null && <p className="card__price">{price} €</p>}
      </div>
    </Link>
  );
}
