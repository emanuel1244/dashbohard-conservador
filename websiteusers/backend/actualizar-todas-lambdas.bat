@echo off
echo ========================================
echo Actualizando TODAS las Lambdas con CORS
echo ========================================

cd /d "%~dp0"

echo.
echo 1. Creando ZIP de lambda-lideres.js...
if exist lambda-lideres.zip del lambda-lideres.zip
powershell -Command "Compress-Archive -Path lambda-lideres.js -DestinationPath lambda-lideres.zip -Force"

echo.
echo 2. Creando ZIP de lambda-personas.js...
if exist lambda-personas.zip del lambda-personas.zip
powershell -Command "Compress-Archive -Path lambda-personas.js -DestinationPath lambda-personas.zip -Force"

echo.
echo ========================================
echo Actualizando Lambdas de LIDERES
echo ========================================

echo.
echo 3. Actualizando getLideres...
aws lambda update-function-code ^
    --function-name partido-conservador-getLideres ^
    --zip-file fileb://lambda-lideres.zip ^
    --region us-west-2

echo.
echo 4. Actualizando createLider...
aws lambda update-function-code ^
    --function-name partido-conservador-createLider ^
    --zip-file fileb://lambda-lideres.zip ^
    --region us-west-2

echo.
echo 5. Actualizando updateLider...
aws lambda update-function-code ^
    --function-name partido-conservador-updateLider ^
    --zip-file fileb://lambda-lideres.zip ^
    --region us-west-2

echo.
echo 6. Actualizando deleteLider...
aws lambda update-function-code ^
    --function-name partido-conservador-deleteLider ^
    --zip-file fileb://lambda-lideres.zip ^
    --region us-west-2

echo.
echo ========================================
echo Actualizando Lambdas de PERSONAS
echo ========================================

echo.
echo 7. Actualizando getPersonas...
aws lambda update-function-code ^
    --function-name partido-conservador-getPersonas ^
    --zip-file fileb://lambda-personas.zip ^
    --region us-west-2

echo.
echo 8. Actualizando getEstadisticas...
aws lambda update-function-code ^
    --function-name partido-conservador-getEstadisticas ^
    --zip-file fileb://lambda-personas.zip ^
    --region us-west-2

echo.
echo ========================================
echo TODAS las Lambdas actualizadas!
echo ========================================
echo.
echo Ahora prueba tu aplicacion en http://localhost:4200
echo.
pause
