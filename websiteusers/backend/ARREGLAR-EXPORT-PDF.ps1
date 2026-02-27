Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Arreglando Lambda Export PDF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$FUNCTION_NAME = "partido-conservador-export-pdf"
$REGION = "us-west-2"

Write-Host "`nPaso 1: Limpiando archivos anteriores..." -ForegroundColor Yellow
if (Test-Path "lambda-export-pdf.zip") { Remove-Item "lambda-export-pdf.zip" -Force }
if (Test-Path "temp-export-pdf") { Remove-Item "temp-export-pdf" -Recurse -Force }

Write-Host "`nPaso 2: Creando directorio temporal..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "temp-export-pdf" -Force | Out-Null
New-Item -ItemType Directory -Path "temp-export-pdf\node_modules" -Force | Out-Null

Write-Host "`nPaso 3: Copiando archivo Lambda..." -ForegroundColor Yellow
Copy-Item "lambda-export-pdf.js" "temp-export-pdf\" -Force

Write-Host "`nPaso 4: Copiando dependencias completas..." -ForegroundColor Yellow
$dependencies = @(
    "@aws-sdk",
    "pdfkit",
    "fontkit",
    "png-js",
    "linebreak",
    "crypto-js",
    "unicode-properties",
    "unicode-trie",
    "tiny-inflate",
    "pako",
    "base64-js",
    "restructure",
    "dfa",
    "brotli"
)

foreach ($dep in $dependencies) {
    $sourcePath = "node_modules\$dep"
    if (Test-Path $sourcePath) {
        Write-Host "  Copiando $dep..." -ForegroundColor Gray
        Copy-Item $sourcePath "temp-export-pdf\node_modules\$dep" -Recurse -Force
    }
}

Write-Host "`nPaso 5: Creando ZIP..." -ForegroundColor Yellow
Set-Location "temp-export-pdf"
Compress-Archive -Path * -DestinationPath "..\lambda-export-pdf.zip" -Force
Set-Location ".."

Write-Host "`nPaso 6: Limpiando..." -ForegroundColor Yellow
Remove-Item "temp-export-pdf" -Recurse -Force

Write-Host "`nPaso 7: Actualizando Lambda..." -ForegroundColor Yellow
aws lambda update-function-code `
    --function-name $FUNCTION_NAME `
    --zip-file fileb://lambda-export-pdf.zip `
    --region $REGION

Write-Host "`nEsperando a que se complete la actualizacion..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Lambda actualizada exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nProbando endpoint:" -ForegroundColor Cyan
Write-Host "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-general" -ForegroundColor White
