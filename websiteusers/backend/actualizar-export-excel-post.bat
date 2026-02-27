@echo off
echo ========================================
echo Actualizando Lambda Export Excel con POST
echo ========================================

cd /d "%~dp0"

echo.
echo [1/4] Creando directorio temporal...
if exist temp-lambda rmdir /s /q temp-lambda
mkdir temp-lambda

echo.
echo [2/4] Copiando lambda-export-excel.js...
copy lambda-export-excel.js temp-lambda\

echo.
echo [3/4] Actualizando función Lambda...
cd temp-lambda
powershell -Command "Compress-Archive -Path * -DestinationPath ../temp-lambda.zip -Force"
cd ..
aws lambda update-function-code --function-name partido-conservador-export-excel --zip-file fileb://temp-lambda.zip --region us-west-2

echo.
echo [4/4] Limpiando archivos temporales...
rmdir /s /q temp-lambda
del temp-lambda.zip

echo.
echo ========================================
echo Lambda actualizada correctamente
echo ========================================
echo.
echo Ahora configurando API Gateway para POST...
echo.

REM Obtener el API ID
for /f "tokens=*" %%i in ('aws apigatewayv2 get-apis --query "Items[?Name==`partido-conservador-api`].ApiId" --output text --region us-west-2') do set API_ID=%%i

if "%API_ID%"=="" (
    echo ERROR: No se encontró el API Gateway
    pause
    exit /b 1
)

echo API ID: %API_ID%

REM Obtener el Integration ID del export-excel
for /f "tokens=*" %%i in ('aws apigatewayv2 get-integrations --api-id %API_ID% --query "Items[?contains(IntegrationUri, `exportExcel`) ^|^| contains(IntegrationUri, `export-excel`)].IntegrationId" --output text --region us-west-2') do set INTEGRATION_ID=%%i

if "%INTEGRATION_ID%"=="" (
    echo ERROR: No se encontró la integración de exportExcel
    pause
    exit /b 1
)

echo Integration ID: %INTEGRATION_ID%

REM Buscar si ya existe la ruta POST
for /f "tokens=*" %%i in ('aws apigatewayv2 get-routes --api-id %API_ID% --query "Items[?RouteKey==`POST /api/export/excel`].RouteId" --output text --region us-west-2') do set POST_ROUTE_ID=%%i

if "%POST_ROUTE_ID%"=="" (
    echo Creando ruta POST /api/export/excel...
    aws apigatewayv2 create-route --api-id %API_ID% --route-key "POST /api/export/excel" --target "integrations/%INTEGRATION_ID%" --region us-west-2
    echo Ruta POST creada correctamente
) else (
    echo La ruta POST ya existe: %POST_ROUTE_ID%
)

echo.
echo ========================================
echo Configuración completada
echo ========================================
echo.
echo Endpoints disponibles:
echo GET  https://%API_ID%.execute-api.us-west-2.amazonaws.com/prod/api/export/excel
echo POST https://%API_ID%.execute-api.us-west-2.amazonaws.com/prod/api/export/excel
echo.
pause
