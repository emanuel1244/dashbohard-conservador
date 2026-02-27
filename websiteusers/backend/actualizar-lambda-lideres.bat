@echo off
echo ========================================
echo Actualizando Lambdas de Lideres con CORS
echo ========================================

cd /d "%~dp0"

echo.
echo 1. Creando ZIP con lambda-lideres.js...
if exist lambda-lideres.zip del lambda-lideres.zip
powershell -Command "Compress-Archive -Path lambda-lideres.js -DestinationPath lambda-lideres.zip -Force"

if not exist lambda-lideres.zip (
    echo ERROR: No se pudo crear el ZIP
    pause
    exit /b 1
)

echo.
echo 2. Actualizando funcion getLideres...
aws lambda update-function-code ^
    --function-name partido-conservador-getLideres ^
    --zip-file fileb://lambda-lideres.zip ^
    --region us-west-2

echo.
echo 3. Actualizando funcion createLider...
aws lambda update-function-code ^
    --function-name partido-conservador-createLider ^
    --zip-file fileb://lambda-lideres.zip ^
    --region us-west-2

echo.
echo 4. Actualizando funcion updateLider...
aws lambda update-function-code ^
    --function-name partido-conservador-updateLider ^
    --zip-file fileb://lambda-lideres.zip ^
    --region us-west-2

echo.
echo 5. Actualizando funcion deleteLider...
aws lambda update-function-code ^
    --function-name partido-conservador-deleteLider ^
    --zip-file fileb://lambda-lideres.zip ^
    --region us-west-2

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Hubo un problema actualizando alguna Lambda
    pause
    exit /b 1
)

echo.
echo ========================================
echo Lambdas actualizadas exitosamente!
echo ========================================
echo.
echo Ahora prueba las operaciones DELETE y PUT desde tu aplicacion
echo.
pause
