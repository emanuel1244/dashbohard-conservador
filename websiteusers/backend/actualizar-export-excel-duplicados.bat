@echo off
REM Script para actualizar lambda export-excel con soporte para duplicados
REM Mantiene el layer existente, solo actualiza el código

setlocal

set LAMBDA_NAME=partido-conservador-export-excel
set LAMBDA_FILE=lambda-export-excel.js
set REGION=us-west-2

echo.
echo ========================================
echo Actualizando Lambda Export Excel
echo Agregando soporte para duplicados
echo ========================================
echo.

REM Verificar que el archivo existe
if not exist "%LAMBDA_FILE%" (
    echo Error: El archivo %LAMBDA_FILE% no existe
    exit /b 1
)

REM Crear directorio temporal
echo [1/4] Creando directorio temporal...
if exist temp-lambda rmdir /s /q temp-lambda
mkdir temp-lambda

REM Copiar archivo
echo [2/4] Copiando archivo...
copy "%LAMBDA_FILE%" temp-lambda\ >nul

REM Crear ZIP
echo [3/4] Creando ZIP...
powershell -Command "Compress-Archive -Path temp-lambda\* -DestinationPath temp-lambda.zip -Force"

REM Actualizar código (sin tocar layers ni configuración)
echo [4/4] Actualizando código de la lambda...
aws lambda update-function-code --function-name %LAMBDA_NAME% --zip-file fileb://temp-lambda.zip --region %REGION% --query "{Status: LastUpdateStatus, CodeSize: CodeSize, LastModified: LastModified}" --output json

REM Limpiar
echo.
echo Limpiando archivos temporales...
rmdir /s /q temp-lambda
del temp-lambda.zip

echo.
echo ========================================
echo Lambda actualizada exitosamente!
echo ========================================
echo.
echo La lambda ahora soporta:
echo - Exportacion de personas
echo - Exportacion de lideres
echo - Exportacion de duplicados (NUEVO)
echo.
echo Endpoint: GET /api/export/excel?type=duplicados
echo.

endlocal
