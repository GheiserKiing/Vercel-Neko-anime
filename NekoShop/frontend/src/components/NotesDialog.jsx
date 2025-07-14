// File: frontend/src/components/NotesDialog.jsx

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";

export default function NotesDialog({ open, initialNotes, onSave, onClose }) {
  const [notes, setNotes] = useState(initialNotes || "");

  const handleSave = () => {
    onSave(notes);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Notas Internas</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
