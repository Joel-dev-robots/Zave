# Script para copiar archivos de zave-finance-app a zave-android/my-app
$sourceDir = "zave-finance-app"
$targetDir = "zave-android/my-app"

# Crear directorios necesarios
$directories = @(
    "src/components",
    "src/styles",
    "src/services",
    "src/assets"
)

foreach ($dir in $directories) {
    if (-not (Test-Path "$targetDir/$dir")) {
        New-Item -ItemType Directory -Path "$targetDir/$dir" -Force
    }
}

# Copiar archivos principales
$mainFiles = @(
    "src/index.css",
    "src/App.jsx",
    "src/main.jsx"
)

foreach ($file in $mainFiles) {
    if (Test-Path "$sourceDir/$file") {
        Copy-Item -Path "$sourceDir/$file" -Destination "$targetDir/$file" -Force
    }
}

# Copiar componentes
if (Test-Path "$sourceDir/src/components") {
    Get-ChildItem -Path "$sourceDir/src/components" -Recurse | ForEach-Object {
        $targetPath = $_.FullName.Replace($sourceDir, $targetDir)
        if (-not (Test-Path (Split-Path $targetPath))) {
            New-Item -ItemType Directory -Path (Split-Path $targetPath) -Force
        }
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
    }
}

# Copiar estilos
if (Test-Path "$sourceDir/src/styles") {
    Get-ChildItem -Path "$sourceDir/src/styles" -Recurse | ForEach-Object {
        $targetPath = $_.FullName.Replace($sourceDir, $targetDir)
        if (-not (Test-Path (Split-Path $targetPath))) {
            New-Item -ItemType Directory -Path (Split-Path $targetPath) -Force
        }
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
    }
}

# Copiar servicios
if (Test-Path "$sourceDir/src/services") {
    Get-ChildItem -Path "$sourceDir/src/services" -Recurse | ForEach-Object {
        $targetPath = $_.FullName.Replace($sourceDir, $targetDir)
        if (-not (Test-Path (Split-Path $targetPath))) {
            New-Item -ItemType Directory -Path (Split-Path $targetPath) -Force
        }
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
    }
}

# Copiar assets
if (Test-Path "$sourceDir/src/assets") {
    Get-ChildItem -Path "$sourceDir/src/assets" -Recurse | ForEach-Object {
        $targetPath = $_.FullName.Replace($sourceDir, $targetDir)
        if (-not (Test-Path (Split-Path $targetPath))) {
            New-Item -ItemType Directory -Path (Split-Path $targetPath) -Force
        }
        Copy-Item -Path $_.FullName -Destination $targetPath -Force
    }
}

# Copiar archivos de configuración
$configFiles = @(
    "tailwind.config.js",
    "postcss.config.js",
    "vite.config.js",
    "index.html"
)

foreach ($file in $configFiles) {
    if (Test-Path "$sourceDir/$file") {
        Copy-Item -Path "$sourceDir/$file" -Destination "$targetDir/" -Force
    }
}

Write-Host "Archivos copiados exitosamente!"
Write-Host "Por favor, ejecuta los siguientes comandos manualmente:"
Write-Host "1. cd zave-android/my-app"
Write-Host "2. npm install"
Write-Host "3. npm run build"
Write-Host "4. npx cap sync"
Write-Host "5. npx cap open android" 