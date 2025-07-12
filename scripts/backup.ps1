# File: scripts/backup.ps1
<#
  Script para crear un ZIP de todo el proyecto.
  - Usa la ruta del propio script como base.
  - Crea la carpeta backups/ si no existe.
  - Genera backup_YYYYMMDD_HHMMSS.zip dentro de backups/.
#>

# 1. Detectar carpeta raíz del proyecto (donde está este script)
$ScriptDir   = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$SourcePath  = $ScriptDir
$BackupDir   = Join-Path $SourcePath 'backups'

# 2. Asegurarse de que existe backups/
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# 3. Generar nombre con fecha y hora
$timestamp   = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupFile  = Join-Path $BackupDir "backup_$timestamp.zip"

# 4. Comprimir TODO el proyecto
Compress-Archive -Path (Join-Path $SourcePath '*') -DestinationPath $backupFile -Force

# 5. Mostrar ruta al ZIP generado
Write-Host "✅ Backup creado en: $backupFile"
