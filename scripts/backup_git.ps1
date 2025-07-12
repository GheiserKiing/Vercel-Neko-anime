# File: scripts/backup_git.ps1
<#
  Script para:
  1) Hacer commit de todos los cambios.
  2) Crear un tag con timestamp.
  3) Empujar commit + tag a GitHub.
#>

Param(
    [string]$Message = "Backup before changes"
)

# 1. Generar timestamp y nombre de tag
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$tagName   = "backup_$timestamp"

# 2. Añadir y commitear todo
git add .
git commit -m "$Message"

# 3. Crear el tag anotado
git tag -a $tagName -m "$Message on $timestamp"

# 4. Empujar commit y tag al remoto
git push origin main
git push origin $tagName

# 5. Aviso al usuario
Write-Host "✅ Commit y tag '$tagName' enviados a GitHub"
