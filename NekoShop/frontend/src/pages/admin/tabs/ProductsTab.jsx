// frontend/src/components/admin/tabs/ProductsTab.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Avatar,
  Collapse,
  TablePagination,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";

import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  fetchProductById,
} from "../../../services/productService";
import {
  fetchCategories,
  fetchSubcategories,
} from "../../../services/categoryService";

export default function ProductsTab() {
  // — Datos generales —
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcatsMap, setSubcatsMap] = useState({});

  // — Filtros y paginación —
  const [filterText, setFilterText] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // — Formulario producto —
  const [openForm, setOpenForm] = useState(false);
  const [formProd, setFormProd] = useState({
    id: null,
    sku: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    subcategory: "",
    newImages: [],
    coverIndex: 0,
    images: [],             // <-- imágenes persistidas
    cover_image_url: "",    // <-- url de portada
  });

  // — Carga inicial —
  useEffect(() => {
    loadAll();
  }, []);
  async function loadAll() {
    const cats = await fetchCategories();
    setCategories(cats);
    const map = {};
    for (let c of cats) {
      map[c.id] = await fetchSubcategories(c.id);
    }
    setSubcatsMap(map);
    const prods = await fetchProducts();
    setProducts(prods);
  }

  // — Abrir formulario (nuevo o editar) —
  const openForEdit = async (prod) => {
    if (prod) {
      // recargamos el producto completo para tener images[]
      const full = await fetchProductById(prod.id);
      setFormProd({
        id: full.id,
        sku: full.sku,
        name: full.name,
        description: full.description || "",
        price: full.price,
        stock: full.stock,
        category: full.category_id,
        subcategory: full.subcategory_id || "",
        images: full.images || [],
        cover_image_url: full.cover_image_url || "",
        newImages: [],
        coverIndex: 0,
      });
    } else {
      setFormProd({
        id: null,
        sku: "",
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        subcategory: "",
        images: [],
        cover_image_url: "",
        newImages: [],
        coverIndex: 0,
      });
    }
    setOpenForm(true);
  };

  // — Selección de ficheros nuevos —
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormProd(fp => ({ ...fp, newImages: [...fp.newImages, ...files] }));
  };
  const removeSelected = (idx) => {
    setFormProd(fp => {
      const arr = [...fp.newImages];
      arr.splice(idx, 1);
      return { ...fp, newImages: arr, coverIndex: Math.min(fp.coverIndex, arr.length - 1) };
    });
  };

  // — Guardar (create/update) producto y subir imágenes —
  const saveProduct = async () => {
    // 1) payload sin imágenes nuevas
    const payload = {
      sku: formProd.sku,
      name: formProd.name,
      description: formProd.description,
      price: parseFloat(formProd.price),
      stock: parseInt(formProd.stock, 10),
      category_id: formProd.category,
      subcategory_id: formProd.subcategory || null,
    };

    // 2) create/update
    let saved = formProd.id
      ? await updateProduct(formProd.id, payload)
      : await createProduct(payload);

    // 3) subir nuevas imágenes si hay
    if (formProd.newImages.length) {
      const fd = new FormData();
      formProd.newImages.forEach(f => fd.append("images", f));
      fd.append("cover_index", formProd.coverIndex);
      const up = await uploadProductImages(saved.id, fd);
      // up.cover_image_url, up.uploaded (URLs)
    }

    // 4) recarga el producto entero para refrescar images[] y portada
    const refreshed = await fetchProductById(saved.id);

    // 5) actualiza lista y cierra form
    setProducts(ps => ps.map(p => p.id === refreshed.id ? refreshed : p));
    setOpenForm(false);
  };

  // — Eliminar producto —
  const removeProduct = async (id) => {
    if (!window.confirm("Eliminar producto?")) return;
    await deleteProduct(id);
    setProducts(ps => ps.filter(p => p.id !== id));
  };

  // — Tabla filtrada y paginada —
  const filtered = useMemo(() =>
    products
      .filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()))
      .filter(p => !filterCat || p.category_id === filterCat)
  , [products, filterText, filterCat]);
  const displayed = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box p={2}>
      <Box mb={2} display="flex" justifyContent="space-between">
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openForEdit(null)}>
          Nuevo Producto
        </Button>
        <Box display="flex" gap={1}>
          <TextField size="small" placeholder="Buscar..." value={filterText} onChange={e => setFilterText(e.target.value)} />
          <FormControl size="small">
            <InputLabel>Categoría</InputLabel>
            <Select value={filterCat} label="Categoría" onChange={e => setFilterCat(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Collapse in={openForm}>
        <Card sx={{ mb:2, p:2 }}>
          <Typography variant="h6">{formProd.id ? "Editar Producto" : "Crear Producto"}</Typography>
          <Grid container spacing={2}>
            {["sku","name"].map(k => (
              <Grid item xs={6} key={k}>
                <TextField fullWidth label={k.toUpperCase()} value={formProd[k]} onChange={e => setFormProd(fp => ({ ...fp, [k]: e.target.value }))} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Descripción" value={formProd.description} onChange={e => setFormProd(fp => ({ ...fp, description: e.target.value }))} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="number" label="Precio" value={formProd.price} onChange={e => setFormProd(fp => ({ ...fp, price: e.target.value }))} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth type="number" label="Stock" value={formProd.stock} onChange={e => setFormProd(fp => ({ ...fp, stock: e.target.value }))} />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select value={formProd.category} label="Categoría" onChange={e => setFormProd(fp => ({ ...fp, category: e.target.value, subcategory: "" }))}>
                  {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {formProd.category && (
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Subcategoría</InputLabel>
                  <Select value={formProd.subcategory} label="Subcategoría" onChange={e => setFormProd(fp => ({ ...fp, subcategory: e.target.value }))}>
                    {subcatsMap[formProd.category].map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {/* Imágenes persistidas */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Imágenes actuales:</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {formProd.images.map((url,i) => (
                  <Avatar key={i} src={url} variant="square" sx={{ width: 80, height: 80 }} />
                ))}
              </Box>
            </Grid>
            {/* Imágenes nuevas */}
            <Grid item xs={12}>
              <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
                Subir imágenes
                <input hidden type="file" multiple accept="image/*" onChange={handleImageSelect} />
              </Button>
              <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                {formProd.newImages.map((f, i) => (
                  <Box key={i} position="relative">
                    <Avatar
                      src={URL.createObjectURL(f)}
                      variant="square"
                      sx={{
                        width: 80,
                        height: 80,
                        border: i===formProd.coverIndex ? "2px solid #1976d2" : "1px solid #ccc",
                      }}
                      onClick={() => setFormProd(fp => ({ ...fp, coverIndex: i }))}
                    />
                    <IconButton size="small" sx={{ position: "absolute", top: -5, right: -5 }} onClick={() => removeSelected(i)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={saveProduct}>Guardar</Button>
              <Button sx={{ ml:1 }} onClick={() => setOpenForm(false)}>Cancelar</Button>
            </Grid>
          </Grid>
        </Card>
      </Collapse>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {["ID","Img","SKU","Nombre","Precio","Stock","Cat","Sub","Acciones"].map(h => (
                <TableCell key={h}><b>{h}</b></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>
                  <Avatar src={p.cover_image_url} variant="square" sx={{ width: 48, height: 48 }} />
                </TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>€{p.price.toFixed(2)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>{categories.find(c=>c.id===p.category_id)?.name}</TableCell>
                <TableCell>{subcatsMap[p.category_id]?.find(s=>s.id===p.subcategory_id)?.name}</TableCell>
                <TableCell>
                  <IconButton onClick={()=>openForEdit(p)}><EditIcon /></IconButton>
                  <IconButton onClick={()=>removeProduct(p.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_,np)=>setPage(np)}
          onRowsPerPageChange={e=>{setRowsPerPage(+e.target.value); setPage(0);}}
          rowsPerPageOptions={[10,25,50]}
        />
      </TableContainer>
    </Box>
  );
}
