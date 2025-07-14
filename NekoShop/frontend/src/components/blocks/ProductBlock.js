// File: frontend/src/components/blocks/ProductBlock.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import "./ProductBlock.css";

export default function ProductBlock({ product }) {
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const [hoverSrc, setHoverSrc] = useState(null);

  if (!product) return null;

  // Imagen principal
  const defaultSrc = product.cover_image_url || "";

  // Imagen al pasar el ratón: la primera de product.images si existe
  const altSrc =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null;

  // Si no hay altSrc, no cambia en hover
  const imgSrc = hoverSrc || defaultSrc;

  const inWishlist = wishlistItems.some((item) => item.id === product.id);

  const handleAddCart = (e) => {
    e.preventDefault();
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: defaultSrc,
      },
      1
    );
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    if (inWishlist) removeFromWishlist(product.id);
    else
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: defaultSrc,
      });
  };

  return (
    <Link to={`/producto/${product.id}`} className="pg-card kawaii">
      <div
        className="pg-image-wrap kawaii-bg"
        onMouseEnter={() => altSrc && setHoverSrc(altSrc)}
        onMouseLeave={() => setHoverSrc(null)}
      >
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} className="pg-image kawaii-img" />
        ) : (
          <div className="pg-placeholder kawaii-placeholder">🐱 No image</div>
        )}
        <div className="pg-overlay kawaii-overlay">
          <button className="pg-btn kawaii-cart" onClick={handleAddCart}>
            <ShoppingCartIcon />
          </button>
          <button
            className={`pg-btn kawaii-wish ${inWishlist ? "active" : ""}`}
            onClick={handleToggleWishlist}
          >
            <FavoriteIcon />
          </button>
        </div>
      </div>
      <div className="pg-info kawaii-info">
        <h3 className="pg-title kawaii-title">{product.name}</h3>
        <p className="pg-price kawaii-price">€ {product.price.toFixed(2)}</p>
      </div>
    </Link>
);
}
