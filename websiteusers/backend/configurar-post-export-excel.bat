@echo off
echo ========================================
echo Configurando POST para Export Excel
echo ========================================

set API_ID=t6km5ha4e3
set REGION=us-west-2
set LAMBDA_ARN=arn:aws:lambda:us-west-2:431655581275:function:partido-conservador-export-excel

echo.
echo API ID: %API_ID%
echo.

REM Obtener el resource ID de /api/export/excel
echo Buscando recurso /api/export/excel...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path==`/api/export/excel`].id" --output text') do set RESOURCE_ID=%%i

if "%RESOURCE_ID%"=="" (
    echo ERROR: No se encontró el recurso /api/export/excel
    pause
    exit /b 1
)

echo Resource ID: %RESOURCE_ID%
echo.

REM Verificar si ya existe el método POST
echo Verificando si existe método POST...
aws apigateway get-method --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method POST --region %REGION% >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo El método POST ya existe
    echo.
    echo Actualizando integración...
    goto UPDATE_INTEGRATION
) else (
    echo Creando método POST...
    goto CREATE_METHOD
)

:CREATE_METHOD
REM Crear método POST
aws apigateway put-method --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method POST --authorization-type NONE --region %REGION%

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo crear el método POST
    pause
    exit /b 1
)

echo Método POST creado correctamente
echo.

:UPDATE_INTEGRATION
REM Crear/actualizar integración con Lambda
echo Configurando integración con Lambda...
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method POST --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/%LAMBDA_ARN%/invocations" --region %REGION%

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo configurar la integración
    pause
    exit /b 1
)

echo Integración configurada correctamente
echo.

REM Dar permisos a API Gateway para invocar la Lambda
echo Configurando permisos...
aws lambda add-permission --function-name partido-conservador-export-excel --statement-id apigateway-post-export-excel --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:431655581275:%API_ID%/*/POST/api/export/excel" --region %REGION% 2>nul

echo.
echo Desplegando cambios...
aws apigateway create-deployment --rest-api-id %API_ID% --stage-name prod --region %REGION%

echo.
echo ========================================
echo Configuración completada
echo ========================================
echo.
echo Endpoint POST disponible:
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/excel
echo.
pause
