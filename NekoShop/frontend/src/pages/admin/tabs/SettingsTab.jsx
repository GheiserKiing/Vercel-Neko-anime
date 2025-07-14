// File: frontend/src/pages/admin/tabs/SettingsTab.jsx

import React, { useState, useEffect } from "react";
import {
  Card, CardHeader, CardContent,
  Box, Button, TextField,
  Typography, Divider
} from "@mui/material";
import {
  getSettings,
  saveSettings,
  uploadHeroImage
} from "../../../services/settingsService";
import { fetchCategories } from "../../../services/categoryService";

const defaultSettings = {
  heroText: "",
  heroSubtext: "",
  heroImageUrl: "",
  heroPositionX: 50,
  heroPositionY: 50,
  heroScale: 100,
  categoryHeroes: {}
};

export default function SettingsTab() {
  const [settings, setSettings] = useState(defaultSettings);
  const [files, setFiles] = useState({});      // { global, [catId]: File }
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Carga categorías y ajustes iniciales
    Promise.all([fetchCategories(), getSettings()])
      .then(([cats, data]) => {
        const s0 = data.siteSettings ?? data;
        const ch = { ...(s0.categoryHeroes || {}) };
        cats.forEach(cat => {
          if (!ch[cat.id]) {
            ch[cat.id] = {
              heroText: "",
              heroImageUrl: "",
              heroPositionX: 50,
              heroPositionY: 50,
              heroScale: 100
            };
          }
        });
        setCategories(cats);
        setSettings({ ...defaultSettings, ...s0, categoryHeroes: ch });
      })
      .catch(err => {
        console.error("Error inicializando ajustes:", err);
        alert("Error cargando datos iniciales");
      });
  }, []);

  const handleFile = (key, file) =>
    setFiles(prev => ({ ...prev, [key]: file }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = { ...settings };

      // Subir imagen hero global si hay nueva
      if (files.global) {
        const { url } = await uploadHeroImage(files.global);
        updated.heroImageUrl = url;
      }

      // Subir héroes de categoría
      for (const catId of Object.keys(files)) {
        if (catId === "global") continue;
        const { url } = await uploadHeroImage(files[catId]);
        updated.categoryHeroes[catId].heroImageUrl = url;
      }

      // Guardar ajustes completos
      await saveSettings({ siteSettings: updated });
      alert("Ajustes guardados correctamente");
      window.location.reload();
    } catch (err) {
      console.error("Error guardando ajustes:", err);
      alert("Error guardando ajustes: " + err.message);
      setSaving(false);
    }
  };

  if (!settings) return <div>Cargando…</div>;

  return (
    <Card>
      <CardHeader title="⚙️ Ajustes de Hero Global y Categorías" />
      <CardContent>

        {/* Hero Global */}
        <Typography variant="h6" sx={{ mt: 2 }}>Hero Global</Typography>
        <TextField
          label="Título"
          fullWidth sx={{ mt: 1 }}
          value={settings.heroText}
          onChange={e => setSettings(prev => ({ ...prev, heroText: e.target.value }))}
          disabled={saving}
        />
        <TextField
          label="Subtítulo"
          fullWidth sx={{ mt: 2 }}
          value={settings.heroSubtext}
          onChange={e => setSettings(prev => ({ ...prev, heroSubtext: e.target.value }))}
          disabled={saving}
        />
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <TextField
            label="Pos X (%)" type="number" fullWidth
            value={settings.heroPositionX}
            onChange={e => setSettings(prev => ({ ...prev, heroPositionX: Number(e.target.value) }))}
            disabled={saving}
          />
          <TextField
            label="Pos Y (%)" type="number" fullWidth
            value={settings.heroPositionY}
            onChange={e => setSettings(prev => ({ ...prev, heroPositionY: Number(e.target.value) }))}
            disabled={saving}
          />
          <TextField
            label="Escala (%)" type="number" fullWidth
            value={settings.heroScale}
            onChange={e => setSettings(prev => ({ ...prev, heroScale: Number(e.target.value) }))}
            disabled={saving}
          />
        </Box>
        <Box
          sx={{
            mt: 2, width: "100%", height: "60vh", borderRadius: 1,
            backgroundImage: `url(${files.global ? URL.createObjectURL(files.global) : settings.heroImageUrl})`,
            backgroundSize: `${settings.heroScale}%`,
            backgroundPosition: `${settings.heroPositionX}% ${settings.heroPositionY}%`,
            border: "1px solid #ccc"
          }}
        />
        <Button
          variant="outlined" component="label"
          sx={{ mt: 1, mb: 4 }} disabled={saving}
        >
          Cambiar Imagen Hero Global
          <input
            type="file" hidden accept="image/*"
            onChange={e => handleFile("global", e.target.files[0])}
          />
        </Button>

        <Divider />

        {/* Heroes por Categoría */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Heroes por Categoría</Typography>
        {categories.map(cat => {
          const ch = settings.categoryHeroes[cat.id];
          return (
            <Box key={cat.id} sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
              <Typography><strong>{cat.name}</strong></Typography>
              <TextField
                label="Texto" fullWidth sx={{ mt: 1 }}
                value={ch.heroText}
                onChange={e => {
                  const txt = e.target.value;
                  setSettings(prev => ({
                    ...prev,
                    categoryHeroes: {
                      ...prev.categoryHeroes,
                      [cat.id]: { ...ch, heroText: txt }
                    }
                  }));
                }}
                disabled={saving}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <TextField
                  label="Pos X (%)" type="number" fullWidth
                  value={ch.heroPositionX}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setSettings(prev => ({
                      ...prev,
                      categoryHeroes: {
                        ...prev.categoryHeroes,
                        [cat.id]: { ...ch, heroPositionX: v }
                      }
                    }));
                  }}
                  disabled={saving}
                />
                <TextField
                  label="Pos Y (%)" type="number" fullWidth
                  value={ch.heroPositionY}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setSettings(prev => ({
                      ...prev,
                      categoryHeroes: {
                        ...prev.categoryHeroes,
                        [cat.id]: { ...ch, heroPositionY: v }
                      }
                    }));
                  }}
                  disabled={saving}
                />
                <TextField
                  label="Escala (%)" type="number" fullWidth
                  value={ch.heroScale}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setSettings(prev => ({
                      ...prev,
                      categoryHeroes: {
                        ...prev.categoryHeroes,
                        [cat.id]: { ...ch, heroScale: v }
                      }
                    }));
                  }}
                  disabled={saving}
                />
              </Box>
              <Box
                sx={{
                  mt: 2, width: "100%", height: 200, borderRadius: 1,
                  backgroundImage: `url(${files[cat.id] ? URL.createObjectURL(files[cat.id]) : ch.heroImageUrl})`,
                  backgroundSize: `${ch.heroScale}%`,
                  backgroundPosition: `${ch.heroPositionX}% ${ch.heroPositionY}%`,
                  border: "1px solid #ccc"
                }}
              />
              <Button
                variant="outlined" component="label" sx={{ mt: 1 }} disabled={saving}
              >
                Cambiar Imagen {cat.name}
                <input
                  type="file" hidden accept="image/*"
                  onChange={e => handleFile(cat.id, e.target.files[0])}
                />
              </Button>
            </Box>
          );
        })}

        <Box textAlign="right">
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : "Guardar Todos los Heroes"}
          </Button>
        </Box>

      </CardContent>
    </Card>
  );
}
