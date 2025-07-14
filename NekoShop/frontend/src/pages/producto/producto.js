// File: frontend/src/pages/producto/producto.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import ProductReview from "../../components/ProductReview";
import { fetchProductById } from "../../services/productService";
import {
  fetchCategories,
  fetchSubcategories,
} from "../../services/categoryService";
import "./producto.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function ProductoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const [producto, setProducto] = useState(null);
  const [imgs, setImgs] = useState([]);
  const [related, setRelated] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [idx, setIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductById(id)
      .then(data => {
        setProducto(data);
        setError(null);
      })
      .catch(() => setError("No se pudo cargar el producto"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!producto) return;
    fetchCategories().then(categories => {
      const cat = categories.find(c => c.id === producto.category_id);
      setCategoryName(cat ? cat.name : "");
      if (producto.subcategory_id) {
        fetchSubcategories(producto.category_id).then(subs => {
          const sub = subs.find(s => s.id === producto.subcategory_id);
          setSubcategoryName(sub ? sub.name : "");
        });
      }
    });
  }, [producto]);

  useEffect(() => {
    if (!producto) return;
    const list =
      Array.isArray(producto.images) && producto.images.length
        ? producto.images
        : producto.cover_image_url
        ? [producto.cover_image_url]
        : [];
    const normalized = list.map(src =>
      /^https?:\/\//.test(src)
        ? src
        : `${API}/uploads/${src.replace(/^\/+/, "")}`
    );
    setImgs(normalized);
    setIdx(0);
  }, [producto]);

  useEffect(() => {
    if (!producto) return;
    fetch(`${API}/api/products?category_id=${producto.category_id}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(json =>
        setRelated(json.filter(p => p.id !== producto.id).slice(0, 4))
      )
      .catch(() => setRelated([]));
  }, [producto]);

  useEffect(() => {
    setAdded(!!producto && cartItems.some(i => i.id === producto.id));
  }, [cartItems, producto]);

  if (loading) return <p className="prod-message">Cargando…</p>;
  if (error)   return <p className="prod-message error">{error}</p>;
  if (!producto) return <p className="prod-message">Producto no disponible.</p>;

  const handleAdd = () => {
    addToCart(
      { id: producto.id, name: producto.name, price: producto.price, imageUrl: imgs[0] || "" },
      cantidad
    );
  };
  const handleBuyNow = () => {
    handleAdd();
    navigate(`/checkout?product=${producto.id}&qty=${cantidad}`);
  };
  const toggleWish = () => {
    if (wishlistItems.some(i => i.id === producto.id)) removeFromWishlist(producto.id);
    else addToWishlist({ id: producto.id, name: producto.name, price: producto.price, imageUrl: imgs[0] || "" });
  };

  const slugify = text => encodeURIComponent(text.toLowerCase());

  return (
    <div className="prod-wrapper">
      <nav className="breadcrumb">
        <Link to="/">Inicio</Link>
        {categoryName && <>
          <span className="sep">/</span>
          <Link to={`/categoria/${slugify(categoryName)}`}>{categoryName}</Link>
        </>}
        {subcategoryName && <>
          <span className="sep">/</span>
          <Link to={`/categoria/${slugify(categoryName)}/${slugify(subcategoryName)}`}>{subcategoryName}</Link>
        </>}
        <span className="sep">/</span>
        <span className="current">{producto.name}</span>
      </nav>

      <div className="detail-container">
        <div className="gallery">
          <div className="thumb-strip">
            {imgs.map((u,i)=>(
              <img key={i} src={u} className={`thumb${i===idx?" active":""}`} onClick={()=>setIdx(i)} alt={`${producto.name} ${i+1}`} />
            ))}
          </div>
          <div className="main-image" onClick={()=>setShowModal(true)}>
            <img src={imgs[idx]} alt={producto.name}/>
          </div>
        </div>

        <div className="info">
          <h1 className="prod-title">{producto.name}</h1>
          <p className="price">€{producto.price.toFixed(2)}</p>
          <div className="quantity">
            <label>Cantidad:</label>
            <input type="number" min="1" value={cantidad} onChange={e=>setCantidad(Math.max(1,+e.target.value))}/>
          </div>
          <div className="actions">
            <button className="buy-now" onClick={handleBuyNow}>Comprar ahora</button>
            <button className="add-cart" onClick={handleAdd}>{added?"✓ Añadido":"Añadir al carrito"}</button>
            <button className="favorite" onClick={toggleWish}>{wishlistItems.some(i=>i.id===producto.id)?"♥ Favorito":"♡ Favorito"}</button>
          </div>
          <div className="description"><p>{producto.description}</p></div>
        </div>
      </div>

      <section className="related">
        <h2>También te puede interesar</h2>
        <div className="related-row">
          {related.map(r=>{
            const thumb = r.cover_image_url && /^https?:\/\//.test(r.cover_image_url)
              ? r.cover_image_url
              : `${API}/uploads/${r.cover_image_url?.replace(/^\/+/, "")}`;
            return (
              <Link key={r.id} to={`/producto/${r.id}`} className="rel-card">
                <img src={thumb} alt={r.name}/>
                <div className="rel-info">
                  <p className="rel-name">{r.name}</p>
                  <p className="rel-price">€{r.price.toFixed(2)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="reviews"><ProductReview productId={producto.id}/></section>

      {showModal && <div className="modal" onClick={()=>setShowModal(false)}><img src={imgs[idx]} alt={producto.name}/></div>}
    </div>
  );
}
