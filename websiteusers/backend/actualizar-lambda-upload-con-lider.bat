@echo off
setlocal
set AWS_PAGER=

cd /d "%~dp0"

echo ========================================
echo Actualizando Lambda Upload con Logica de Lider
echo ========================================

echo.
echo 1. Creando ZIP con nueva logica...
if exist lambda-upload.zip del lambda-upload.zip

REM Copiar el archivo con la nueva lógica
copy /Y lambda-upload-excel-con-lider.js lambda-upload-excel.js

powershell -Command "Compress-Archive -Path lambda-upload-excel.js,node_modules -DestinationPath lambda-upload.zip -Force"

if not exist lambda-upload.zip (
    echo ERROR: No se pudo crear el ZIP
    pause
    exit /b 1
)

echo.
echo 2. Actualizando funcion uploadExcel...
aws lambda update-function-code ^
    --function-name partido-conservador-uploadExcel ^
    --zip-file fileb://lambda-upload.zip ^
    --region us-west-2 ^
    --no-cli-pager

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Hubo un problema actualizando la Lambda
    pause
    exit /b 1
)

echo.
echo ========================================
echo Lambda actualizada exitosamente!
echo ========================================
echo.
echo Ahora el sistema:
echo - Lee la columna "Lider" del Excel
echo - Busca el lider por cedula o nombre
echo - Asigna automaticamente las personas
echo - Actualiza contadores de lideres
echo.
pause
