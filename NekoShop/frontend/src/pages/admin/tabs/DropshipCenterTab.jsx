// File: frontend/src/pages/admin/tabs/DropshipCenterTab.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";
import Papa from "papaparse";
import { importDropshipProducts } from "../../../services/dropshipService";
import { fetchProducts } from "../../../services/productService";

export default function DropshipCenterTab() {
  const [preview, setPreview] = useState([]);
  const [error, setError]     = useState("");
  const [msg, setMsg]         = useState("");
  const [allProds, setAllProds] = useState([]);

  // 1. Carga todos los productos locales (los que sincronizaste)
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchProducts();
        setAllProds(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // 2. Al cargar CSV para import, previsualiza
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) setError("Error al parsear CSV");
        else {
          setPreview(data);
          setError("");
        }
      }
    });
  };

  // 3. Importa filas a tu tabla products
  const handleImport = async () => {
    try {
      const res = await importDropshipProducts(preview);
      setMsg(`✅ Importados ${res.inserted} productos.`);
      setPreview([]);
      // refresca listado
      const list = await fetchProducts();
      setAllProds(list);
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  // 4. Exporta todos los productos a CSV
  const handleExport = () => {
    if (!allProds.length) return alert("No hay productos para exportar.");
    // Ajustamos el shape de cada producto al CSV esperado:
    const rows = allProds.map(p => ({
      sku: p.sku,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category_id: p.category_id || "",
      subcategory_id: p.subcategory_id || ""
    }));
    const csv = Papa.unparse(rows);
    // Crea un blob y dispara descarga
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "dropship-products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Centro de Dropshipping
      </Typography>

      <Box mb={2}>
        <Button
          variant="contained"
          onClick={handleExport}
          sx={{ mr: 2 }}
        >
          Exportar CSV de Productos
        </Button>
        <Button variant="outlined" component="label">
          Subir CSV para Importar
          <input hidden type="file" accept=".csv" onChange={handleFile} />
        </Button>
      </Box>

      {error && <Typography color="error" mt={1}>{error}</Typography>}
      {msg   && <Typography color="primary" mt={1}>{msg}</Typography>}

      {preview.length > 0 && (
        <Paper sx={{ mt:2, p:2, maxHeight:300, overflow:"auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {Object.keys(preview[0]).map(col => (
                  <TableCell key={col}><strong>{col}</strong></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {preview.map((row, i) => (
                <TableRow key={i}>
                  {Object.values(row).map((v, j) => (
                    <TableCell key={j}>{v}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box textAlign="right" mt={1}>
            <Button variant="contained" onClick={handleImport}>
              Importar ({preview.length})
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
