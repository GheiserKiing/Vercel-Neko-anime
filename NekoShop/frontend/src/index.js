// File: frontend/src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

// Importa el provider de PayPal
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Configuración del SDK de PayPal
const paypalOptions = {
  "client-id": "AYJS4eskD1Omrob0NRegj1MSCDdKJukB8L98wmNiWYE5T7Wg4hGDjN4thijOmk_rcPeq3n-YTy6UO5ak",
  currency: "EUR",
  components: "buttons,funding-eligibility"
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // Se quita React.StrictMode para evitar el doble montaje
  <PayPalScriptProvider options={paypalOptions}>
    <App />
  </PayPalScriptProvider>
);

reportWebVitals();
