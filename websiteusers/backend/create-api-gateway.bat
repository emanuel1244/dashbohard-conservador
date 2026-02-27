@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   CREAR API GATEWAY
echo   Partido Conservador
echo ========================================
echo.

set REGION=us-west-2
set ACCOUNT_ID=431655581275

echo Paso 1: Creando API REST...
for /f "tokens=*" %%a in ('aws apigateway create-rest-api --name "PartidoConservadorAPI" --description "API para Dashboard Partido Conservador" --region %REGION% --query "id" --output text') do set API_ID=%%a
echo API ID: %API_ID%

echo.
echo Paso 2: Obteniendo root resource...
for /f "tokens=*" %%a in ('aws apigateway get-resources --rest-api-id %API_ID% --region %REGION% --query "items[0].id" --output text') do set ROOT_ID=%%a
echo Root ID: %ROOT_ID%

echo.
echo Paso 3: Creando recurso /api...
for /f "tokens=*" %%a in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %ROOT_ID% --path-part api --region %REGION% --query "id" --output text') do set API_RESOURCE_ID=%%a
echo API Resource ID: %API_RESOURCE_ID%

echo.
echo Paso 4: Creando recurso /api/upload-excel...
for /f "tokens=*" %%a in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %API_RESOURCE_ID% --path-part upload-excel --region %REGION% --query "id" --output text') do set UPLOAD_RESOURCE_ID=%%a

echo.
echo Paso 5: Creando metodo POST para /api/upload-excel...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %UPLOAD_RESOURCE_ID% --http-method POST --authorization-type NONE --region %REGION%

echo.
echo Paso 6: Integrando con Lambda uploadExcel...
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %UPLOAD_RESOURCE_ID% --http-method POST --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:partido-conservador-uploadExcel/invocations" --region %REGION%

echo.
echo Paso 7: Dando permiso a API Gateway para invocar Lambda...
aws lambda add-permission --function-name partido-conservador-uploadExcel --statement-id apigateway-upload-excel --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:%ACCOUNT_ID%:%API_ID%/*/*" --region %REGION% 2>nul

echo.
echo Paso 8: Creando recurso /api/personas...
for /f "tokens=*" %%a in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %API_RESOURCE_ID% --path-part personas --region %REGION% --query "id" --output text') do set PERSONAS_RESOURCE_ID=%%a

echo.
echo Paso 9: Creando metodo GET para /api/personas...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %PERSONAS_RESOURCE_ID% --http-method GET --authorization-type NONE --region %REGION%

echo.
echo Paso 10: Integrando con Lambda getPersonas...
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %PERSONAS_RESOURCE_ID% --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:partido-conservador-getPersonas/invocations" --region %REGION%

echo.
echo Paso 11: Dando permiso a API Gateway...
aws lambda add-permission --function-name partido-conservador-getPersonas --statement-id apigateway-get-personas --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:%ACCOUNT_ID%:%API_ID%/*/*" --region %REGION% 2>nul

echo.
echo Paso 12: Creando recurso /api/estadisticas...
for /f "tokens=*" %%a in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %API_RESOURCE_ID% --path-part estadisticas --region %REGION% --query "id" --output text') do set STATS_RESOURCE_ID=%%a

echo.
echo Paso 13: Creando metodo GET para /api/estadisticas...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %STATS_RESOURCE_ID% --http-method GET --authorization-type NONE --region %REGION%

echo.
echo Paso 14: Integrando con Lambda getEstadisticas...
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %STATS_RESOURCE_ID% --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:partido-conservador-getEstadisticas/invocations" --region %REGION%

echo.
echo Paso 15: Dando permiso a API Gateway...
aws lambda add-permission --function-name partido-conservador-getEstadisticas --statement-id apigateway-get-stats --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:%ACCOUNT_ID%:%API_ID%/*/*" --region %REGION% 2>nul

echo.
echo Paso 16: Creando recurso /api/lideres...
for /f "tokens=*" %%a in ('aws apigateway create-resource --rest-api-id %API_ID% --parent-id %API_RESOURCE_ID% --path-part lideres --region %REGION% --query "id" --output text') do set LIDERES_RESOURCE_ID=%%a

echo.
echo Paso 17: Creando metodo GET para /api/lideres...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %LIDERES_RESOURCE_ID% --http-method GET --authorization-type NONE --region %REGION%

echo.
echo Paso 18: Integrando con Lambda getLideres...
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %LIDERES_RESOURCE_ID% --http-method GET --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:partido-conservador-getLideres/invocations" --region %REGION%

echo.
echo Paso 19: Dando permiso a API Gateway...
aws lambda add-permission --function-name partido-conservador-getLideres --statement-id apigateway-get-lideres --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:%ACCOUNT_ID%:%API_ID%/*/*" --region %REGION% 2>nul

echo.
echo Paso 20: Creando metodo POST para /api/lideres...
aws apigateway put-method --rest-api-id %API_ID% --resource-id %LIDERES_RESOURCE_ID% --http-method POST --authorization-type NONE --region %REGION%

echo.
echo Paso 21: Integrando con Lambda createLider...
aws apigateway put-integration --rest-api-id %API_ID% --resource-id %LIDERES_RESOURCE_ID% --http-method POST --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:partido-conservador-createLider/invocations" --region %REGION%

echo.
echo Paso 22: Dando permiso a API Gateway...
aws lambda add-permission --function-name partido-conservador-createLider --statement-id apigateway-create-lider --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:%REGION%:%ACCOUNT_ID%:%API_ID%/*/*" --region %REGION% 2>nul

echo.
echo Paso 23: Habilitando CORS...
aws apigateway update-rest-api --rest-api-id %API_ID% --patch-operations op=add,path=/binaryMediaTypes/multipart~1form-data --region %REGION% 2>nul

echo.
echo Paso 24: Desplegando API...
aws apigateway create-deployment --rest-api-id %API_ID% --stage-name prod --region %REGION%

echo.
echo ========================================
echo   API GATEWAY CREADO
echo ========================================
echo.
echo URL de tu API:
echo https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api
echo.
echo Actualiza esta URL en tu frontend:
echo partido-conservador-dashboard/src/app/components/dashboard/dashboard.component.ts
echo.
echo private apiUrl = 'https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api';
echo.
pause
