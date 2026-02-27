@echo off
echo ========================================
echo ARREGLANDO EXPORTACION - CORS Y ERROR 502
echo ========================================
echo.

echo [1/5] Instalando dependencias de ExcelJS y PDFKit...
cd lambda-export-packages
if not exist "package.json" (
    echo Creando package.json...
    echo { "dependencies": { "exceljs": "^4.3.0", "pdfkit": "^0.13.0" } } > package.json
)
call npm install
cd ..

echo.
echo [2/5] Empaquetando Lambda Export Excel...
if exist lambda-export-excel.zip del lambda-export-excel.zip
powershell -Command "Compress-Archive -Path lambda-export-excel.js, lambda-export-packages\node_modules -DestinationPath lambda-export-excel.zip -Force"

echo.
echo [3/5] Empaquetando Lambda Export PDF...
if exist lambda-export-pdf.zip del lambda-export-pdf.zip
powershell -Command "Compress-Archive -Path lambda-export-pdf.js, lambda-export-packages\node_modules -DestinationPath lambda-export-pdf.zip -Force"

echo.
echo [4/5] Desplegando Lambda Export Excel...
aws lambda update-function-code ^
    --function-name partido-conservador-export-excel ^
    --zip-file fileb://lambda-export-excel.zip ^
    --region us-west-2

echo.
echo [5/5] Desplegando Lambda Export PDF...
aws lambda update-function-code ^
    --function-name partido-conservador-export-pdf ^
    --zip-file fileb://lambda-export-pdf.zip ^
    --region us-west-2

echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo.
echo Las Lambdas han sido actualizadas con las dependencias necesarias.
echo.
echo PRUEBA AHORA:
echo 1. Abre http://localhost:4200
echo 2. Ve a "Personas"
echo 3. Haz clic en "Exportar a Excel"
echo.
pause
