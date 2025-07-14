// File: frontend/src/pages/admin/tabs/SuppliersTab.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  TextField,
  IconButton,
  Stack
} from "@mui/material";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SyncIcon   from "@mui/icons-material/Sync";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  syncSupplier,
  startSupplierAuth
} from "../../../services/supplierService";

export default function SuppliersTab() {
  const [list, setList] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    api_url: "",
    callbackUrl: "",
    adminUrl: "",
    config: "{}"
  });

  useEffect(() => {
    refresh();
  }, []);

  const refresh = () => {
    fetchSuppliers().then(setList).catch(console.error);
  };

  const openDialog = supplier => {
    if (supplier) {
      setEditing(supplier.id);
      setForm({
        name:       supplier.name,
        api_url:    supplier.api_url,
        callbackUrl:supplier.callbackUrl || "",
        adminUrl:   supplier.adminUrl   || "",
        config:     JSON.stringify(supplier.config || {}, null, 2)
      });
    } else {
      setEditing(null);
      setForm({
        name: "",
        api_url: "",
        callbackUrl: "",
        adminUrl: "",
        config: "{}"
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    try {
      const payload = {
        name:        form.name,
        api_url:     form.api_url,
        callbackUrl: form.callbackUrl,
        adminUrl:    form.adminUrl,
        config:      JSON.parse(form.config)
      };
      const action = editing
        ? updateSupplier(editing, payload)
        : createSupplier(payload);
      action.then(() => {
        setDialogOpen(false);
        refresh();
      });
    } catch (e) {
      alert("Config JSON inválido: " + e.message);
    }
  };

  const handleDelete = id => {
    if (window.confirm("¿Eliminar proveedor?")) {
      deleteSupplier(id).then(refresh);
    }
  };

  const handleSync = id => {
    syncSupplier(id)
      .then(count => alert(`✅ Sincronizados ${count} productos.`))
      .catch(err => alert("❌ Error: " + err.message))
      .finally(refresh);
  };

  const handleAuth = id => {
    // Redirige al endpoint de backend en puerto 4000
    window.location.href = startSupplierAuth(id);
  };

  return (
    <Box p={2}>
      <Box mb={2} textAlign="right">
        <Button variant="contained" onClick={() => openDialog(null)}>
          Nuevo Proveedor
        </Button>
      </Box>

      <Stack spacing={2}>
        {list.map(s => (
          <Paper
            key={s.id}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <Box>
              <Typography variant="h6">{s.name}</Typography>
              <Typography variant="body2">
                API URL: {s.api_url}
              </Typography>
              <Typography variant="body2">
                Callback: {s.callbackUrl}
              </Typography>
            </Box>
            <Box>
              <IconButton
                onClick={() => handleAuth(s.id)}
                title="Autorizar OAuth"
              >
                <SyncIcon color="primary" />
              </IconButton>
              <IconButton
                onClick={() => handleSync(s.id)}
                title="Sincronizar catálogo"
              >
                <SyncIcon />
              </IconButton>
              <IconButton
                onClick={() => openDialog(s)}
                title="Editar"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(s.id)}
                title="Eliminar"
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editing ? "Editar Proveedor" : "Nuevo Proveedor"}
        </DialogTitle>
        <Box p={2} display="flex" flexDirection="column" gap={2} width={400}>
          <TextField
            label="Nombre"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="API URL"
            value={form.api_url}
            onChange={e => setForm(f => ({ ...f, api_url: e.target.value }))}
          />
          <TextField
            label="Callback URL (HTTPS)"
            value={form.callbackUrl}
            onChange={e => setForm(f => ({ ...f, callbackUrl: e.target.value }))}
          />
          <TextField
            label="Admin URL"
            value={form.adminUrl}
            onChange={e => setForm(f => ({ ...f, adminUrl: e.target.value }))}
          />
          <TextField
            label="Config (JSON)"
            value={form.config}
            multiline
            rows={4}
            onChange={e => setForm(f => ({ ...f, config: e.target.value }))}
          />
          <Box textAlign="right">
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{ ml: 1 }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
);
}
