@echo off
echo ========================================
echo Desplegando Lambda createPersona
echo ========================================
echo.

set REGION=us-west-2
set ACCOUNT_ID=891377310481
set API_ID=t6km5ha4e3
set LAMBDA_NAME=partido-conservador-createPersona

echo Paso 1: Creando ZIP...
if exist lambda-create-persona.zip del lambda-create-persona.zip
powershell -Command "Compress-Archive -Path lambda-create-persona.js -DestinationPath lambda-create-persona.zip -Force"

echo.
echo Paso 2: Verificando si la Lambda existe...
aws lambda get-function --function-name %LAMBDA_NAME% --region %REGION% 2>nul

if %ERRORLEVEL% EQU 0 (
    echo Lambda existe, actualizando codigo...
    aws lambda update-function-code ^
        --function-name %LAMBDA_NAME% ^
        --zip-file fileb://lambda-create-persona.zip ^
        --region %REGION%
) else (
    echo Lambda no existe, creando...
    aws lambda create-function ^
        --function-name %LAMBDA_NAME% ^
        --runtime nodejs18.x ^
        --role arn:aws:iam::%ACCOUNT_ID%:role/PartidoConservadorLambdaRole ^
        --handler lambda-create-persona.handler ^
        --zip-file fileb://lambda-create-persona.zip ^
        --timeout 30 ^
        --memory-size 256 ^
        --environment "Variables={TABLE_NAME=PartidoConservadorPersonas}" ^
        --region %REGION%
)

echo.
echo Paso 3: Obteniendo resource ID de /api/personas...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/personas'].id" --output text') do set RESOURCE_ID=%%i

if "%RESOURCE_ID%"=="" (
    echo ERROR: No se encontro el recurso /api/personas
    pause
    exit /b 1
)

echo Resource ID: %RESOURCE_ID%

echo.
echo Paso 4: Configurando metodo POST en API Gateway...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %RESOURCE_ID% ^
    --http-method POST ^
    --authorization-type NONE ^
    --region %REGION% 2>nul

echo.
echo Paso 5: Integrando con Lambda...
aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %RESOURCE_ID% ^
    --http-method POST ^
    --type AWS_PROXY ^
    --integration-http-method POST ^
    --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:%LAMBDA_NAME%/invocations" ^
    --region %REGION%

echo.
echo Paso 6: Dando permisos a API Gateway...
aws lambda add-permission ^
    --function-name %LAMBDA_NAME% ^
    --statement-id apigateway-create-persona-%RANDOM% ^
    --action lambda:InvokeFunction ^
    --principal apigateway.amazonaws.com ^
    --source-arn "arn:aws:execute-api:%REGION%:%ACCOUNT_ID%:%API_ID%/*/*" ^
    --region %REGION% 2>nul

echo.
echo Paso 7: Desplegando cambios...
aws apigateway create-deployment ^
    --rest-api-id %API_ID% ^
    --stage-name prod ^
    --description "Deploy createPersona" ^
    --region %REGION%

echo.
echo Limpiando...
del lambda-create-persona.zip

echo.
echo ========================================
echo DESPLIEGUE COMPLETADO!
echo ========================================
echo.
echo Endpoint disponible:
echo POST https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas
echo.
echo Prueba con:
echo curl -X POST https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas \
echo   -H "Content-Type: application/json" \
echo   -d "{\"nombre\":\"Test\",\"cedula\":\"123456\"}"
echo.
pause
