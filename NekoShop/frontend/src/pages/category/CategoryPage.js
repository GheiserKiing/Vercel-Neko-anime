import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./CategoryPage.css";
import ProductBlock from "../../components/blocks/ProductBlock";
import {
  fetchCategories,
  fetchSubcategories,
} from "../../services/categoryService";
import { fetchProducts } from "../../services/productService";
import { getSettings } from "../../services/settingsService";
import {
  Box,
  TablePagination,
  CircularProgress,
} from "@mui/material";

export default function CategoryPage() {
  const { name, subname } = useParams();
  const [cats, setCats] = useState([]);
  const [subcats, setSubcats] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("recent");
  const [hero, setHero] = useState({ imageUrl: "", text: "" });

  // paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // 1) Carga ajustes + categorías
  useEffect(() => {
    Promise.all([getSettings(), fetchCategories()])
      .then(([settingsData, categories]) => {
        setCats(categories);
        const cat = categories.find(
          (c) => c.name.toLowerCase() === name?.toLowerCase()
        );
        if (cat && settingsData.siteSettings.categoryHeroes[cat.id]) {
          const ch = settingsData.siteSettings.categoryHeroes[cat.id];
          setHero({ imageUrl: ch.heroImageUrl, text: ch.heroText });
        } else {
          setHero({
            imageUrl: settingsData.siteSettings.heroImageUrl,
            text: settingsData.siteSettings.heroText,
          });
        }
      })
      .catch(() => {})
      .finally(() => {});
  }, [name]);

  // 2) Carga subcategorías
  useEffect(() => {
    if (!name) return;
    const cat = cats.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (!cat) return;
    fetchSubcategories(cat.id)
      .then(setSubcats)
      .catch(() => setSubcats([]));
  }, [name, cats]);

  // 3) Carga productos con filtros
  useEffect(() => {
    setLoading(true);
    const filters = {};
    if (name) {
      const cat = cats.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (cat) filters.category_id = cat.id;
    }
    if (subname) {
      const sub = subcats.find(
        (s) => s.name.toLowerCase() === subname.toLowerCase()
      );
      if (sub) filters.subcategory_id = sub.id;
    }
    filters.sort = sort;
    const qs = Object.keys(filters).length
      ? "?" + new URLSearchParams(filters).toString()
      : "";
    fetchProducts(qs)
      .then((prods) => {
        setAllProducts(prods);
        setPage(0);
      })
      .finally(() => setLoading(false));
  }, [name, subname, sort, cats, subcats]);

  // 4) Actualiza slice para paginación
  useEffect(() => {
    const start = page * rowsPerPage;
    setDisplayed(allProducts.slice(start, start + rowsPerPage));
  }, [allProducts, page, rowsPerPage]);

  if (loading)
    return (
      <div className="cp-loading">
        <CircularProgress />
      </div>
    );

  return (
    <main className="cp-page">
      <header className="cp-hero">
        <div
          className="cp-hero-bg"
          style={{ backgroundImage: `url(${hero.imageUrl})` }}
        />
        <h1 className="cp-title">
          {hero.text ||
            (name
              ? name.charAt(0).toUpperCase() + name.slice(1)
              : "Todas las categorías")}
        </h1>
      </header>

      <div className="cp-controls">
        <nav className="cp-breadcrumb">
          <Link to="/">Home</Link>
          {name && (
            <>
              {" "}
              &gt; <Link to={`/categoria/${name}`}>{name}</Link>
            </>
          )}
          {subname && (
            <>
              {" "}
              &gt; <span>{subname}</span>
            </>
          )}
        </nav>

        {subcats.length > 0 && (
          <ul className="cp-subnav">
            <li className={!subname ? "active" : ""}>
              <Link to={`/categoria/${name}`}>All</Link>
            </li>
            {subcats.map((s) => (
              <li key={s.id} className={s.name === subname ? "active" : ""}>
                <Link to={`/categoria/${name}/${s.name}`}>{s.name}</Link>
              </li>
            ))}
          </ul>
        )}

        <div className="cp-sort">
          <label>Orden:</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Más nuevos</option>
            <option value="price_asc">Precio ↑</option>
            <option value="price_desc">Precio ↓</option>
          </select>
        </div>
      </div>

      <section className="cp-grid">
        {displayed.map((p) => (
          <ProductBlock key={p.id} product={p} />
        ))}
      </section>

      <Box display="flex" justifyContent="center" mt={4}>
        <TablePagination
          component="div"
          count={allProducts.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          rowsPerPageOptions={[8, 12, 24]}
        />
      </Box>
    </main>
  );
}
