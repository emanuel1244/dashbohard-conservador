Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Arreglando Lambda Export Excel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$FUNCTION_NAME = "partido-conservador-export-excel"
$REGION = "us-west-2"

Write-Host "`nPaso 1: Limpiando archivos anteriores..." -ForegroundColor Yellow
if (Test-Path "lambda-export-excel.zip") { Remove-Item "lambda-export-excel.zip" -Force }
if (Test-Path "temp-export-excel") { Remove-Item "temp-export-excel" -Recurse -Force }

Write-Host "`nPaso 2: Creando directorio temporal..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "temp-export-excel" -Force | Out-Null
New-Item -ItemType Directory -Path "temp-export-excel\node_modules" -Force | Out-Null

Write-Host "`nPaso 3: Copiando archivo Lambda..." -ForegroundColor Yellow
Copy-Item "lambda-export-excel.js" "temp-export-excel\" -Force

Write-Host "`nPaso 4: Copiando dependencias completas..." -ForegroundColor Yellow
$dependencies = @(
    "@aws-sdk",
    "@smithy",
    "exceljs",
    "archiver",
    "dayjs",
    "readable-stream",
    "saxes",
    "uuid",
    "compress-commons",
    "crc-32",
    "crc32-stream",
    "lazystream",
    "lodash",
    "normalize-path",
    "tar-stream",
    "zip-stream",
    "xmlchars",
    "inherits",
    "string_decoder",
    "util-deprecate",
    "safe-buffer",
    "core-util-is",
    "isarray",
    "process-nextick-args"
)

foreach ($dep in $dependencies) {
    $sourcePath = "node_modules\$dep"
    if (Test-Path $sourcePath) {
        Write-Host "  Copiando $dep..." -ForegroundColor Gray
        Copy-Item $sourcePath "temp-export-excel\node_modules\$dep" -Recurse -Force
    }
}

Write-Host "`nPaso 5: Creando ZIP..." -ForegroundColor Yellow
Set-Location "temp-export-excel"
Compress-Archive -Path * -DestinationPath "..\lambda-export-excel.zip" -Force
Set-Location ".."

Write-Host "`nPaso 6: Limpiando..." -ForegroundColor Yellow
Remove-Item "temp-export-excel" -Recurse -Force

Write-Host "`nPaso 7: Actualizando Lambda..." -ForegroundColor Yellow
aws lambda update-function-code `
    --function-name $FUNCTION_NAME `
    --zip-file fileb://lambda-export-excel.zip `
    --region $REGION

Write-Host "`nEsperando a que se complete la actualizacion..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Lambda actualizada exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nProbando endpoint:" -ForegroundColor Cyan
Write-Host "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas" -ForegroundColor White
