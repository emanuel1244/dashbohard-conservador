@echo off
echo ========================================
echo Actualizando Lambda Upload Multipart con Dependencias
echo ========================================

cd /d "%~dp0"

echo.
echo [1/4] Creando directorio temporal...
if exist temp-lambda rmdir /s /q temp-lambda
mkdir temp-lambda

echo.
echo [2/4] Copiando archivos...
copy lambda-upload-excel-multipart.js temp-lambda\
xcopy /E /I /Y node_modules temp-lambda\node_modules

echo.
echo [3/4] Creando ZIP con dependencias...
cd temp-lambda
powershell -Command "Compress-Archive -Path * -DestinationPath ../temp-lambda.zip -Force"
cd ..

echo.
echo [4/4] Actualizando función Lambda...
aws lambda update-function-code --function-name partido-conservador-uploadExcel --zip-file fileb://temp-lambda.zip --region us-west-2 --no-cli-pager

echo.
echo [5/4] Limpiando archivos temporales...
rmdir /s /q temp-lambda
del temp-lambda.zip

echo.
echo ========================================
echo Lambda actualizada correctamente
echo ========================================
echo.
echo Cambios aplicados:
echo - Envía TODOS los duplicados encontrados (no solo 10)
echo - Incluye todas las dependencias necesarias (xlsx, etc.)
echo.
pause
