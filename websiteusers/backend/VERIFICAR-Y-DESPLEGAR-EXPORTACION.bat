@echo off
echo ========================================
echo DESPLIEGUE COMPLETO DE EXPORTACION
echo ========================================
echo.
echo Este script desplegara automaticamente:
echo - Lambda Export Excel
echo - Lambda Export PDF
echo - Endpoints en API Gateway
echo - Configuracion CORS
echo.

set API_ID=t6km5ha4e3
set REGION=us-west-2
set ACCOUNT_ID=431655581275
set ROLE_ARN=arn:aws:iam::%ACCOUNT_ID%:role/lambda-dynamodb-role

echo ========================================
echo PASO 1: DESPLEGAR LAMBDA EXPORT EXCEL
echo ========================================
echo.

set FUNCTION_NAME=partido-conservador-export-excel

echo Empaquetando Lambda Export Excel...
if exist lambda-export-excel.zip del lambda-export-excel.zip

if exist temp-export-excel rmdir /s /q temp-export-excel
mkdir temp-export-excel

copy lambda-export-excel.js temp-export-excel\
xcopy /E /I /Y node_modules\@aws-sdk temp-export-excel\node_modules\@aws-sdk
xcopy /E /I /Y node_modules\@smithy temp-export-excel\node_modules\@smithy
xcopy /E /I /Y node_modules\exceljs temp-export-excel\node_modules\exceljs

cd temp-export-excel
powershell Compress-Archive -Path * -DestinationPath ..\lambda-export-excel.zip -Force
cd ..
rmdir /s /q temp-export-excel

echo Verificando si la funcion existe...
aws lambda get-function --function-name %FUNCTION_NAME% --region %REGION% >nul 2>&1

if %errorlevel% equ 0 (
    echo Actualizando codigo de Lambda Export Excel...
    aws lambda update-function-code ^
        --function-name %FUNCTION_NAME% ^
        --zip-file fileb://lambda-export-excel.zip ^
        --region %REGION%
    
    timeout /t 3 /nobreak >nul
    
    aws lambda update-function-configuration ^
        --function-name %FUNCTION_NAME% ^
        --timeout 30 ^
        --memory-size 512 ^
        --region %REGION%
) else (
    echo Creando Lambda Export Excel...
    aws lambda create-function ^
        --function-name %FUNCTION_NAME% ^
        --runtime nodejs20.x ^
        --role %ROLE_ARN% ^
        --handler lambda-export-excel.handler ^
        --zip-file fileb://lambda-export-excel.zip ^
        --timeout 30 ^
        --memory-size 512 ^
        --region %REGION%
)

echo Configurando permisos...
aws lambda add-permission ^
    --function-name %FUNCTION_NAME% ^
    --statement-id apigateway-export-excel ^
    --action lambda:InvokeFunction ^
    --principal apigateway.amazonaws.com ^
    --region %REGION% 2>nul

echo [OK] Lambda Export Excel desplegada
echo.

echo ========================================
echo PASO 2: DESPLEGAR LAMBDA EXPORT PDF
echo ========================================
echo.

set FUNCTION_NAME=partido-conservador-export-pdf

echo Empaquetando Lambda Export PDF...
if exist lambda-export-pdf.zip del lambda-export-pdf.zip

if exist temp-export-pdf rmdir /s /q temp-export-pdf
mkdir temp-export-pdf

copy lambda-export-pdf.js temp-export-pdf\
xcopy /E /I /Y node_modules\@aws-sdk temp-export-pdf\node_modules\@aws-sdk
xcopy /E /I /Y node_modules\@smithy temp-export-pdf\node_modules\@smithy
xcopy /E /I /Y node_modules\pdfkit temp-export-pdf\node_modules\pdfkit

cd temp-export-pdf
powershell Compress-Archive -Path * -DestinationPath ..\lambda-export-pdf.zip -Force
cd ..
rmdir /s /q temp-export-pdf

echo Verificando si la funcion existe...
aws lambda get-function --function-name %FUNCTION_NAME% --region %REGION% >nul 2>&1

if %errorlevel% equ 0 (
    echo Actualizando codigo de Lambda Export PDF...
    aws lambda update-function-code ^
        --function-name %FUNCTION_NAME% ^
        --zip-file fileb://lambda-export-pdf.zip ^
        --region %REGION%
    
    timeout /t 3 /nobreak >nul
    
    aws lambda update-function-configuration ^
        --function-name %FUNCTION_NAME% ^
        --timeout 30 ^
        --memory-size 512 ^
        --region %REGION%
) else (
    echo Creando Lambda Export PDF...
    aws lambda create-function ^
        --function-name %FUNCTION_NAME% ^
        --runtime nodejs20.x ^
        --role %ROLE_ARN% ^
        --handler lambda-export-pdf.handler ^
        --zip-file fileb://lambda-export-pdf.zip ^
        --timeout 30 ^
        --memory-size 512 ^
        --region %REGION%
)

echo Configurando permisos...
aws lambda add-permission ^
    --function-name %FUNCTION_NAME% ^
    --statement-id apigateway-export-pdf ^
    --action lambda:InvokeFunction ^
    --principal apigateway.amazonaws.com ^
    --region %REGION% 2>nul

