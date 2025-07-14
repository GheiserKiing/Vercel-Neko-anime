// File: frontend/src/components/layout/footer/Footer.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { subscribeNewsletter } from "../../../services/newsletterService";
import "./Footer.css";

export default function Footer() {
  const [email, setEmail]       = useState("");
  const [country, setCountry]   = useState("");
  const [interest, setInterest] = useState("figuras");
  const [msg, setMsg]           = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await subscribeNewsletter({ email, country, interest });
      setMsg("¡Gracias por suscribirte!");
      setEmail("");
    } catch (err) {
      setMsg(err.response?.data?.error || "Error, inténtalo de nuevo");
    }
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Columna 1: Sobre Nosotros + Social */}
        <div className="footer__col">
          <h3 className="footer__title">Sobre Nosotros</h3>
          <p className="footer__text">
            NekoDrops Anime es tu tienda otaku de confianza. Traemos figuras,
            mangas y accesorios exclusivos para tu colección.
          </p>
          <div className="footer__social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              {/* SVG Facebook */}
              <svg xmlns="http://www.w3.org/2000/svg" className="footer__social-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H8v-2.88h2.5V9.5c0-2.47 1.46-3.84 3.7-3.84 1.07 0 2.18.19 2.18.19v2.4H15c-1.25 0-1.64.78-1.64 1.57v1.9h2.78l-.44 2.88H13.36V22A10 10 0 0 0 22 12"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              {/* SVG Twitter */}
              <svg xmlns="http://www.w3.org/2000/svg" className="footer__social-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.28 1.92-4.28 4.29 0 .34.04.67.11.99C7.72 8.99 4.1 7.13 1.67 4.15a4.28 4.28 0 0 0-.58 2.16c0 1.49.76 2.8 1.9 3.57a4.24 4.24 0 0 1-1.94-.54v.05c0 2.06 1.47 3.77 3.42 4.16a4.28 4.28 0 0 1-1.93.07c.54 1.69 2.1 2.92 3.95 2.96A8.59 8.59 0 0 1 2 19.54a12.1 12.1 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.19 0-.19 0-.39-.02-.58A8.7 8.7 0 0 0 22.46 6z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              {/* SVG Instagram */}
              <svg xmlns="http://www.w3.org/2000/svg" className="footer__social-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2.3c.55 0 .99.44.99.99v1.41c0 .55-.44.99-.99.99H6.99c-.55 0-.99-.44-.99-.99V5.29c0-.55.44-.99.99-.99h10zM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 2.3a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zm4.8-3.2a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="footer__col">
          <h3 className="footer__title">Enlaces</h3>
          <ul className="footer__links">
            <li><Link to="/" className="footer__link">Inicio</Link></li>
            <li><Link to="/figuras" className="footer__link">Figuras</Link></li>
            <li><Link to="/manga" className="footer__link">Manga</Link></li>
            <li><Link to="/accesorios" className="footer__link">Accesorios</Link></li>
            <li><Link to="/wishlist" className="footer__link">Wishlist</Link></li>
            <li><Link to="/carrito" className="footer__link">Carrito</Link></li>
          </ul>
        </div>

        {/* Columna 3: Newsletter */}
        <div className="footer__col">
          <h3 className="footer__title">Newsletter</h3>
          <p className="footer__text">
            Suscríbete para recibir novedades y ofertas:
          </p>
          <form className="footer__form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Tu email"
              className="footer__input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="País (opcional)"
              className="footer__input"
              value={country}
              onChange={e => setCountry(e.target.value)}
            />
            <select
              className="footer__input"
              value={interest}
              onChange={e => setInterest(e.target.value)}
            >
              <option value="figuras">Figuras</option>
              <option value="manga">Manga</option>
              <option value="accesorios">Accesorios</option>
            </select>
            <button type="submit" className="footer__button">Suscribirse</button>
          </form>
          {msg && <p className="footer__text" style={{ marginTop: 8 }}>{msg}</p>}
        </div>
      </div>

      {/* Políticas Inline */}
      <div className="footer__policies-inline">
        <Link to="/politica-privacidad"    className="footer__policy-link">Privacidad</Link>
        <Link to="/terminos-condiciones"   className="footer__policy-link">Términos</Link>
        <Link to="/cookies"                className="footer__policy-link">Cookies</Link>
      </div>

      {/* Pie de página */}
      <div className="footer__bottom">
        <hr className="footer__divider" />
        <p className="footer__copy">© {new Date().getFullYear()} NekoDrops Anime. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
