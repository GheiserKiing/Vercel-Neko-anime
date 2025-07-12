// File: scripts/install_upload_deps.ps1
<#
  Script para instalar las dependencias necesarias para subir imágenes:
  - streamifier
  - multer
  - cloudinary
#>

# 1. Moverse al backend
Push-Location "NekoShop/backend"

# 2. Instalar librerías
npm install streamifier multer cloudinary

# 3. Volver al origen
Pop-Location

Write-Host "✅ Dependencias instaladas en NekoShop/backend"
