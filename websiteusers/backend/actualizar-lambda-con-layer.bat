@echo off
REM Script para actualizar lambdas usando el layer de dependencias
REM Uso: actualizar-lambda-con-layer.bat <nombre-lambda> <archivo-js>

setlocal

set LAMBDA_NAME=%1
set LAMBDA_FILE=%2
set LAYER_ARN=arn:aws:lambda:us-west-2:431655581275:layer:partido-conservador-dependencies:1
set REGION=us-west-2

if "%LAMBDA_NAME%"=="" (
    echo Error: Debe especificar el nombre de la lambda
    echo Uso: %0 ^<nombre-lambda^> ^<archivo-js^>
    exit /b 1
)

if "%LAMBDA_FILE%"=="" (
    echo Error: Debe especificar el archivo JS
    echo Uso: %0 ^<nombre-lambda^> ^<archivo-js^>
    exit /b 1
)

if not exist "%LAMBDA_FILE%" (
    echo Error: El archivo %LAMBDA_FILE% no existe
    exit /b 1
)

echo.
echo ========================================
echo Actualizando Lambda: %LAMBDA_NAME%
echo Archivo: %LAMBDA_FILE%
echo ========================================
echo.

REM Crear directorio temporal
echo [1/5] Creando directorio temporal...
if exist temp-lambda rmdir /s /q temp-lambda
mkdir temp-lambda

REM Copiar archivo
echo [2/5] Copiando archivo...
copy "%LAMBDA_FILE%" temp-lambda\ >nul

REM Crear ZIP
echo [3/5] Creando ZIP...
powershell -Command "Compress-Archive -Path temp-lambda\* -DestinationPath temp-lambda.zip -Force"

REM Actualizar código
echo [4/5] Actualizando código de la lambda...
aws lambda update-function-code --function-name %LAMBDA_NAME% --zip-file fileb://temp-lambda.zip --region %REGION% --query "{Status: LastUpdateStatus, CodeSize: CodeSize}" --output json

REM Actualizar layer
echo [5/5] Configurando layer de dependencias...
timeout /t 3 /nobreak >nul
aws lambda update-function-configuration --function-name %LAMBDA_NAME% --layers %LAYER_ARN% --region %REGION% --query "{Status: LastUpdateStatus, Layers: Layers[0].Arn}" --output json

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

endlocal
