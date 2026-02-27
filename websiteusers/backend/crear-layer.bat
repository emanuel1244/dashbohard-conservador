@echo off
echo ========================================
echo Creando Lambda Layer con dependencias
echo ========================================

cd lambda-layer\nodejs

echo.
echo Instalando dependencias...
call npm install --production

echo.
echo Volviendo al directorio backend...
cd ..\..

echo.
echo Empaquetando Layer en ZIP...
powershell -Command "Compress-Archive -Path lambda-layer\* -DestinationPath lambda-layer.zip -Force"

echo.
echo ========================================
echo Layer creado exitosamente: lambda-layer.zip
echo ========================================
