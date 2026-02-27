@echo off
echo ========================================
echo Desplegando Lambda getPersonasPorMesa
echo ========================================
echo.

set REGION=us-west-2
set ACCOUNT_ID=431655581275
set API_ID=t6km5ha4e3
set LAMBDA_NAME=partido-conservador-getPersonasPorMesa

echo Paso 1: Creando ZIP...
if exist lambda-personas-por-mesa.zip del lambda-personas-por-mesa.zip
powershell -Command "Compress-Archive -Path lambda-personas-por-mesa.js -DestinationPath lambda-personas-por-mesa.zip -Force"

if not exist lambda-personas-por-mesa.zip (
    echo ERROR: No se pudo crear el ZIP
    pause
    exit /b 1
)

echo.
echo Paso 2: Verificando si la Lambda existe...
aws lambda get-function --function-name %LAMBDA_NAME% --region %REGION% 2>nul

if %ERRORLEVEL% EQU 0 (
    echo Lambda existe, actualizando codigo...
    aws lambda update-function-code ^
        --function-name %LAMBDA_NAME% ^
        --zip-file fileb://lambda-personas-por-mesa.zip ^
        --region %REGION%
) else (
    echo Lambda no existe, creando...
    aws lambda create-function ^
        --function-name %LAMBDA_NAME% ^
        --runtime nodejs18.x ^
        --role arn:aws:iam::%ACCOUNT_ID%:role/PartidoConservadorLambdaRole ^
        --handler lambda-personas-por-mesa.handler ^
        --zip-file fileb://lambda-personas-por-mesa.zip ^
        --timeout 30 ^
        --memory-size 256 ^
        --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" ^
        --region %REGION%
)

echo.
echo Paso 3: Obteniendo resource ID de /api/personas...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/personas'].id" --output text') do set PERSONAS_RESOURCE_ID=%%i

if "%PERSONAS_RESOURCE_ID%"=="" (
    echo ERROR: No se encontro el recurso /api/personas
    pause
    exit /b 1
)

echo Resource ID de /api/personas: %PERSONAS_RESOURCE_ID%

echo.
echo Paso 4: Creando recurso /mesa...
aws apigateway create-resource ^
    --rest-api-id %API_ID% ^
    --parent-id %PERSONAS_RESOURCE_ID% ^
    --path-part mesa ^
    --region %REGION% 2>nul

echo.
echo Paso 5: Obteniendo resource ID de /api/personas/mesa...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/personas/mesa'].id" --output text') do set MESA_RESOURCE_ID=%%i

if "%MESA_RESOURCE_ID%"=="" (
    echo ERROR: No se encontro el recurso /api/personas/mesa
    pause
    exit /b 1
)

echo Resource ID de /api/personas/mesa: %MESA_RESOURCE_ID%

echo.
echo Paso 6: Creando recurso /{numeroMesa}...
aws apigateway create-resource ^
    --rest-api-id %API_ID% ^
    --parent-id %MESA_RESOURCE_ID% ^
    --path-part {numeroMesa} ^
    --region %REGION% 2>nul

echo.
echo Paso 7: Obteniendo resource ID de /api/personas/mesa/{numeroMesa}...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/personas/mesa/{numeroMesa}'].id" --output text') do set NUMERO_MESA_RESOURCE_ID=%%i

if "%NUMERO_MESA_RESOURCE_ID%"=="" (
    echo ERROR: No se encontro el recurso /api/personas/mesa/{numeroMesa}
    pause
    exit /b 1
)

echo Resource ID de /api/personas/mesa/{numeroMesa}: %NUMERO_MESA_RESOURCE_ID%

echo.
echo Paso 8: Configurando metodo GET...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %NUMERO_MESA_RESOURCE_ID% ^
    --http-method GET ^
    --authorization-type NONE ^
    --region %REGION% 2>nul

echo.
echo Paso 9: Integrando con Lambda...
aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %NUMERO_MESA_RESOURCE_ID% ^
    --http-method GET ^
    --type AWS_PROXY ^
    --integration-http-method POST ^
    --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:%LAMBDA_NAME%/invocations" ^
    --region %REGION%

echo.
echo Paso 10: Configurando metodo OPTIONS para CORS...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %NUMERO_MESA_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --authorization-type NONE ^
    --region %REGION% 2>nul

aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %NUMERO_MESA_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --type MOCK ^
    --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" ^
    --region %REGION% 2>nul

aws apigateway put-method-response ^
    --rest-api-id %API_ID% ^
    --resource-id %NUMERO_MESA_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --status-code 200 ^
    --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":false,\"method.response.header.Access-Control-Allow-Methods\":false,\"method.response.header.Access-Control-Allow-Origin\":false}" ^
    --region %REGION% 2>nul

aws apigateway put-integration-response ^
    --rest-api-id %API_ID% ^
    --resource-id %NUMERO_MESA_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --status-code 200 ^
    --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" ^
    --region %REGION% 2>nul

echo.
echo Paso 11: Dando permisos a API Gateway...
aws lambda add-permission ^
    --function-name %LAMBDA_NAME% ^
    --statement-id apigateway-personas-mesa-%RANDOM% ^
    --action lambda:InvokeFunction ^
    --principal apigateway.amazonaws.com ^
    --source-arn "arn:aws:execute-api:%REGION%:%ACCOUNT_ID%:%API_ID%/*/*" ^
    --region %REGION% 2>nul

echo.
echo Paso 12: Desplegando cambios...
aws apigateway create-deployment ^
    --rest-api-id %API_ID% ^
    --stage-name prod ^
    --description "Deploy getPersonasPorMesa" ^
    --region %REGION%

echo.
echo Limpiando...
del lambda-personas-por-mesa.zip

echo.
echo ========================================
echo DESPLIEGUE COMPLETADO!
echo ========================================
echo.
echo Endpoint disponible:
echo GET https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas/mesa/{numeroMesa}
echo.
echo Prueba con:
echo curl https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas/mesa/001
echo.
pause
