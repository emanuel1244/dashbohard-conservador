@echo off
echo ========================================
echo Configurando CORS en API Gateway
echo ========================================
echo.

REM Obtener el API ID
for /f "tokens=*" %%i in ('aws apigateway get-rest-apis --region us-west-2 --query "items[?name=='partido-conservador-api'].id" --output text') do set API_ID=%%i

echo API ID: %API_ID%
echo.

REM Obtener todos los recursos
echo Obteniendo recursos...
aws apigateway get-resources --rest-api-id %API_ID% --region us-west-2 > resources.json

echo.
echo ========================================
echo Configurando CORS para /lideres
echo ========================================

REM Buscar el resource ID de /lideres
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region us-west-2 --query "items[?path=='/api/lideres'].id" --output text') do set LIDERES_RESOURCE_ID=%%i

echo Resource ID de /lideres: %LIDERES_RESOURCE_ID%

REM Crear método OPTIONS para /lideres
echo Creando método OPTIONS...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %LIDERES_RESOURCE_ID% --http-method OPTIONS --authorization-type NONE --region us-west-2

REM Configurar integración MOCK
echo Configurando integración MOCK...
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %LIDERES_RESOURCE_ID% --http-method OPTIONS --type MOCK --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" --region us-west-2

REM Configurar respuesta del método
echo Configurando respuesta del método...
aws apigateway put-method-response --rest-api-id %API_ID% --resource-id %LIDERES_RESOURCE_ID% --http-method OPTIONS --status-code 200 --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":false,\"method.response.header.Access-Control-Allow-Methods\":false,\"method.response.header.Access-Control-Allow-Origin\":false}" --region us-west-2

REM Configurar respuesta de integración
echo Configurando respuesta de integración...
aws apigateway put-integration-response --rest-api-id %API_ID% --resource-id %LIDERES_RESOURCE_ID% --http-method OPTIONS --status-code 200 --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" --region us-west-2

echo.
echo ========================================
echo Desplegando cambios...
echo ========================================

aws apigateway create-deployment --rest-api-id %API_ID% --stage-name prod --region us-west-2

echo.
echo ========================================
echo CORS configurado exitosamente!
echo ========================================
echo.
echo Ahora intenta crear un líder desde el dashboard.
echo.
pause
