@echo off
setlocal
set AWS_PAGER=

cd /d "%~dp0"

set API_ID=t6km5ha4e3
set REGION=us-west-2

echo ========================================
echo Creando endpoints para Personas
echo ========================================

REM Obtener el resource ID de /api/personas
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/personas'].id" --output text') do set PERSONAS_RESOURCE_ID=%%i

echo Resource ID de /api/personas: %PERSONAS_RESOURCE_ID%

REM Crear recurso {id} bajo /api/personas
echo.
echo Creando recurso /api/personas/{id}...
for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %PERSONAS_RESOURCE_ID% --path-part "{id}" --region %REGION% --query "id" --output text 2^>nul') do set PERSONA_ID_RESOURCE=%%i

if "%PERSONA_ID_RESOURCE%"=="" (
    echo Recurso ya existe, obteniendo ID...
    for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/personas/{id}'].id" --output text') do set PERSONA_ID_RESOURCE=%%i
)

echo Resource ID de /api/personas/{id}: %PERSONA_ID_RESOURCE%

REM Crear métodos PUT y DELETE para /api/personas/{id}
echo.
echo Creando método PUT para /api/personas/{id}...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %PERSONA_ID_RESOURCE% --http-method PUT --authorization-type NONE --region %REGION% --no-cli-pager 2>nul

aws apigateway put-integration --rest-api-id %API_ID% --resource-id %PERSONA_ID_RESOURCE% --http-method PUT --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:431655581275:function:partido-conservador-getPersonas/invocations" --region %REGION% --no-cli-pager

echo.
echo Creando método DELETE para /api/personas/{id}...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %PERSONA_ID_RESOURCE% --http-method DELETE --authorization-type NONE --region %REGION% --no-cli-pager 2>nul

aws apigateway put-integration --rest-api-id %API_ID% --resource-id %PERSONA_ID_RESOURCE% --http-method DELETE --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:431655581275:function:partido-conservador-getPersonas/invocations" --region %REGION% --no-cli-pager

echo.
echo Creando método OPTIONS para CORS...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %PERSONA_ID_RESOURCE% --http-method OPTIONS --authorization-type NONE --region %REGION% --no-cli-pager 2>nul

aws apigateway put-integration --rest-api-id %API_ID% --resource-id %PERSONA_ID_RESOURCE% --http-method OPTIONS --type MOCK --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" --region %REGION% --no-cli-pager

aws apigateway put-method-response --rest-api-id %API_ID% --resource-id %PERSONA_ID_RESOURCE% --http-method OPTIONS --status-code 200 --response-parameters "method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false" --region %REGION% --no-cli-pager 2>nul

aws apigateway put-integration-response --rest-api-id %API_ID% --resource-id %PERSONA_ID_RESOURCE% --http-method OPTIONS --status-code 200 --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" --region %REGION% --no-cli-pager

echo.
echo Agregando permisos de invocación...
aws lambda add-permission --function-name partido-conservador-getPersonas --statement-id apigateway-personas-put --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:431655581275:%API_ID%/*/PUT/api/personas/*" --region %REGION% --no-cli-pager 2>nul

aws lambda add-permission --function-name partido-conservador-getPersonas --statement-id apigateway-personas-delete --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:431655581275:%API_ID%/*/DELETE/api/personas/*" --region %REGION% --no-cli-pager 2>nul

echo.
echo Desplegando API...
aws apigateway create-deployment --rest-api-id %API_ID% --stage-name prod --region %REGION% --no-cli-pager

echo.
echo ========================================
echo Endpoints creados exitosamente!
echo ========================================
pause
