import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchProducts } from "../../services/productService";
import "./SearchResults.css";

export default function SearchResults() {
  const [params] = useSearchParams();
  const term = params.get("search") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({ search: term });
        setResults(data);
      } catch (err) {
        console.error(err);
        setError("Error buscando productos");
      } finally {
        setLoading(false);
      }
    })();
  }, [term]);

  if (loading) return <div className="search-message">Buscando…</div>;
  if (error)   return <div className="search-message error">{error}</div>;
  if (!results.length)
    return <div className="search-message">No hay resultados para “{term}”.</div>;

  return (
    <div className="SearchResults">
      <h2>Resultados para “{term}”</h2>
      <div className="SearchResults__grid">
        {results.map((p) => {
          const img = p.imageUrl || p.cover_image || p.image_url || "";
          const src = /^https?:\/\//.test(img)
            ? img
            : `${process.env.REACT_APP_API_URL}${img}`;
          return (
            <Link key={p.id} to={`/producto/${p.id}`} className="SearchResults__card">
              <img src={src} alt={p.name} />
              <p>{p.name}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
