// frontend/src/pages/exito/exito.js
import React from "react";
import { Link } from "react-router-dom";
import "./exito.css";

export default function Exito() {
  return (
    <main className="exito-page">
      <div className="exito-card">
        <h1>¡Gracias por tu compra!</h1>
        <p>
          Tu pedido ha sido procesado correctamente. En breve recibirás un
          correo con los detalles de tu compra.
        </p>
        <Link to="/" className="btn-exito-home">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
