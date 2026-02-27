@echo off
echo ========================================
echo Creando endpoint POST /api/personas
echo ========================================
echo.

REM Variables
set API_ID=t6km5ha4e3
set REGION=us-west-2
set RESOURCE_ID=
set LAMBDA_ARN=arn:aws:lambda:us-west-2:YOUR_ACCOUNT_ID:function:PartidoConservadorPersonas

REM Obtener el resource ID de /personas
echo Obteniendo resource ID...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/personas'].id" --output text') do set RESOURCE_ID=%%i

if "%RESOURCE_ID%"=="" (
    echo Error: No se encontro el recurso /api/personas
    pause
    exit /b 1
)

echo Resource ID: %RESOURCE_ID%
echo.

REM Crear método POST
echo Creando metodo POST...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %RESOURCE_ID% ^
    --http-method POST ^
    --authorization-type NONE ^
    --region %REGION%

REM Configurar integración con Lambda
echo Configurando integracion con Lambda...
aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %RESOURCE_ID% ^
    --http-method POST ^
    --type AWS_PROXY ^
    --integration-http-method POST ^
    --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/%LAMBDA_ARN%/invocations" ^
    --region %REGION%

REM Configurar respuesta del método
echo Configurando respuesta del metodo...
aws apigateway put-method-response ^
    --rest-api-id %API_ID% ^
    --resource-id %RESOURCE_ID% ^
    --http-method POST ^
    --status-code 201 ^
    --response-parameters "method.response.header.Access-Control-Allow-Origin=false" ^
    --region %REGION%

REM Configurar CORS para POST
echo Configurando CORS...
aws apigateway update-integration-response ^
    --rest-api-id %API_ID% ^
    --resource-id %RESOURCE_ID% ^
    --http-method POST ^
    --status-code 201 ^
    --patch-operations "op=add,path=/responseParameters/method.response.header.Access-Control-Allow-Origin,value='*'" ^
    --region %REGION%

REM Dar permisos a API Gateway para invocar Lambda
echo Dando permisos a API Gateway...
aws lambda add-permission ^
    --function-name PartidoConservadorPersonas ^
    --statement-id apigateway-post-personas ^
    --action lambda:InvokeFunction ^
    --principal apigateway.amazonaws.com ^
    --source-arn "arn:aws:execute-api:%REGION%:YOUR_ACCOUNT_ID:%API_ID%/*/POST/api/personas" ^
    --region %REGION%

REM Desplegar cambios
echo.
echo Desplegando cambios...
aws apigateway create-deployment ^
    --rest-api-id %API_ID% ^
    --stage-name prod ^
    --region %REGION%

echo.
echo ========================================
echo Endpoint POST creado exitosamente!
echo ========================================
echo.
echo URL: https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas
echo Metodo: POST
echo.
pause
