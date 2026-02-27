@echo off
echo ========================================
echo Arreglando Lambda createPersona
echo ========================================
echo.

set REGION=us-west-2
set ACCOUNT_ID=431655581275
set API_ID=t6km5ha4e3
set LAMBDA_NAME=partido-conservador-createPersona
set RESOURCE_ID=m89gfs

echo Paso 1: Actualizando codigo de Lambda con lambda-personas-simple.js...
if exist lambda-personas-simple.zip del lambda-personas-simple.zip
powershell -Command "Compress-Archive -Path lambda-personas-simple.js -DestinationPath lambda-personas-simple.zip -Force"

aws lambda update-function-code ^
    --function-name %LAMBDA_NAME% ^
    --zip-file fileb://lambda-personas-simple.zip ^
    --region %REGION%

echo.
echo Paso 2: Actualizando handler...
aws lambda update-function-configuration ^
    --function-name %LAMBDA_NAME% ^
    --handler lambda-personas-simple.create ^
    --region %REGION%

echo.
echo Paso 3: Reintegrando con API Gateway (Account ID correcto)...
aws apigateway put-integration ^
    --rest-api-id %API_ID% ^
    --resource-id %RESOURCE_ID% ^
    --http-method POST ^
    --type AWS_PROXY ^
    --integration-http-method POST ^
    --uri "arn:aws:apigateway:%REGION%:lambda:path/2015-03-31/functions/arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:%LAMBDA_NAME%/invocations" ^
    --region %REGION%

echo.
echo Paso 4: Actualizando permisos...
aws lambda add-permission ^
    --function-name %LAMBDA_NAME% ^
    --statement-id apigateway-create-persona-%RANDOM% ^
    --action lambda:InvokeFunction ^
    --principal apigateway.amazonaws.com ^
    --source-arn "arn:aws:execute-api:%REGION%:%ACCOUNT_ID%:%API_ID%/*/*" ^
    --region %REGION% 2>nul

echo.
echo Paso 5: Desplegando cambios...
aws apigateway create-deployment ^
    --rest-api-id %API_ID% ^
    --stage-name prod ^
    --description "Fix createPersona Account ID" ^
    --region %REGION%

echo.
echo Limpiando...
del lambda-personas-simple.zip

echo.
echo ========================================
echo ARREGLADO!
echo ========================================
echo.
echo Endpoint disponible:
echo POST https://%API_ID%.execute-api.%REGION%.amazonaws.com/prod/api/personas
echo.
pause
