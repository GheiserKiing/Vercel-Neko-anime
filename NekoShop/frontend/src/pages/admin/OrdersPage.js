// File: frontend/src/pages/admin/OrdersPage.js

import React, { useEffect, useState, useRef } from "react";
import "./OrdersPage.css";
import {
  fetchOrders,
  exportOrders,
  updateOrderStatus,
  deleteOrder,
} from "./ordersService";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast"; // this change for toast notifications

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]); // lista de pedidos
  const [loading, setLoading] = useState(true); // indicador de carga
  const [error, setError] = useState(null); // mensaje de error
  const [page, setPage] = useState(1); // página actual
  const [limit] = useState(10); // elementos por página
  const [statusFilter, setStatusFilter] = useState(""); // filtro por estado
  const [searchTerm, setSearchTerm] = useState(""); // búsqueda por cliente/ID
  const [highlightIds, setHighlightIds] = useState([]); // IDs de pedidos a resaltar (nuevos y actualizados)
  const socketRef = useRef(null); // referencia a la conexión
  const audioRef = useRef(new Audio("/ping.mp3")); // this change loads ping sound

  // Carga pedidos desde la API
  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchOrders({
        page,
        limit,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      const list = Array.isArray(resp.data)
        ? resp.data
        : Array.isArray(resp)
          ? resp
          : [];
      setOrders(list);
    } catch (e) {
      console.error("Error en loadOrders:", e);
      setError("No se pudieron cargar los pedidos");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  // Conexión a Socket.IO + polling fallback + sonido + toast + orderUpdated
  useEffect(() => {
    // Socket.IO
    const socket = io(API_URL, {
      transports: ["polling", "websocket"], // this change forces polling then WS
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO conectado con id:", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("Error conexión Socket.IO:", err);
    });
    socket.on("disconnect", (reason) => {
      console.log("Socket.IO desconectado:", reason);
    });

    // Nuevo pedido
    socket.on("newOrder", (newOrder) => {
      console.log("Evento newOrder recibido:", newOrder);
      audioRef.current.play(); // play sound
      toast.success(`🎉 Nuevo pedido de ${newOrder.customer_name}`); // show toast
      setOrders((prev) => [newOrder, ...prev]); // añade al inicio
      setHighlightIds((prev) => [...prev, newOrder.id]); // marca para resaltar
      // Quitar resaltado tras 5s
      setTimeout(() => {
        setHighlightIds((prev) => prev.filter((id) => id !== newOrder.id));
      }, 5000);
    });

    // Pedido actualizado
    socket.on("orderUpdated", (updatedOrder) => {
      console.log("Evento orderUpdated recibido:", updatedOrder);
      audioRef.current.play(); // play sound
      toast(`🔄 Pedido ${updatedOrder.id} ahora está ${updatedOrder.status}`); // show toast
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
      ); // actualizar lista
      setHighlightIds((prev) => [...prev, updatedOrder.id]); // marca para resaltar
      // Quitar resaltado tras 5s
      setTimeout(() => {
        setHighlightIds((prev) => prev.filter((id) => id !== updatedOrder.id));
      }, 5000);
    });

    loadOrders(); // carga inicial

    // Polling cada 15 segundos como fallback
    const interval = setInterval(loadOrders, 15000); // this change sets polling
    return () => {
      clearInterval(interval); // limpiar polling
      socket.disconnect(); // desconectar socket
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  // Recarga cuando cambian filtros, búsqueda o página
  useEffect(() => {
    loadOrders();
  }, [page, statusFilter, searchTerm]);

  // Handlers de UI
  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await exportOrders({
        status: statusFilter,
        search: searchTerm,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders_export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error exportando:", e);
      setError("Error exportando pedidos");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      // loadOrders(); // opcional, la actualización vendrá por socket
    } catch (e) {
      console.error("Error actualizando estado:", e);
      setError("Error al actualizar estado");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este pedido?")) return;
    try {
      await deleteOrder(id);
      loadOrders();
    } catch (e) {
      console.error("Error eliminando pedido:", e);
      setError("Error al eliminar el pedido");
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (orders.length >= limit) setPage(page + 1);
  };

  // Renderizado
  if (loading) return <p className="orders-loading">Cargando pedidos…</p>;
  if (error) return <p className="orders-error">{error}</p>;

  return (
    <>
      <Toaster /> {/* this change adds toast container */}
      <div className="orders-page">
        <h2>📦 Gestión de Pedidos</h2>

        <div className="orders-controls">
          <input
            type="text"
            placeholder="Buscar por cliente o ID"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="procesando">Procesando</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
          </select>
          <button onClick={handleExport}>📥 Exportar CSV</button>
        </div>

        {orders.length === 0 ? (
          <p>No hay pedidos aún.</p>
        ) : (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className={highlightIds.includes(o.id) ? "new-order" : ""}
                  >
                    <td>{o.id}</td>
                    <td>{o.customer_name}</td>
                    <td>{o.total.toFixed(2)}€</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) =>
                          handleStatusChange(o.id, e.target.value)
                        }
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="procesando">Procesando</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                      </select>
                    </td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleDelete(o.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-controls">
              <button onClick={handlePrevPage} disabled={page === 1}>
                ← Anterior
              </button>
              <span>Página {page}</span>
              <button onClick={handleNextPage} disabled={orders.length < limit}>
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
