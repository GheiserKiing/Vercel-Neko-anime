// File: frontend/src/components/FilterSort.js
import React from "react";
import "./FilterSort.css";

export default function FilterSort({
  subcats,
  selectedSubcat,
  onSubcatChange,
  sortOption,
  onSortChange,
}) {
  return (
    <div className="filter-sort-container">
      <div className="filter-group">
        <label htmlFor="subcat">Serie:</label>
        <select
          id="subcat"
          value={selectedSubcat}
          onChange={(e) => onSubcatChange(e.target.value)}
        >
          {subcats.map((sc) => (
            <option key={sc} value={sc}>
              {sc === "todas"
                ? "Todas"
                : sc
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="sort">Ordenar:</label>
        <select
          id="sort"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="none">Por defecto</option>
          <option value="precio-asc">Precio ↑</option>
          <option value="precio-desc">Precio ↓</option>
        </select>
      </div>
    </div>
  );
}
