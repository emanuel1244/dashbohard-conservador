@echo off
echo ========================================
echo   DEPLOY A AWS LAMBDA
echo   Partido Conservador Dashboard
echo ========================================
echo.

echo Paso 1: Verificando configuracion...
aws sts get-caller-identity
if %errorlevel% neq 0 (
    echo.
    echo ERROR: AWS no esta configurado correctamente
    echo Por favor ejecuta: aws configure
    pause
    exit /b 1
)

echo.
echo Paso 2: Instalando dependencias...
call npm install

echo.
echo Paso 3: Desplegando a AWS Lambda...
call serverless deploy

echo.
echo ========================================
echo   DEPLOY COMPLETADO
echo ========================================
echo.
echo Copia la URL del endpoint que aparece arriba
echo y actualiza en:
echo partido-conservador-dashboard/src/app/components/dashboard/dashboard.component.ts
echo.
echo Ejemplo:
echo private apiUrl = 'https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api';
echo.
pause
