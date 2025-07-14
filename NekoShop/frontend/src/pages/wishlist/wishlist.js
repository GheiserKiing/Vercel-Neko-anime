// File: frontend/src/pages/wishlist/Wishlist.jsx

import React from "react";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import "./wishlist.css";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!wishlistItems.length) {
    return (
      <div className="wishlist-empty">
        <p>¡Tu lista de favoritos está vacía!</p>
        <p>Empieza a descubrir productos neko 🐇🐇</p>
        <Link to="/" className="btn-back">Ver productos</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h2 className="wishlist-title">Tus favoritos neko 🐇🐇</h2>
      <div className="wishlist-grid">
        {wishlistItems.map((item) => {
          const priceNum = typeof item.price === "string"
            ? parseFloat(item.price)
            : item.price;
          const img = item.imageUrl || item.cover_image_url || item.image_url || "";
          const src = /^https?:\/\//.test(img)
            ? img
            : `${process.env.REACT_APP_API_URL}${img}`;

          return (
            <div key={item.id} className="wishlist-card">
              <Link to={`/producto/${item.id}`} className="wishlist-link">
                <div className="wishlist-img-wrap">
                  <img src={src} alt={item.name} className="wishlist-img" />
                </div>
                <div className="wishlist-info">
                  <p className="wishlist-name">{item.name}</p>
                  <p className="wishlist-price">
                    €{isNaN(priceNum) ? "0.00" : priceNum.toFixed(2)}
                  </p>
                </div>
              </Link>
              <div className="wishlist-actions">
                <button
                  className="wishlist-btn add-cart"
                  onClick={() =>
                    addToCart(
                      { id: item.id, name: item.name, price: priceNum, imageUrl: src },
                      1
                    )
                  }
                >
                  <ShoppingCartIcon fontSize="small" /> Añadir
                </button>
                <button
                  className="wishlist-btn remove"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <DeleteIcon fontSize="small" /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
