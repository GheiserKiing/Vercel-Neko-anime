// File: frontend/src/components/SearchBar.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../services/productService";
import "./SearchBar.css";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const ref = useRef();
  const navigate = useNavigate();

  // Carga todos los productos para sugerencias
  useEffect(() => {
    (async () => {
      try {
        const all = await fetchProducts();
        setProducts(all);
      } catch (e) {
        console.error("Error cargando productos para sugerencias", e);
      }
    })();
  }, []);

  // Filtra sugerencias
  useEffect(() => {
    if (!query) return setSuggestions([]);
    const q = query.toLowerCase();
    setSuggestions(
      products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5)
    );
  }, [query, products]);

  // Cierra al click fuera
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleSelect = (p) => {
    setQuery("");
    setSuggestions([]);
    if (onSelect) {
      onSelect(p);
    } else {
      navigate({
        pathname: "/search",
        search: `?search=${encodeURIComponent(p.name)}`,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSelect({ id: null, name: query });
  };

  return (
    <form className="search-bar" ref={ref} onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Buscar producto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((p) => (
            <li key={p.id} onClick={() => handleSelect(p)}>
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </form>
);
}
