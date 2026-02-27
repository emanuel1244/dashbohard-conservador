@echo off
echo ========================================
echo REDEPLOY COMPLETO - SOLUCION DEFINITIVA
echo ========================================
echo.
echo Este script va a:
echo 1. Eliminar el stack actual
echo 2. Redesplegar todo desde cero con CORS
echo 3. Configurar API Gateway correctamente
echo.
pause

cd /d "%~dp0"

echo.
echo ========================================
echo PASO 1: Eliminando stack actual
echo ========================================
aws cloudformation delete-stack --stack-name partido-conservador-stack --region us-west-2

echo.
echo Esperando a que se elimine el stack (esto puede tomar 2-3 minutos)...
aws cloudformation wait stack-delete-complete --stack-name partido-conservador-stack --region us-west-2

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo NOTA: Si el stack no existia, continuamos...
)

echo.
echo ========================================
echo PASO 2: Construyendo aplicacion
echo ========================================
sam build

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo construir la aplicacion
    pause
    exit /b 1
)

echo.
echo ========================================
echo PASO 3: Desplegando stack completo
echo ========================================
sam deploy ^
    --stack-name partido-conservador-stack ^
    --region us-west-2 ^
    --capabilities CAPABILITY_IAM ^
    --resolve-s3 ^
    --no-confirm-changeset

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo desplegar
    pause
    exit /b 1
)

echo.
echo ========================================
echo PASO 4: Obteniendo URL de la API
echo ========================================
aws cloudformation describe-stacks ^
    --stack-name partido-conservador-stack ^
    --region us-west-2 ^
    --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" ^
    --output text > api-url.txt

set /p API_URL=<api-url.txt
echo.
echo ========================================
echo DEPLOYMENT EXITOSO!
echo ========================================
echo.
echo URL de tu API: %API_URL%
echo.
echo IMPORTANTE: Actualiza esta URL en tu frontend:
echo partido-conservador-dashboard/src/environments/environment.ts
echo.
echo Cambia apiUrl a: %API_URL%
echo.
pause
