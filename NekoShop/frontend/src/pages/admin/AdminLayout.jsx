// File: frontend/src/pages/admin/AdminLayout.jsx
import React from "react";
import { AppBar, Tabs, Tab, Box, Typography } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const adminTabs = [
  { label: "Productos",             path: "products-categories" },
  { label: "Pedidos",               path: "orders" },
  { label: "Métricas",              path: "metrics" },
  { label: "Carga Masiva",          path: "bulk" },
  { label: "Dropshipping",          path: "dropship" },
  { label: "Ajustes",               path: "settings" },
  { label: "Proveedores",           path: "suppliers" },
  { label: "🔔 Alertas",            path: "alerts" },
  { label: "✉️ Mensajes",           path: "messages" },
  { label: "📧 Correos",            path: "email-logs" },
  { label: "✏️ Plantillas",         path: "email-templates" },
  { label: "📰 Newsletter",         path: "newsletter" },
  { label: "📣 Campañas",           path: "newsletter-campaign" },
];

export default function AdminLayout() {
  const navigate    = useNavigate();
  const { pathname } = useLocation();
  // el segundo segmento después de "/admin/"
  const currentTab  = pathname.split("/")[2] || "products-categories";

  const handleChange = (_e, newTab) => {
    navigate(`/admin/${newTab}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: "#2E2E2E" }}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="h6" sx={{ color: "#FFF" }}>
            NekoDrops Anime — Administrador
          </Typography>
        </Box>
        <Tabs
          value={currentTab}
          onChange={handleChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            borderTop: "1px solid #444",
            "& .MuiTab-root": { color: "#CCC" },
            "& .Mui-selected": { color: "#FFF" },
          }}
        >
          {adminTabs.map((tab) => (
            <Tab key={tab.path} label={tab.label} value={tab.path} />
          ))}
        </Tabs>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#F5F5F5" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