echo [OK] Lambda Export PDF desplegada
echo.

echo ========================================
echo PASO 3: CONFIGURAR ENDPOINT EXPORT EXCEL
echo ========================================
echo.

echo Obteniendo root resource ID...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/'].id" --output text') do set ROOT_ID=%%i

echo Buscando/creando recurso /api...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api'].id" --output text') do set API_RESOURCE_ID=%%i
if "%API_RESOURCE_ID%"=="" (
    for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %ROOT_ID% --path-part api --region %REGION% --query "id" --output text') do set API_RESOURCE_ID=%%i
)

echo Buscando/creando recurso /api/export...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/export'].id" --output text') do set EXPORT_RESOURCE_ID=%%i
if "%EXPORT_RESOURCE_ID%"=="" (
    for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %API_RESOURCE_ID% --path-part export --region %REGION% --query "id" --output text') do set EXPORT_RESOURCE_ID=%%i
)

echo Buscando/creando recurso /api/export/excel...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/export/excel'].id" --output text') do set EXCEL_RESOURCE_ID=%%i
if "%EXCEL_RESOURCE_ID%"=="" (
    for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %EXPORT_RESOURCE_ID% --path-part excel --region %REGION% --query "id" --output text') do set EXCEL_RESOURCE_ID=%%i
)

echo Configurando metodo GET...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %EXCEL_RESOURCE_ID% ^
    --http-method GET ^
    --authorization-type NONE ^
    --region %REGION% 2>nul

set LAMBDA_ARN=arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:partido-conservador-export-excel

echo Configurando integracion con Lambda...
aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %EXCEL_RESOURCE_ID% ^
    --http-method GET ^
    --type AWS_PROXY ^
    --integration-http-method POST ^
    --uri arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/%LAMBDA_ARN%/invocations ^
    --region %REGION%

echo Configurando CORS (OPTIONS)...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %EXCEL_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --authorization-type NONE ^
    --region %REGION% 2>nul

aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %EXCEL_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --type MOCK ^
    --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" ^
    --region %REGION% 2>nul

aws apigateway put-integration-response ^
    --rest-api-id %API_ID% ^
    --resource-id %EXCEL_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --status-code 200 ^
    --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" ^
    --region %REGION% 2>nul

aws apigateway put-method-response ^
    --rest-api-id %API_ID% ^
    --resource-id %EXCEL_RESOURCE_ID% ^
    --http-method OPTIONS ^
    --status-code 200 ^
    --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Origin\":true}" ^
    --region %REGION% 2>nul

echo Configurando binary media types para Excel...
aws apigateway update-rest-api ^
    --rest-api-id %API_ID% ^
    --patch-operations "op=add,path=/binaryMediaTypes/application~1vnd.openxmlformats-officedocument.spreadsheetml.sheet" ^
    --region %REGION% 2>nul

echo [OK] Endpoint Export Excel configurado
echo.

echo ========================================
echo PASO 4: CONFIGURAR ENDPOINT EXPORT PDF
echo ========================================
echo.

echo Buscando/creando recurso /api/export/pdf...
for /f "tokens=*" %%i in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[?path=='/api/export/pdf'].id" --output text') do set PDF_RESOURCE_ID=%%i
if "%PDF_RESOURCE_ID%"=="" (
    for /f "tokens=*" %%i in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %EXPORT_RESOURCE_ID% --path-part pdf --region %REGION% --query "id" --output text') do set PDF_RESOURCE_ID=%%i
)

echo Configurando metodo GET...
aws apigateway put-method ^
    --rest-api-id %API_ID% ^
    --resource-id %PDF_RESOURCE_ID% ^
    --http-method GET ^
    --authorization-type NONE ^
    --region %REGION% 2>nul

set LAMBDA_ARN=arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:partido-conservador-export-pdf

echo Configurando integracion con Lambda...
aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %PDF_RESOURCE_ID% ^
    --http-method GET ^
    --type AWS_PROXY ^
    --integration-http-method POST ^
    --uri arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/%LAMBDA_ARN%/invocations ^
    --region %REGION%

echo Configurando CORS (OPTIONS)...
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

echo Configurando binary media types para PDF...
aws apigateway update-rest-api ^
    --rest-api-id %API_ID% ^
    --patch-operations "op=add,path=/binaryMediaTypes/application~1pdf" ^
    --region %REGION% 2>nul

echo [OK] Endpoint Export PDF configurado
echo.

echo ========================================
echo PASO 5: DESPLEGAR CAMBIOS EN API GATEWAY
echo ========================================
echo.

echo Desplegando a stage prod...
aws apigateway create-deployment ^
    --rest-api-id %API_ID% ^
    --stage-name prod ^
    --region %REGION%

echo.
echo ========================================
echo DESPLIEGUE COMPLETADO EXITOSAMENTE!
echo ========================================
echo.
echo URLs disponibles:
echo.
echo Excel Export:
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/excel?type=personas
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/excel?type=lideres
echo.
echo PDF Export:
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/pdf?type=reporte-general
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/export/pdf?type=certificado^&ids=[...]
echo.
echo ========================================
pause
