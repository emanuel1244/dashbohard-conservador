@echo off
echo ========================================
echo Verificando Lambda con Layer
echo ========================================

set FUNCTION_NAME=partido-conservador-uploadExcel
set REGION=us-west-2

echo.
echo Revisando logs recientes de CloudWatch...
echo (Mostrando últimos 50 mensajes de la última hora)
echo.

aws logs tail /aws/lambda/%FUNCTION_NAME% --since 1h --format short --region %REGION%

echo.
echo ========================================
echo Verificación completada
echo.
echo Si ves "Cannot find module 'xlsx'" en los logs,
echo el Layer NO está funcionando correctamente.
echo.
echo Si NO ves ese error, el Layer está funcionando bien.
echo ========================================
