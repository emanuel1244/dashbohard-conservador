@echo off
setlocal
set AWS_PAGER=

cd /d "%~dp0"

echo ========================================
echo Desplegando Lambda de Autenticacion
echo ========================================

echo.
echo 1. Creando ZIP...
if exist lambda-auth.zip del lambda-auth.zip
powershell -Command "Compress-Archive -Path lambda-auth.js -DestinationPath lambda-auth.zip -Force"

if not exist lambda-auth.zip (
    echo ERROR: No se pudo crear el ZIP
    pause
    exit /b 1
)

echo.
echo 2. Creando funcion Lambda...
aws lambda create-function ^
    --function-name partido-conservador-auth ^
    --runtime nodejs18.x ^
    --role arn:aws:iam::431655581275:role/PartidoConservadorLambdaRole ^
    --handler lambda-auth.handler ^
    --zip-file fileb://lambda-auth.zip ^
    --timeout 30 ^
    --memory-size 256 ^
    --environment Variables={TABLE_NAME=PartidoConservadorPersonas} ^
    --region us-west-2 ^
    --no-cli-pager 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo Funcion ya existe, actualizando codigo...
    aws lambda update-function-code ^
        --function-name partido-conservador-auth ^
        --zip-file fileb://lambda-auth.zip ^
        --region us-west-2 ^
        --no-cli-pager
)

echo.
echo ========================================
echo Lambda desplegada exitosamente!
echo ========================================
echo.
echo Ahora ejecuta: crear-endpoints-auth.bat
echo.
pause
