@echo off
echo ========================================
echo   VERIFICAR CONFIGURACION AWS
echo ========================================
echo.

echo Verificando AWS CLI...
aws --version
echo.

echo Verificando credenciales...
aws sts get-caller-identity
echo.

echo Verificando Serverless...
serverless --version
echo.

echo ========================================
echo   VERIFICACION COMPLETA
echo ========================================
pause
