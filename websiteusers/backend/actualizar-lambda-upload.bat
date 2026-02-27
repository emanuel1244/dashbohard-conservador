@echo off
echo ========================================
echo Actualizando Lambda: uploadExcel
echo ========================================
echo.

echo [1/3] Eliminando ZIP anterior...
if exist lambda-function.zip del lambda-function.zip

echo [2/3] Creando nuevo ZIP con dependencias...
powershell -Command "Compress-Archive -Path lambda-upload-excel-multipart.js,lambda-package.json,node_modules -DestinationPath lambda-function.zip -Force"

if not exist lambda-function.zip (
    echo ERROR: No se pudo crear el ZIP
    pause
    exit /b 1
)

echo [3/3] Actualizando Lambda en AWS...
aws lambda update-function-code --function-name partido-conservador-uploadExcel --zip-file fileb://lambda-function.zip --region us-west-2

echo.
echo ========================================
echo Lambda actualizada correctamente!
echo ========================================
echo.
echo Esperando 5 segundos para verificar...
timeout /t 5 /nobreak >nul

echo.
echo Verificando estado...
aws lambda get-function --function-name partido-conservador-uploadExcel --region us-west-2 --query "Configuration.[State,LastUpdateStatus]"

echo.
echo ========================================
echo Proceso completado!
echo ========================================
pause
