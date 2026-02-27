@echo off
echo ========================================
echo Desplegando Lambda Export Excel
echo ========================================

set FUNCTION_NAME=partido-conservador-export-excel
set REGION=us-west-2
set ACCOUNT_ID=431655581275
set ROLE_ARN=arn:aws:iam::%ACCOUNT_ID%:role/lambda-dynamodb-role

echo.
echo Paso 1: Empaquetando Lambda...
if exist lambda-export-excel.zip del lambda-export-excel.zip

:: Crear directorio temporal
if exist temp-export-excel rmdir /s /q temp-export-excel
mkdir temp-export-excel

:: Copiar archivo de la lambda
copy lambda-export-excel.js temp-export-excel\

:: Copiar node_modules necesarios
xcopy /E /I /Y node_modules\@aws-sdk temp-export-excel\node_modules\@aws-sdk
xcopy /E /I /Y node_modules\exceljs temp-export-excel\node_modules\exceljs

:: Crear ZIP
cd temp-export-excel
powershell Compress-Archive -Path * -DestinationPath ..\lambda-export-excel.zip -Force
cd ..

:: Limpiar
rmdir /s /q temp-export-excel

echo.
echo Paso 2: Verificando si la funcion existe...
aws lambda get-function --function-name %FUNCTION_NAME% --region %REGION% >nul 2>&1

if %errorlevel% equ 0 (
    echo Funcion existe, actualizando codigo...
    aws lambda update-function-code ^
        --function-name %FUNCTION_NAME% ^
        --zip-file fileb://lambda-export-excel.zip ^
        --region %REGION%
    
    echo Esperando a que se complete la actualizacion...
    timeout /t 3 /nobreak >nul
    
    echo Actualizando configuracion...
    aws lambda update-function-configuration ^
        --function-name %FUNCTION_NAME% ^
        --timeout 30 ^
        --memory-size 512 ^
        --region %REGION%
) else (
    echo Funcion no existe, creando...
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

echo.
echo Paso 3: Configurando permisos para API Gateway...
aws lambda add-permission ^
    --function-name %FUNCTION_NAME% ^
    --statement-id apigateway-export-excel ^
    --action lambda:InvokeFunction ^
    --principal apigateway.amazonaws.com ^
    --region %REGION% 2>nul

echo.
echo ========================================
echo Lambda desplegada exitosamente!
echo Nombre: %FUNCTION_NAME%
echo ========================================
echo.
echo SIGUIENTE PASO: Configurar endpoint en API Gateway
echo Endpoint sugerido: GET /api/export/excel
echo.

pause
