// File: frontend/src/components/ProductDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { fetchCategories, fetchSubcategories } from '../services/categoryService';
import {
  createProduct,
  updateProduct,
  uploadProductImages,
} from '../services/productService';

export default function ProductDialog({ open, product, onClose, onSave }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]             = useState('');
  const [stock, setStock]             = useState('');
  const [categoryId, setCategoryId]   = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryId, setSubcategoryId] = useState('');
  const [categories, setCategories]   = useState([]);
  const [files, setFiles]             = useState([]);
  const [coverIndex, setCoverIndex]   = useState(0);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories(categoryId).then(setSubcategories).catch(console.error);
    } else {
      setSubcategories([]); setSubcategoryId('');
    }
  }, [categoryId]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price?.toString() || '');
      setStock(product.stock?.toString() || '');
      setCategoryId(product.category_id || '');
      setSubcategoryId(product.subcategory_id || '');
      setFiles([]);
      setCoverIndex(0);
    } else {
      setName(''); setDescription(''); setPrice(''); setStock('');
      setCategoryId(''); setSubcategoryId(''); setFiles([]);
      setCoverIndex(0);
    }
  }, [product]);

  const handleFiles = e => {
    const arr = Array.from(e.target.files);
    setFiles(arr);
    setCoverIndex(0);
  };

  const handleSave = async () => {
    if (!name.trim() || price === '') {
      alert('Nombre y precio son obligatorios');
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 0,
      category_id: categoryId || null,
      subcategory_id: subcategoryId || null,
    };
    try {
      // 1) Crear o actualizar producto
      const saved = product?.id
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);
      // 2) Si hay imágenes, subirlas y asociarlas
      if (files.length > 0) {
        await uploadProductImages(saved.id, files, coverIndex);
      }
      onSave();
    } catch (err) {
      console.error('Error guardando producto:', err);
      alert('Error guardando producto: ' + err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{product ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
      <DialogContent dividers>
        <TextField fullWidth label="Nombre" value={name}
          onChange={e => setName(e.target.value)} margin="normal" />
        <TextField fullWidth label="Descripción" multiline rows={3}
          value={description} onChange={e => setDescription(e.target.value)}
          margin="normal" />
        <TextField fullWidth label="Precio" type="number" value={price}
          onChange={e => setPrice(e.target.value)} margin="normal" />
        <TextField fullWidth label="Stock" type="number" value={stock}
          onChange={e => setStock(e.target.value)} margin="normal" />

        <FormControl fullWidth margin="normal">
          <InputLabel id="cat-label">Categoría</InputLabel>
          <Select labelId="cat-label" value={categoryId} label="Categoría"
            onChange={e => setCategoryId(e.target.value)}>
            <MenuItem value=""><em>— Seleccionar —</em></MenuItem>
            {categories.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" disabled={!categoryId}>
          <InputLabel id="subcat-label">Subcategoría</InputLabel>
          <Select labelId="subcat-label" value={subcategoryId} label="Subcategoría"
            onChange={e => setSubcategoryId(e.target.value)}>
            <MenuItem value=""><em>— Seleccionar —</em></MenuItem>
            {subcategories.map(s => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <div style={{ marginTop: 16 }}>
          <label>Imágenes (múltiples):</label>
          <input type="file" accept="image/*" multiple
            onChange={handleFiles}
            style={{ display: 'block', marginTop: 8 }} />
        </div>

        {files.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>Selecciona imagen de portada:</strong>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {files.map((file, idx) => {
                const url = URL.createObjectURL(file);
                return (
                  <label key={idx} style={{ textAlign: 'center' }}>
                    <input
                      type="radio"
                      name="cover"
                      checked={coverIndex === idx}
                      onChange={() => setCoverIndex(idx)}
                      style={{ marginBottom: 4 }}
                    />
                    <img
                      src={url}
                      alt={`preview-${idx}`}
                      style={{
                        width: 80, height: 80, objectFit: 'cover',
                        borderRadius: 8,
                        border: coverIndex === idx
                          ? '2px solid #8b004d'
                          : '1px solid #ccc'
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
