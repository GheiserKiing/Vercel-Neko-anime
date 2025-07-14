// File: frontend/src/components/admin/SearchFilters.js

import React from "react";

export default function SearchFilters({
  categories,
  searchTerm,
  selectedCategory,
  minStock,
  onSearchChange,
  onCategoryChange,
  onStockChange,
}) {
  return (
    <div className="search-filters">
      {/* Campo de búsqueda por nombre o SKU */}
      <input
        type="text"
        placeholder="Buscar por nombre o SKU"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Filtro de categoría */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Filtro de stock mínimo */}
      <input
        type="number"
        min="0"
        placeholder="Stock ≥"
        value={minStock}
        onChange={(e) => onStockChange(e.target.value)}
      />
    </div>
  );
}
