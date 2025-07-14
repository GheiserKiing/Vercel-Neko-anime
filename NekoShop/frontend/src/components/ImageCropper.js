// File: frontend/src/components/ImageCropper.js

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Slider, Button } from "@mui/material";
import getCroppedImg from "./cropUtils"; // función utilitaria que crearemos

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteInternal = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="cropper-container">
      <div className="cropper-wrapper">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
        />
      </div>
      <div className="controls">
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(_, v) => setZoom(v)}
        />
        <Button variant="contained" onClick={handleCrop}>
          Recortar y Subir
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
