@echo off
echo ========================================
echo Actualizando Lambda Personas con CRUD
echo ========================================
echo.

REM Crear directorio temporal
if exist lambda-personas-temp rmdir /s /q lambda-personas-temp
mkdir lambda-personas-temp

REM Copiar archivo de la lambda
copy lambda-personas.js lambda-personas-temp\index.js

REM Copiar package.json
copy lambda-package.json lambda-personas-temp\package.json

REM Instalar dependencias
cd lambda-personas-temp
call npm install --production

REM Crear ZIP
echo.
echo Creando archivo ZIP...
powershell Compress-Archive -Path * -DestinationPath ..\lambda-personas-crud.zip -Force

cd ..

REM Actualizar Lambda en AWS
echo.
echo Actualizando Lambda en AWS...
aws lambda update-function-code ^
    --function-name PartidoConservadorPersonas ^
    --zip-file fileb://lambda-personas-crud.zip ^
    --region us-west-2

echo.
echo Esperando a que la Lambda se actualice...
timeout /t 5 /nobreak > nul

REM Limpiar archivos temporales
rmdir /s /q lambda-personas-temp
del lambda-personas-crud.zip

echo.
echo ========================================
echo Lambda actualizada exitosamente!
echo ========================================
echo.
echo Endpoints disponibles:
echo   GET    /api/personas          - Listar todas
echo   GET    /api/personas/{id}     - Obtener una
echo   POST   /api/personas          - Crear nueva
echo   PUT    /api/personas/{id}     - Actualizar
echo   DELETE /api/personas/{id}     - Eliminar
echo   PUT    /api/personas/{id}/asignar-lider - Asignar líder
echo.
pause
