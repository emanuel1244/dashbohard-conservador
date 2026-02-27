@echo off
echo ========================================
echo SOLUCION RAPIDA Y DEFINITIVA
echo ========================================
echo.
echo Actualizando TODAS las Lambdas con codigo simplificado
echo.

cd /d "%~dp0"

echo 1. Creando ZIPs...
if exist lambda-lideres.zip del lambda-lideres.zip
if exist lambda-personas.zip del lambda-personas.zip

powershell -Command "Compress-Archive -Path lambda-lideres.js -DestinationPath lambda-lideres.zip -Force"
powershell -Command "Compress-Archive -Path lambda-personas.js -DestinationPath lambda-personas.zip -Force"

echo.
echo 2. Actualizando Lambdas de LIDERES...
aws lambda update-function-code --function-name partido-conservador-getLideres --zip-file fileb://lambda-lideres.zip --region us-west-2 > nul
aws lambda update-function-code --function-name partido-conservador-createLider --zip-file fileb://lambda-lideres.zip --region us-west-2 > nul
aws lambda update-function-code --function-name partido-conservador-updateLider --zip-file fileb://lambda-lideres.zip --region us-west-2 > nul
aws lambda update-function-code --function-name partido-conservador-deleteLider --zip-file fileb://lambda-lideres.zip --region us-west-2 > nul

echo.
echo 3. Actualizando Lambdas de PERSONAS...
aws lambda update-function-code --function-name partido-conservador-getPersonas --zip-file fileb://lambda-personas.zip --region us-west-2 > nul
aws lambda update-function-code --function-name partido-conservador-getEstadisticas --zip-file fileb://lambda-personas.zip --region us-west-2 > nul

echo.
echo 4. Configurando CORS en API Gateway...
echo.
echo Obteniendo API ID...
for /f "tokens=*" %%i in ('aws apigateway get-rest-apis --region us-west-2 --query "items[?name=='partido-conservador-stack'].id" --output text') do set API_ID=%%i

if "%API_ID%"=="" (
    echo ERROR: No se encontro la API
    echo.
    echo Ejecuta este comando para ver tus APIs:
    echo aws apigateway get-rest-apis --region us-west-2
    pause
    exit /b 1
)

echo API ID: %API_ID%
echo.
echo Habilitando CORS en todos los recursos...

REM Obtener todos los recursos
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region us-west-2 --query "items[*].id" --output text') do (
    echo Configurando recurso: %%i
    
    REM Crear método OPTIONS si no existe
    aws apigateway put-method ^
        --rest-api-id %API_ID% ^
        --resource-id %%i ^
        --http-method OPTIONS ^
        --authorization-type NONE ^
        --region us-west-2 2>nul
    
    REM Configurar integración MOCK
    aws apigateway put-integration ^
        --rest-api-id %API_ID% ^
        --resource-id %%i ^
        --http-method OPTIONS ^
        --type MOCK ^
        --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" ^
        --region us-west-2 2>nul
    
    REM Configurar respuesta del método
    aws apigateway put-method-response ^
        --rest-api-id %API_ID% ^
        --resource-id %%i ^
        --http-method OPTIONS ^
        --status-code 200 ^
        --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Origin\":true}" ^
        --region us-west-2 2>nul
    
    REM Configurar respuesta de integración
    aws apigateway put-integration-response ^
        --rest-api-id %API_ID% ^
        --resource-id %%i ^
        --http-method OPTIONS ^
        --status-code 200 ^
        --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" ^
        --region us-west-2 2>nul
)

echo.
echo 5. Desplegando cambios en API Gateway...
aws apigateway create-deployment ^
    --rest-api-id %API_ID% ^
    --stage-name Prod ^
    --region us-west-2

echo.
echo ========================================
echo COMPLETADO!
echo ========================================
echo.
echo Tu API URL: https://%API_ID%.execute-api.us-west-2.amazonaws.com/Prod/api
echo.
echo IMPORTANTE: Actualiza esta URL en:
echo partido-conservador-dashboard/src/environments/environment.ts
echo.
echo Cambia apiUrl a: https://%API_ID%.execute-api.us-west-2.amazonaws.com/Prod
echo.
echo Luego reinicia tu frontend (npm start)
echo.
pause
