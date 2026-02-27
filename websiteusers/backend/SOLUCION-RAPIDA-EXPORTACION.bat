@echo off
echo ========================================
echo SOLUCION RAPIDA - EXPORTACION
echo ========================================
echo.

echo El problema es que las Lambdas necesitan las dependencias ExcelJS y PDFKit.
echo.
echo OPCION 1: Crear un directorio con dependencias
echo.

mkdir lambda-export-temp 2>nul
cd lambda-export-temp

echo Creando package.json...
echo { "dependencies": { "exceljs": "^4.3.0", "pdfkit": "^0.13.0", "@aws-sdk/client-dynamodb": "^3.0.0", "@aws-sdk/lib-dynamodb": "^3.0.0" } } > package.json

echo.
echo Instalando dependencias (esto puede tardar un momento)...
call npm install

echo.
echo Copiando archivos Lambda...
copy ..\lambda-export-excel.js . >nul
copy ..\lambda-export-pdf.js . >nul

echo.
echo Creando ZIP para Lambda Export Excel...
powershell -Command "Compress-Archive -Path lambda-export-excel.js, node_modules -DestinationPath lambda-export-excel.zip -Force"

echo.
echo Creando ZIP para Lambda Export PDF...
powershell -Command "Compress-Archive -Path lambda-export-pdf.js, node_modules -DestinationPath lambda-export-pdf.zip -Force"

echo.
echo Desplegando Lambda Export Excel...
aws lambda update-function-code ^
    --function-name partido-conservador-export-excel ^
    --zip-file fileb://lambda-export-excel.zip ^
    --region us-west-2

echo.
echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo.
echo Desplegando Lambda Export PDF...
aws lambda update-function-code ^
    --function-name partido-conservador-export-pdf ^
    --zip-file fileb://lambda-export-pdf.zip ^
    --region us-west-2

echo.
echo Limpiando archivos temporales...
cd ..
rmdir /s /q lambda-export-temp

echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Las Lambdas han sido actualizadas con todas las dependencias.
echo.
echo PRUEBA AHORA:
echo 1. Espera 10 segundos para que AWS actualice las Lambdas
echo 2. Abre http://localhost:4200
echo 3. Ve a "Personas" y haz clic en "Exportar a Excel"
echo 4. Ve a "Personas" y haz clic en "Reporte General PDF"
echo.
echo Si aun sale error 502, ejecuta este script nuevamente.
echo.
pause
