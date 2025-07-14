// File: frontend/src/components/layout/header/Header.js

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext";
import { useWishlist } from "../../../contexts/WishlistContext";
import { fetchSubcategories } from "../../../services/categoryService";
import SearchBar from "../../SearchBar";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

import "./Header.css";

export default function Header({ categories: initialCategories }) {
  const { cartItems = [] } = useCart();
  const { wishlistItems = [] } = useWishlist();
  const navigate = useNavigate();

  const [categories, setCategories] = useState(initialCategories || []);
  const [subcatsMap, setSubcatsMap] = useState({});
  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;
  const isAdmin = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!initialCategories?.length) {
      fetch(`${process.env.REACT_APP_API_URL}/api/categories`)
        .then((res) => res.json())
        .then(setCategories)
        .catch((err) => console.error("Error cargando categorías", err));
    }
  }, [initialCategories]);

  useEffect(() => {
    categories.forEach((cat) => {
      fetchSubcategories(cat.id)
        .then((subs) =>
          setSubcatsMap((m) => ({ ...m, [cat.id]: subs }))
        )
        .catch((err) =>
          console.error(`Error cargando subcategorías de ${cat.name}`, err)
        );
    });
  }, [categories]);

  return (
    <header className="header">
      <div className="header__inner">
        {/* LOGO */}
        <Link to="/" className="header__logo-link">
          <div className="header__logo-text">
            <span className="header__logo-neko">Neko</span>
            <span className="header__logo-drops">
              Drops<sup className="header__logo-anime">anime</sup>
            </span>
          </div>
        </Link>

        {/* Buscador */}
        <div className="header__search">
          <SearchBar onSelect={(p) => navigate(`/producto/${p.id}`)} />
        </div>

        {/* Navegación con subcategorías */}
        <nav className="header__nav">
          <ul className="header__nav-list">
            {categories.map((cat) => (
              <li key={cat.id} className="header__nav-item">
                <Link to={`/categoria/${cat.name}`} className="header__nav-link">
                  {cat.name}
                </Link>
                {subcatsMap[cat.id]?.length > 0 && (
                  <ul className="header__subnav">
                    {subcatsMap[cat.id].map((sub) => (
                      <li key={sub.id}>
                        <Link
                          to={`/categoria/${cat.name}/${sub.name}`}
                          className="header__subnav-link"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Iconos carrito/wishlist/admin */}
        <div className="header__icons">
          <Link to="/wishlist" className="header__icon-link" aria-label="Wishlist">
            <FavoriteBorderIcon className="header__icon" />
            {wishlistCount > 0 && (
              <span className="header__badge header__badge--wishlist">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/carrito" className="header__icon-link" aria-label="Carrito">
            <ShoppingCartIcon className="header__icon" />
            {cartCount > 0 && (
              <span className="header__badge header__badge--cart">
                {cartCount}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="header__admin-link">
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
);
}
