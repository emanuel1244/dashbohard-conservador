@echo off
setlocal
set AWS_PAGER=

cd /d "%~dp0"

set API_ID=t6km5ha4e3
set REGION=us-west-2

echo ========================================
echo Creando endpoints de Autenticacion
echo ========================================

REM Obtener el resource ID de /api
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api'].id" --output text') do set API_RESOURCE_ID=%%i

echo Resource ID de /api: %API_RESOURCE_ID%

REM Crear recurso /auth
echo.
echo Creando recurso /api/auth...
for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %API_RESOURCE_ID% --path-part "auth" --region %REGION% --query "id" --output text 2^>nul') do set AUTH_RESOURCE=%%i

if "%AUTH_RESOURCE%"=="" (
    echo Recurso ya existe, obteniendo ID...
    for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/auth'].id" --output text') do set AUTH_RESOURCE=%%i
)

echo Resource ID de /api/auth: %AUTH_RESOURCE%

REM Crear recurso /auth/login
echo.
echo Creando recurso /api/auth/login...
for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %AUTH_RESOURCE% --path-part "login" --region %REGION% --query "id" --output text 2^>nul') do set LOGIN_RESOURCE=%%i

if "%LOGIN_RESOURCE%"=="" (
    for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/auth/login'].id" --output text') do set LOGIN_RESOURCE=%%i
)

echo Resource ID de /api/auth/login: %LOGIN_RESOURCE%

REM Crear metodo POST para /auth/login
echo.
echo Creando metodo POST para /api/auth/login...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %LOGIN_RESOURCE% --http-method POST --authorization-type NONE --region %REGION% --no-cli-pager 2>nul

aws apigateway put-integration --rest-api-id %API_ID% --resource-id %LOGIN_RESOURCE% --http-method POST --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:431655581275:function:partido-conservador-auth/invocations" --region %REGION% --no-cli-pager

REM CORS para /auth/login
echo.
echo Configurando CORS para /api/auth/login...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %LOGIN_RESOURCE% --http-method OPTIONS --authorization-type NONE --region %REGION% --no-cli-pager 2>nul

aws apigateway put-integration --rest-api-id %API_ID% --resource-id %LOGIN_RESOURCE% --http-method OPTIONS --type MOCK --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" --region %REGION% --no-cli-pager

aws apigateway put-method-response --rest-api-id %API_ID% --resource-id %LOGIN_RESOURCE% --http-method OPTIONS --status-code 200 --response-parameters "method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false" --region %REGION% --no-cli-pager 2>nul

aws apigateway put-integration-response --rest-api-id %API_ID% --resource-id %LOGIN_RESOURCE% --http-method OPTIONS --status-code 200 --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'POST,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" --region %REGION% --no-cli-pager

REM Agregar permisos
echo.
echo Agregando permisos de invocacion...
aws lambda add-permission --function-name partido-conservador-auth --statement-id apigateway-auth-login --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:431655581275:%API_ID%/*/POST/api/auth/login" --region %REGION% --no-cli-pager 2>nul

echo.
echo Desplegando API...
aws apigateway create-deployment --rest-api-id %API_ID% --stage-name prod --region %REGION% --no-cli-pager

echo.
echo ========================================
echo Endpoints creados exitosamente!
echo ========================================
echo.
echo URL de login:
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/auth/login
echo.
pause
