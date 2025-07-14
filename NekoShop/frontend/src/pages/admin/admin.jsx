// @ts-nocheck
import React, { useState } from "react";
import "./admin.css";

import ProductsTab from "./tabs/ProductsTab";
import OrdersTab   from "./tabs/OrdersTab";
import MetricsTab  from "./tabs/MetricsTab";
import BulkTab     from "./tabs/BulkTab";

export default function AdminPage() {
  const [tab, setTab] = useState("productos");

  return (
    <div className="admin-wrapper-pro">
      <h1>Panel de Administración</h1>

      <div className="tabs">
        {[
          { key: "productos", label: "Productos" },
          { key: "pedidos",   label: "Pedidos" },
          { key: "metr",      label: "Métricas" },
          { key: "bulk",      label: "Carga Masiva" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tab === "productos" && <ProductsTab />}
        {tab === "pedidos"   && <OrdersTab   />}
        {tab === "metr"      && <MetricsTab  />}
        {tab === "bulk"      && <BulkTab     />}
      </div>
    </div>
  );
}
