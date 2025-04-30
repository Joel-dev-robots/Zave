# Script para copiar archivos de zave-finance-app a zave-android/my-app
$sourceDir = "..\zave-finance-app\src"
$targetDir = "src"

# Crear directorios necesarios si no existen
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force
}

# Copiar archivos de src
Get-ChildItem -Path $sourceDir -Recurse | ForEach-Object {
    $targetPath = $_.FullName.Replace($sourceDir, $targetDir)
    if (-not (Test-Path (Split-Path $targetPath))) {
        New-Item -ItemType Directory -Path (Split-Path $targetPath) -Force
    }
    Copy-Item -Path $_.FullName -Destination $targetPath -Force
}

Write-Host "Archivos copiados exitosamente!" 