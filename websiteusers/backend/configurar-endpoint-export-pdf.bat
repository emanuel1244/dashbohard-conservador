@echo off
echo ========================================
echo Configurando Endpoint Export PDF
echo ========================================

set API_ID=t6km5ha4e3
set REGION=us-west-2
set ACCOUNT_ID=431655581275
set FUNCTION_NAME=partido-conservador-export-pdf

echo.
echo API Gateway ID: %API_ID%
echo Region: %REGION%
echo.

echo Paso 1: Obteniendo root resource ID...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/'].id" --output text') do set ROOT_ID=%%i
echo Root ID: %ROOT_ID%

echo.
echo Paso 2: Buscando recurso /api...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api'].id" --output text') do set API_RESOURCE_ID=%%i

if "%API_RESOURCE_ID%"=="" (
    echo Creando recurso /api...
    for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %ROOT_ID% --path-part api --region %REGION% --query "id" --output text') do set API_RESOURCE_ID=%%i
)
echo API Resource ID: %API_RESOURCE_ID%

echo.
echo Paso 3: Buscando recurso /api/export...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/export'].id" --output text') do set EXPORT_RESOURCE_ID=%%i

if "%EXPORT_RESOURCE_ID%"=="" (
    echo Creando recurso /api/export...
    for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %API_RESOURCE_ID% --path-part export --region %REGION% --query "id" --output text') do set EXPORT_RESOURCE_ID=%%i
)
echo Export Resource ID: %EXPORT_RESOURCE_ID%

echo.
echo Paso 4: Buscando recurso /api/export/pdf...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/export/pdf'].id" --output text') do set PDF_RESOURCE_ID=%%i

if "%PDF_RESOURCE_ID%"=="" (
    echo Creando recurso /api/export/pdf...
    for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %EXPORT_RESOURCE_ID% --path-part pdf --region %REGION% --query "id" --output text') do set PDF_RESOURCE_ID=%%i
)
echo PDF Resource ID: %PDF_RESOURCE_ID%

echo.
echo Paso 5: Configurando metodo GET...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %PDF_RESOURCE_ID% ^
    --http-method GET ^
    --authorization-type NONE ^
    --region %REGION% 2>nul

echo.
echo Paso 6: Configurando integracion con Lambda...
set LAMBDA_ARN=arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:%FUNCTION_NAME%

aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %PDF_RESOURCE_ID% ^
    --http-method GET ^
    --type AWS_PROXY ^
    --integration-http-method POST ^
    --uri arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/%LAMBDA_ARN%/invocations ^
    --region %REGION%

echo.
echo Paso 7: Configurando metodo OPTIONS para CORS...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %PDF_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --authorization-type NONE ^
    --region %REGION% 2>nul

aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %PDF_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --type MOCK ^
    --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" ^
    --region %REGION% 2>nul

aws apigateway put-integration-response ^
    --rest-api-id %API_ID% ^
    --resource-id %PDF_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --status-code 200 ^
    --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" ^
    --region %REGION% 2>nul

aws apigateway put-method-response ^
    --rest-api-id %API_ID% ^
    --resource-id %PDF_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --status-code 200 ^
    --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Origin\":true}" ^
    --region %REGION% 2>nul

echo.
echo Paso 8: Configurando binary media types...
aws apigateway update-rest-api ^
    --rest-api-id %API_ID% ^
    --patch-operations "op=add,path=/binaryMediaTypes/application~1pdf" ^
    --region %REGION% 2>nul

echo.
echo Paso 9: Desplegando cambios...
aws apigateway create-deployment ^
    --rest-api-id %API_ID% ^
    --stage-name prod ^
    --region %REGION%

echo.
echo ========================================
echo Endpoint configurado exitosamente!
echo ========================================
echo.
echo URL: https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/pdf
echo.
echo Ejemplos de uso:
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/pdf?type=reporte-general
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/pdf?type=reporte-lider^&filters={...}
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/pdf?type=certificado^&ids=[...]
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/pdf?type=listado-mesa^&filters={...}
echo.

pause
