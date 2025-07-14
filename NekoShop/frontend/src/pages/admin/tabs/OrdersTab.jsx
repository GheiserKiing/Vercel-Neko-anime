// File: frontend/src/pages/admin/tabs/OrdersTab.jsx
import React, { useState, useEffect } from "react";
import "./OrdersTab.css";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [error, setError]   = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res  = await fetch(
          `${process.env.REACT_APP_API_URL}/api/orders`
        );
        if (!res.ok) throw new Error("Error al obtener órdenes");
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.orders)
          ? data.orders
          : [];
        setOrders(list);
      } catch (e) {
        setError(e.message);
      }
    }
    fetchOrders();
  }, []);

  if (error) {
    return <p className="orders-error">{error}</p>;
  }

  return (
    <div className="orders-tab">
      <h2>Órdenes</h2>
      {orders.length === 0 ? (
        <p>No hay órdenes registradas.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.user}</td>
                <td>{new Date(o.date).toLocaleDateString()}</td>
                <td>€{o.total.toFixed(2)}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
