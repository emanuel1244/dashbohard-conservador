@echo off
echo ========================================
echo ARREGLANDO EXPORTACION - SOLUCION RAPIDA
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Instalando dependencias faltantes...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)
echo.

echo [2/5] Empaquetando lambda export-excel con dependencias...
if exist export-excel.zip del export-excel.zip
powershell -Command "Compress-Archive -Path lambda-export-excel.js, node_modules -DestinationPath export-excel.zip -Force"
echo.

echo [3/5] Desplegando lambda export-excel...
aws lambda update-function-code --function-name partido-conservador-export-excel --zip-file fileb://export-excel.zip
echo Esperando actualizacion...
timeout /t 3 /nobreak >nul
echo.

echo [4/5] Empaquetando lambda export-pdf con dependencias...
if exist export-pdf.zip del export-pdf.zip
powershell -Command "Compress-Archive -Path lambda-export-pdf.js, node_modules -DestinationPath export-pdf.zip -Force"
echo.

echo [5/5] Desplegando lambda export-pdf...
aws lambda update-function-code --function-name partido-conservador-export-pdf --zip-file fileb://export-pdf.zip
echo Esperando actualizacion...
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo COMPLETADO - Probando lambdas...
echo ========================================
echo.

echo Invocando lambda export-excel...
aws lambda invoke --function-name partido-conservador-export-excel --payload "{\"queryStringParameters\":{\"type\":\"reporte-general\"}}" response-excel.json
type response-excel.json
echo.
echo.

echo Invocando lambda export-pdf...
aws lambda invoke --function-name partido-conservador-export-pdf --payload "{\"queryStringParameters\":{\"type\":\"reporte-general\"}}" response-pdf.json
type response-pdf.json
echo.
echo.

echo ========================================
echo Si ves errores arriba, las lambdas aun tienen problemas
echo Si ves statusCode 200, las lambdas funcionan!
echo ========================================
pause
