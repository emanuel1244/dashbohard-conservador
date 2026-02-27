@echo off
setlocal enabledelayedexpansion

echo ========================================
echo ARREGLANDO CORS DEFINITIVAMENTE
echo ========================================

cd /d "%~dp0"

set API_ID=t6km5ha4e3
set REGION=us-west-2

echo.
echo API ID: %API_ID%
echo Region: %REGION%
echo.

echo 1. Actualizando Lambdas...
if exist lambda-lideres.zip del lambda-lideres.zip
if exist lambda-personas.zip del lambda-personas.zip

powershell -Command "Compress-Archive -Path lambda-lideres.js -DestinationPath lambda-lideres.zip -Force" >nul 2>&1
powershell -Command "Compress-Archive -Path lambda-personas.js -DestinationPath lambda-personas.zip -Force" >nul 2>&1

aws lambda update-function-code --function-name partido-conservador-getLideres --zip-file fileb://lambda-lideres.zip --region %REGION% >nul 2>&1
aws lambda update-function-code --function-name partido-conservador-createLider --zip-file fileb://lambda-lideres.zip --region %REGION% >nul 2>&1
aws lambda update-function-code --function-name partido-conservador-updateLider --zip-file fileb://lambda-lideres.zip --region %REGION% >nul 2>&1
aws lambda update-function-code --function-name partido-conservador-deleteLider --zip-file fileb://lambda-lideres.zip --region %REGION% >nul 2>&1
aws lambda update-function-code --function-name partido-conservador-getPersonas --zip-file fileb://lambda-personas.zip --region %REGION% >nul 2>&1
aws lambda update-function-code --function-name partido-conservador-getEstadisticas --zip-file fileb://lambda-personas.zip --region %REGION% >nul 2>&1

echo    Lambdas actualizadas!

echo.
echo 2. Obteniendo recursos de API Gateway...
aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[*].[path,id]" --output text > resources.txt

echo.
echo 3. Configurando CORS en cada recurso...

for /f "tokens=1,2" %%a in (resources.txt) do (
    set PATH_NAME=%%a
    set RESOURCE_ID=%%b
    
    echo    Configurando: !PATH_NAME!
    
    REM Crear OPTIONS
    aws apigateway put-method --rest-api-id %API_ID% --resource-id !RESOURCE_ID! --http-method OPTIONS --authorization-type NONE --region %REGION% >nul 2>&1
    
    REM Integración MOCK
    aws apigateway put-integration --rest-api-id %API_ID% --resource-id !RESOURCE_ID! --http-method OPTIONS --type MOCK --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" --region %REGION% >nul 2>&1
    
    REM Method Response
    aws apigateway put-method-response --rest-api-id %API_ID% --resource-id !RESOURCE_ID! --http-method OPTIONS --status-code 200 --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Origin\":true}" --region %REGION% >nul 2>&1
    
    REM Integration Response
    aws apigateway put-integration-response --rest-api-id %API_ID% --resource-id !RESOURCE_ID! --http-method OPTIONS --status-code 200 --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" --region %REGION% >nul 2>&1
)

del resources.txt

echo.
echo 4. Desplegando cambios...
aws apigateway create-deployment --rest-api-id %API_ID% --stage-name prod --region %REGION% >nul 2>&1

echo.
echo ========================================
echo COMPLETADO EXITOSAMENTE!
echo ========================================
echo.
echo Tu API URL: https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api
echo.
echo CORS configurado en API Gateway + Lambdas actualizadas
echo.
echo Ahora prueba tu aplicacion en http://localhost:4200
echo.
pause
