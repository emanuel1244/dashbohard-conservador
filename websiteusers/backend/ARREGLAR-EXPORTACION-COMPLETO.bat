@echo off
echo ========================================
echo ARREGLANDO EXPORTACION COMPLETO
echo ========================================
echo.

echo [1/6] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)
echo.

echo [2/6] Empaquetando lambda export-excel...
if exist export-excel.zip del export-excel.zip
powershell -Command "Compress-Archive -Path lambda-export-excel.js, node_modules -DestinationPath export-excel.zip -Force"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo empaquetar export-excel
    pause
    exit /b 1
)
echo.

echo [3/6] Desplegando lambda export-excel...
aws lambda update-function-code ^
    --function-name partido-conservador-export-excel ^
    --zip-file fileb://export-excel.zip
if %errorlevel% neq 0 (
    echo ERROR: No se pudo desplegar export-excel
    pause
    exit /b 1
)
echo Esperando a que se actualice...
timeout /t 5 /nobreak >nul
echo.

echo [4/6] Empaquetando lambda export-pdf...
if exist export-pdf.zip del export-pdf.zip
powershell -Command "Compress-Archive -Path lambda-export-pdf.js, node_modules -DestinationPath export-pdf.zip -Force"
if %errorlevel% neq 0 (
    echo ERROR: No se pudo empaquetar export-pdf
    pause
    exit /b 1
)
echo.

echo [5/6] Desplegando lambda export-pdf...
aws lambda update-function-code ^
    --function-name partido-conservador-export-pdf ^
    --zip-file fileb://export-pdf.zip
if %errorlevel% neq 0 (
    echo ERROR: No se pudo desplegar export-pdf
    pause
    exit /b 1
)
echo Esperando a que se actualice...
timeout /t 5 /nobreak >nul
echo.

echo [6/6] Configurando CORS en API Gateway...
aws apigateway update-integration-response ^
    --rest-api-id t6km5ha4e3 ^
    --resource-id RESOURCE_ID_EXPORT_EXCEL ^
    --http-method GET ^
    --status-code 200 ^
    --patch-operations op=replace,path=/responseParameters/method.response.header.Access-Control-Allow-Origin,value="'*'"

aws apigateway update-integration-response ^
    --rest-api-id t6km5ha4e3 ^
    --resource-id RESOURCE_ID_EXPORT_PDF ^
    --http-method GET ^
    --status-code 200 ^
    --patch-operations op=replace,path=/responseParameters/method.response.header.Access-Control-Allow-Origin,value="'*'"

echo.
echo Desplegando cambios de API Gateway...
aws apigateway create-deployment ^
    --rest-api-id t6km5ha4e3 ^
    --stage-name prod ^
    --description "Arreglo CORS exportacion"

echo.
echo ========================================
echo COMPLETADO
echo ========================================
echo Las lambdas han sido actualizadas con todas las dependencias
echo y CORS ha sido configurado correctamente.
echo.
pause
