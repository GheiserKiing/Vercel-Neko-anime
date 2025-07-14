// File: frontend/src/pages/admin/tabs/BulkTab.jsx

import React, { useState } from "react";
import "../admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000"; // este cambio define la URL base de la API

export default function BulkTab() {
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [status, setStatus] = useState("");

  const handleBulkSelect = (e) => {
    setBulkFile(e.target.files[0]); // este cambio guarda el archivo seleccionado
    setBulkResult(null); // este cambio limpia resultados anteriores
    setStatus("");
  };

  const uploadBulk = async () => {
    if (!bulkFile) {
      setStatus("✕ Selecciona un CSV"); // este cambio avisa si no hay archivo
      return;
    }
    setStatus("Procesando CSV..."); // este cambio muestra estado de carga
    try {
      const fd = new FormData();
      fd.append("file", bulkFile); // este cambio añade el archivo al FormData

      const res = await fetch(`${API_URL}/api/products/bulk-upload`, {
        // este cambio apunta al endpoint completo
        method: "POST",
        body: fd,
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus("✕ " + (json.error || "Error en la carga")); // este cambio muestra error del servidor
      } else {
        setBulkResult(json); // este cambio guarda el resultado exitoso
        setStatus(
          `✔ Insertados: ${json.inserted}, Errores: ${json.errors.length}`,
        ); // este cambio muestra resumen
      }
    } catch (err) {
      console.error("Error al subir CSV:", err); // este cambio loguea errores de red
      setStatus("✕ Error de red al procesar CSV");
    }
  };

  return (
    <div className="bulk-tab">
      <h2>Carga Masiva (CSV)</h2>
      <p>
        Formato:{" "}
        <code>
          sku,name,price,stock,category,subcategory,description,cover_image,image_url
        </code>
      </p>{" "}
      {/* este cambio incluye campo image_url */}
      <input type="file" accept=".csv" onChange={handleBulkSelect} />
      <button onClick={uploadBulk}>Subir CSV</button>
      {status && <p className="status-pro">{status}</p>}{" "}
      {/* este cambio muestra estado o resultado */}
      {bulkResult && (
        <div className="bulk-result">
          <p>Total registros: {bulkResult.total}</p>{" "}
          {/* este cambio muestra total */}
          <p>Insertados: {bulkResult.inserted}</p>
          <p>Errores: {bulkResult.errors.length}</p>
          {bulkResult.errors.length > 0 && (
            <details>
              <summary>Ver errores</summary>
              <pre>{JSON.stringify(bulkResult.errors, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
