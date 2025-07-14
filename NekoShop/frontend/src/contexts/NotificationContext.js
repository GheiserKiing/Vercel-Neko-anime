// File: frontend/src/contexts/NotificationContext.js

import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

/**
 * Provee funciones para mostrar notificaciones (toast).
 */
export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Agrega una nueva notificación
  const notify = useCallback((message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    // La notifición desaparecerá tras 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Renderizado de toasts */}
      <div className="toasts-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
