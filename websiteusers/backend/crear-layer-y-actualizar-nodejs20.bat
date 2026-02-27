@echo off
echo ========================================
echo Creando Lambda Layer y Actualizando a Node.js 20
echo ========================================

cd /d "%~dp0"

echo.
echo [1/6] Creando directorio para el layer con estructura correcta...
if exist nodejs rmdir /s /q nodejs
mkdir nodejs\nodejs

echo.
echo [2/6] Copiando node_modules al layer (estructura: nodejs/nodejs/node_modules)...
xcopy /E /I /Y node_modules nodejs\nodejs\node_modules

echo.
echo [3/6] Creando ZIP del layer...
cd nodejs
powershell -Command "Compress-Archive -Path nodejs -DestinationPath ../layer.zip -Force"
cd ..

echo.
echo [4/6] Publicando Lambda Layer...
aws lambda publish-layer-version ^
    --layer-name partido-conservador-dependencies ^
    --description "Dependencias para lambdas del Partido Conservador (xlsx, AWS SDK v3, etc.)" ^
    --zip-file fileb://layer.zip ^
    --compatible-runtimes nodejs20.x nodejs18.x ^
    --region us-west-2 ^
    --no-cli-pager > layer-output.json

echo.
echo [5/6] Obteniendo ARN del layer...
for /f "tokens=*" %%a in ('powershell -Command "(Get-Content layer-output.json | ConvertFrom-Json).LayerVersionArn"') do set LAYER_ARN=%%a
echo Layer ARN: %LAYER_ARN%

echo.
echo [6/6] Actualizando Lambda a Node.js 20 con el layer...

REM Crear ZIP solo con el código (sin node_modules)
if exist temp-code rmdir /s /q temp-code
mkdir temp-code
copy lambda-upload-excel-multipart.js temp-code\
cd temp-code
powershell -Command "Compress-Archive -Path * -DestinationPath ../code.zip -Force"
cd ..

REM Actualizar runtime a nodejs20.x
aws lambda update-function-configuration ^
    --function-name partido-conservador-uploadExcel ^
    --runtime nodejs20.x ^
    --layers %LAYER_ARN% ^
    --region us-west-2 ^
    --no-cli-pager

echo Esperando a que la configuracion se actualice...
timeout /t 5 /nobreak >nul

REM Actualizar código
aws lambda update-function-code ^
    --function-name partido-conservador-uploadExcel ^
    --zip-file fileb://code.zip ^
    --region us-west-2 ^
    --no-cli-pager

echo.
echo [7/6] Limpiando archivos temporales...
rmdir /s /q nodejs
rmdir /s /q temp-code
del layer.zip
del code.zip
del layer-output.json

echo.
echo ========================================
echo Lambda actualizada correctamente
echo ========================================
echo.
echo Cambios aplicados:
echo - Runtime actualizado a Node.js 20
echo - Dependencias movidas a Lambda Layer
echo - Codigo optimizado (solo 1 archivo)
echo - Layer ARN: %LAYER_ARN%
echo.
pause
