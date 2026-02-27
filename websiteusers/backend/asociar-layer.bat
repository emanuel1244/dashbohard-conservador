@echo off
echo ========================================
echo Asociando Layer a Lambda Function
echo ========================================

set FUNCTION_NAME=partido-conservador-uploadExcel
set REGION=us-west-2

echo.
echo Leyendo ARN del Layer...
set /p LAYER_ARN=<layer-arn.txt

echo Layer ARN: %LAYER_ARN%

echo.
echo Actualizando configuración de la Lambda...
aws lambda update-function-configuration ^
  --function-name %FUNCTION_NAME% ^
  --layers %LAYER_ARN% ^
  --region %REGION%

echo.
echo Esperando a que la Lambda esté lista...
timeout /t 5 /nobreak

echo.
echo Verificando configuración...
aws lambda get-function-configuration ^
  --function-name %FUNCTION_NAME% ^
  --region %REGION% ^
  --query "Layers[*].Arn"

echo.
echo ========================================
echo Layer asociado exitosamente
echo ========================================
