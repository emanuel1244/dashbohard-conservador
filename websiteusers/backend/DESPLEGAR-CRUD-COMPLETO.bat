@echo off
echo ========================================
echo DESPLIEGUE COMPLETO - CRUD PERSONAS
echo ========================================
echo.
echo Este script va a:
echo 1. Actualizar la Lambda con el codigo nuevo
echo 2. Crear el endpoint POST en API Gateway
echo 3. Configurar CORS para todos los metodos
echo 4. Desplegar los cambios
echo.
pause

REM Variables
set API_ID=t6km5ha4e3
set REGION=us-west-2
set LAMBDA_NAME=PartidoConservadorPersonas

echo.
echo ========================================
echo PASO 1: Actualizando Lambda
echo ========================================
echo.

REM Crear directorio temporal
if exist lambda-personas-temp rmdir /s /q lambda-personas-temp
mkdir lambda-personas-temp

REM Copiar archivos
copy lambda-personas.js lambda-personas-temp\index.js
copy lambda-package.json lambda-personas-temp\package.json

REM Instalar dependencias
cd lambda-personas-temp
call npm install --production

REM Crear ZIP
echo Creando archivo ZIP...
powershell Compress-Archive -Path * -DestinationPath ..\lambda-personas-crud.zip -Force

cd ..

REM Actualizar Lambda
echo Actualizando Lambda en AWS...
aws lambda update-function-code ^
    --function-name %LAMBDA_NAME% ^
    --zip-file fileb://lambda-personas-crud.zip ^
    --region %REGION%

echo Esperando a que la Lambda se actualice...
timeout /t 5 /nobreak > nul

REM Limpiar
rmdir /s /q lambda-personas-temp
del lambda-personas-crud.zip

echo.
echo ========================================
echo PASO 2: Obteniendo Resource ID
echo ========================================
echo.

REM Obtener el resource ID de /api/personas
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/personas'].id" --output text') do set RESOURCE_ID=%%i

if "%RESOURCE_ID%"=="" (
    echo ERROR: No se encontro el recurso /api/personas
    echo Verifica que el API Gateway este configurado correctamente
    pause
    exit /b 1
)

echo Resource ID encontrado: %RESOURCE_ID%

echo.
echo ========================================
echo PASO 3: Configurando metodo POST
echo ========================================
echo.

REM Verificar si POST ya existe
aws apigateway get-method --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method POST --region %REGION% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo El metodo POST ya existe, actualizando...
) else (
    echo Creando metodo POST...
    aws apigateway put-method ^
        --rest-api-id %API_ID% ^
        --resource-id %RESOURCE_ID% ^
        --http-method POST ^
        --authorization-type NONE ^
        --region %REGION%
)

echo Configurando integracion con Lambda...
aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %RESOURCE_ID% ^
    --http-method POST ^
    --type AWS_PROXY ^
    --integration-http-method POST ^
    --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:891377310481:function:%LAMBDA_NAME%/invocations" ^
    --region %REGION%

echo.
echo ========================================
echo PASO 4: Configurando CORS
echo ========================================
echo.

REM Configurar OPTIONS si no existe
aws apigateway get-method --rest-api-id %API_ID% --resource-id %RESOURCE_ID% --http-method OPTIONS --region %REGION% 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Creando metodo OPTIONS para CORS...
    aws apigateway put-method ^
        --rest-api-id %API_ID% ^
        --resource-id %RESOURCE_ID% ^
        --http-method OPTIONS ^
        --authorization-type NONE ^
        --region %REGION%

    aws apigateway put-integration ^
        --rest-api-id %API_ID% ^
        --resource-id %RESOURCE_ID% ^
        --http-method OPTIONS ^
        --type MOCK ^
        --request-templates "{\"application/json\": \"{\\\"statusCode\\\": 200}\"}" ^
        --region %REGION%

    aws apigateway put-method-response ^
        --rest-api-id %API_ID% ^
        --resource-id %RESOURCE_ID% ^
        --http-method OPTIONS ^
        --status-code 200 ^
        --response-parameters "method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false" ^
        --region %REGION%

    aws apigateway put-integration-response ^
        --rest-api-id %API_ID% ^
        --resource-id %RESOURCE_ID% ^
        --http-method OPTIONS ^
        --status-code 200 ^
        --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" ^
        --region %REGION%
)

echo.
echo ========================================
echo PASO 5: Dando permisos a API Gateway
echo ========================================
echo.

REM Dar permisos para POST
aws lambda add-permission ^
    --function-name %LAMBDA_NAME% ^
    --statement-id apigateway-post-personas-%RANDOM% ^
    --action lambda:InvokeFunction ^
    --principal apigateway.amazonaws.com ^
    --source-arn "arn:aws:execute-api:%REGION%:891377310481:%API_ID%/*/POST/api/personas" ^
    --region %REGION% 2>nul

if %ERRORLEVEL% EQU 0 (
    echo Permisos agregados correctamente
) else (
    echo Permisos ya existian o error al agregar
)

echo.
echo ========================================
echo PASO 6: Desplegando cambios
echo ========================================
echo.

aws apigateway create-deployment ^
    --rest-api-id %API_ID% ^
    --stage-name prod ^
    --description "Deploy CRUD personas con POST" ^
    --region %REGION%

echo.
echo ========================================
echo DESPLIEGUE COMPLETADO!
echo ========================================
echo.
echo Endpoints disponibles:
echo   GET    https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas
echo   POST   https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas
echo   GET    https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas/{id}
echo   PUT    https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas/{id}
echo   DELETE https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas/{id}
echo.
echo Prueba el endpoint POST con:
echo curl -X POST https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas \
echo   -H "Content-Type: application/json" \
echo   -d "{\"nombre\":\"Test\",\"cedula\":\"123456\"}"
echo.
pause
