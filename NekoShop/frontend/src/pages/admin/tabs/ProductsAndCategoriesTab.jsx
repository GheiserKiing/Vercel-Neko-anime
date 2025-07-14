// File: frontend/src/pages/admin/tabs/ProductsAndCategoriesTab.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  Select,
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
  Popover,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Info as InfoIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from "../../../services/productService";
import {
  fetchCategories,
  fetchSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../../../services/categoryService";

export default function ProductsAndCategoriesTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcatsMap, setSubcatsMap] = useState({});
  const [filterText, setFilterText] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openProdForm, setOpenProdForm] = useState(false);
  const [formProd, setFormProd] = useState({
    id: null,
    sku: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    subcategory: "",
    existingImages: [],
    removedImages: [],
    newImages: [],
    coverIndex: 0,
  });
  const [openCatForm, setOpenCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState("");
  const [editingSub, setEditingSub] = useState(null);
  const [subName, setSubName] = useState("");
  const [subParent, setSubParent] = useState("");

  const [infoAnchor, setInfoAnchor] = useState(null);
  const [infoProd, setInfoProd] = useState(null);

  useEffect(() => {
    (async () => {
      const cats = await fetchCategories();
      setCategories(cats);
      const map = {};
      for (let c of cats) {
        map[c.id] = await fetchSubcategories(c.id);
      }
      setSubcatsMap(map);
      setProducts(await fetchProducts());
    })();
  }, []);

  const filtered = useMemo(
    () =>
      products
        .filter((p) =>
          p.name.toLowerCase().includes(filterText.toLowerCase())
        )
        .filter((p) => !filterCat || p.category_id === filterCat),
    [products, filterText, filterCat]
  );
  const displayed = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const toggleProdForm = (prod = null) => {
    if (prod) {
      // Asegurarnos de que prod.images sea un array real
      let imgs = [];
      try {
        if (Array.isArray(prod.images)) imgs = prod.images;
        else if (typeof prod.images === "string") imgs = JSON.parse(prod.images);
      } catch {
        imgs = [];
      }
      const existing = imgs.map((url) => ({
        url,
        filename: url.split("/").pop(),
      }));
      const coverIdx = existing.findIndex(
        (img) => img.url === prod.cover_image_url
      );
      setFormProd({
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        description: prod.description || "",
        price: prod.price,
        stock: prod.stock,
        category: prod.category_id,
        subcategory: prod.subcategory_id || "",
        existingImages: existing,
        removedImages: [],
        newImages: [],
        coverIndex: coverIdx >= 0 ? coverIdx : 0,
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
        existingImages: [],
        removedImages: [],
        newImages: [],
        coverIndex: 0,
      });
    }
    setOpenProdForm((o) => !o);
    setOpenCatForm(false);
  };

  const toggleCatForm = () => {
    setOpenCatForm((o) => !o);
    setOpenProdForm(false);
    setEditingCat(null);
    setEditingSub(null);
    setCatName("");
    setSubName("");
    setSubParent("");
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormProd((fp) => ({
      ...fp,
      newImages: [...fp.newImages, ...files],
    }));
  };
  const removeSelectedImage = (idx) =>
    setFormProd((fp) => {
      const imgs = [...fp.newImages];
      imgs.splice(idx, 1);
      return {
        ...fp,
        newImages: imgs,
        coverIndex: Math.min(
          fp.coverIndex,
          fp.existingImages.length + imgs.length - 1
        ),
      };
    });

  const saveProduct = async () => {
    if (!formProd.category) return alert("Selecciona una categoría.");

    const payload = {
      sku: formProd.sku,
      name: formProd.name,
      description: formProd.description,
      price: parseFloat(formProd.price),
      stock: parseInt(formProd.stock, 10),
      category_id: formProd.category,
      subcategory_id: formProd.subcategory || null,
    };

    let saved;
    try {
      if (formProd.id) {
        saved = await updateProduct(formProd.id, payload);
      } else {
        saved = await createProduct(payload);
      }
    } catch (err) {
      console.error("❌ Error guardando producto:", err);
      return alert("Error al guardar el producto. Mira la consola.");
    }

    if (formProd.newImages.length || formProd.removedImages.length) {
      const fd = new FormData();
      formProd.newImages.forEach((f) => fd.append("images", f));
      fd.append("removed", JSON.stringify(formProd.removedImages));
      fd.append("cover_index", formProd.coverIndex);

      try {
        await uploadProductImages(saved.id, fd);
      } catch (err) {
        console.error("❌ Error procesando imágenes:", err);
        return alert("Error al procesar imágenes. Mira la consola.");
      }
    }

    setOpenProdForm(false);
    setProducts(await fetchProducts());
  };

  const removeProduct = async (id) => {
    if (window.confirm("¿Eliminar producto?")) {
      await deleteProduct(id);
      setProducts(await fetchProducts());
    }
  };

  const saveCategory = async () => {
    if (!catName.trim()) return alert("Nombre requerido.");
    if (editingCat) await updateCategory(editingCat.id, { name: catName.trim() });
    else await createCategory({ name: catName.trim() });
    toggleCatForm();
    const cats = await fetchCategories();
    setCategories(cats);
    const map = {};
    for (let c of cats) map[c.id] = await fetchSubcategories(c.id);
    setSubcatsMap(map);
  };
  const editCategory = (c) => {
    setEditingCat(c);
    setCatName(c.name);
  };
  const removeCategory = async (id) => {
    if (window.confirm("¿Eliminar categoría?")) {
      await deleteCategory(id);
      const cats = await fetchCategories();
      setCategories(cats);
      const map = {};
      for (let c of cats) map[c.id] = await fetchSubcategories(c.id);
      setSubcatsMap(map);
    }
  };
  const saveSub = async () => {
    if (!subParent) return alert("Selecciona padre.");
    if (!subName.trim()) return alert("Texto requerido.");
    if (editingSub)
      await updateSubcategory(editingSub.catId, editingSub.sub.id, {
        name: subName.trim(),
      });
    else await createSubcategory(subParent, { name: subName.trim() });
    toggleCatForm();
    const cats = await fetchCategories();
    setCategories(cats);
    const map = {};
    for (let c of cats) map[c.id] = await fetchSubcategories(c.id);
    setSubcatsMap(map);
  };
  const editSubcategory = (c, s) => {
    setEditingSub({ catId: c.id, sub: s });
    setSubParent(c.id);
    setSubName(s.name);
  };
  const removeSubcategory = async (catId, subId) => {
    if (window.confirm("¿Eliminar subcategoría?")) {
      await deleteSubcategory(catId, subId);
      const map = { ...subcatsMap };
      map[catId] = await fetchSubcategories(catId);
      setSubcatsMap(map);
    }
  };

  const showInfo = (e, p) => {
    setInfoAnchor(e.currentTarget);
    setInfoProd(p);
  };
  const hideInfo = () => {
    setInfoAnchor(null);
    setInfoProd(null);
  };

  return (
    <Box p={2}>
      {/* TOOLBAR */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => toggleProdForm(null)}
          >
            Nuevo Producto
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 1 }}
            startIcon={<AddIcon />}
            onClick={toggleCatForm}
          >
            Categorías
          </Button>
        </Box>
        <Box display="flex" gap={1}>
          <TextField
            size="small"
            placeholder="Buscar..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filterCat}
              label="Categoría"
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* CATEGORY FORM */}
      <Collapse in={openCatForm}>
        <Box mb={2} p={2} bgcolor="#f0f4f8">
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label={editingCat ? "Editar Categoría" : "Nueva Categoría"}
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
            />
            <Button variant="contained" onClick={saveCategory}>
              {editingCat ? "Guardar" : "Crear"}
            </Button>
          </Box>
          <Box display="flex" gap={2} mb={2}>
            <FormControl>
              <InputLabel>Categoría Padre</InputLabel>
              <Select
                value={subParent}
                label="Categoría Padre"
                onChange={(e) => setSubParent(e.target.value)}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={editingSub ? "Editar Subcategoría" : "Nueva Subcategoría"}
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              disabled={!subParent}
            />
            <Button variant="contained" onClick={saveSub}>
              {editingSub ? "Guardar" : "Añadir"}
            </Button>
          </Box>
          <Typography variant="subtitle2" gutterBottom>
            Categorías existentes
          </Typography>
          {categories.map((c) => (
            <Box key={c.id} display="flex" alignItems="center" mb={1}>
              <Box flexGrow={1}>{c.name}</Box>
              <IconButton size="small" onClick={() => editCategory(c)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => removeCategory(c.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Typography variant="subtitle2" gutterBottom mt={2}>
            Subcategorías existentes
          </Typography>
          {Object.entries(subcatsMap)
            .flatMap(([cid, subs]) =>
              subs.map((s) => ({ cid, s }))
            )
            .map(({ cid, s }) => (
              <Box key={s.id} display="flex" alignItems="center" mb={1}>
                <Box flexGrow={1}>
                  <strong>
                    {categories.find((c) => c.id === +cid)?.name}
                  </strong>
                  : {s.name}
                </Box>
                <IconButton
                  size="small"
                  onClick={() =>
                    editSubcategory(
                      categories.find((c) => c.id === +cid),
                      s
                    )
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => removeSubcategory(+cid, s.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
        </Box>
      </Collapse>

      {/* PRODUCT FORM */}
      <Collapse in={openProdForm}>
        <Box mb={2} p={2} bgcolor="#fafafa">
          <Typography variant="h6" gutterBottom>
            {formProd.id ? "Editar Producto" : "Crear Producto"}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField
              label="SKU"
              value={formProd.sku}
              onChange={(e) =>
                setFormProd((fp) => ({ ...fp, sku: e.target.value }))
              }
            />
            <TextField
              label="Nombre"
              value={formProd.name}
              onChange={(e) =>
                setFormProd((fp) => ({ ...fp, name: e.target.value }))
              }
            />
            <TextField
              label="Descripción"
              multiline
              rows={3}
              fullWidth
              value={formProd.description}
              onChange={(e) =>
                setFormProd((fp) => ({
                  ...fp,
                  description: e.target.value,
                }))
              }
            />
            <TextField
              label="Precio €"
              type="number"
              value={formProd.price}
              onChange={(e) =>
                setFormProd((fp) => ({ ...fp, price: e.target.value }))
              }
            />
            <TextField
              label="Stock"
              type="number"
              value={formProd.stock}
              onChange={(e) =>
                setFormProd((fp) => ({ ...fp, stock: e.target.value }))
              }
            />
            <FormControl>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={formProd.category}
                label="Categoría"
                onChange={(e) =>
                  setFormProd((fp) => ({
                    ...fp,
                    category: e.target.value,
                    subcategory: "",
                  }))
                }
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Subcategoría</InputLabel>
              <Select
                value={formProd.subcategory}
                label="Subcategoría"
                disabled={!formProd.category}
                onChange={(e) =>
                  setFormProd((fp) => ({
                    ...fp,
                    subcategory: e.target.value,
                  }))
                }
              >
                {subcatsMap[formProd.category]?.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
            >
              Subir imágenes
              <input
                hidden
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
              />
            </Button>
          </Box>
          <Box display="flex" gap={2} mb={2}>
            {formProd.existingImages.map((img, idx) => (
              <Box key={idx} position="relative">
                <Avatar
                  src={img.url}
                  variant="square"
                  sx={{
                    width: 120,
                    height: 120,
                    border:
                      idx === formProd.coverIndex
                        ? "4px solid #1976d2"
                        : "2px solid #ccc",
                    opacity: idx === formProd.coverIndex ? 1 : 0.7,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setFormProd((fp) => ({ ...fp, coverIndex: idx }))
                  }
                />
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: -10, right: -10, background: "#fff" }}
                  onClick={() =>
                    setFormProd((fp) => ({
                      ...fp,
                      existingImages: fp.existingImages.filter((_, i) => i !== idx),
                      removedImages: [...fp.removedImages, img.filename],
                      coverIndex: Math.min(fp.coverIndex, fp.existingImages.length - 2),
                    }))
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            {formProd.newImages.map((file, idx) => (
              <Box key={idx} position="relative">
                <Avatar
                  src={URL.createObjectURL(file)}
                  variant="square"
                  sx={{
                    width: 120,
                    height: 120,
                    border:
                      idx + formProd.existingImages.length === formProd.coverIndex
                        ? "4px solid #1976d2"
                        : "2px solid #ccc",
                    opacity:
                      idx + formProd.existingImages.length === formProd.coverIndex ? 1 : 0.7,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setFormProd((fp) => ({
                      ...fp,
                      coverIndex: idx + fp.existingImages.length,
                    }))
                  }
                />
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: -10, right: -10, background: "#fff" }}
                  onClick={() => removeSelectedImage(idx)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Button variant="contained" onClick={saveProduct}>
            Guardar Producto
          </Button>
        </Box>
      </Collapse>

      {/* PRODUCTS TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#333" }}>
              {[
                "ID",
                "Imagen",
                "SKU",
                "Nombre",
                "Precio",
                "Stock",
                "Cat.",
                "Sub.",
                "Info",
                "Acciones",
              ].map((h) => (
                <TableCell key={h} sx={{ color: "#fff", fontWeight: "bold" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayed.map((p, idx) => (
              <TableRow
                key={p.id}
                sx={{
                  bgcolor: idx % 2 ? "#fafafa" : "#fff",
                  "&:hover": { bgcolor: "#f0f0f0" },
                }}
              >
                <TableCell>{p.id}</TableCell>
                <TableCell>
                  <Avatar
                    src={p.cover_image_url}
                    variant="square"
                    sx={{ width: 56, height: 56 }}
                  />
                </TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>€{p.price.toFixed(2)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell sx={{ bgcolor: "#fffbeb" }}>
                  {categories.find((c) => c.id === p.category_id)?.name}
                </TableCell>
                <TableCell sx={{ bgcolor: "#eefbff" }}>
                  {subcatsMap[p.category_id]?.find(
                    (s) => s.id === p.subcategory_id
                  )?.name}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={(e) => showInfo(e, p)}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => toggleProdForm(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => removeProduct(p.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>

      {/* INFO POPOVER */}
      <Popover
        open={Boolean(infoAnchor)}
        anchorEl={infoAnchor}
        onClose={hideInfo}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box p={2} maxWidth={300}>
          <Typography variant="subtitle2">Detalles del producto</Typography>
          {infoProd && (
            <>
              <Typography variant="body2">
                <strong>Creado:</strong>{" "}
                {new Date(infoProd.created_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                <strong>SKU:</strong> {infoProd.sku}
              </Typography>
              <Typography variant="body2">
                <strong>Categoría:</strong>{" "}
                {
                  categories.find((c) => c.id === infoProd.category_id)
                    ?.name
                }
              </Typography>
              {infoProd.subcategory_id && (
                <Typography variant="body2">
                  <strong>Subcat.:</strong>{" "}
                  {
                    subcatsMap[infoProd.category_id]?.find(
                      (s) => s.id === infoProd.subcategory_id
                    )?.name
                  }
                </Typography>
              )}
              {infoProd.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Desc.:</strong> {infoProd.description}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Popover>
    </Box>
  );
}
