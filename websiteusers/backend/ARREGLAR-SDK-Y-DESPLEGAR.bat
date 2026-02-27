@echo off
echo ========================================
echo ARREGLANDO AWS SDK Y DESPLEGANDO
echo ========================================
echo.
echo El problema: Node.js 18 no incluye aws-sdk
echo La solucion: Usar AWS SDK v3 y empaquetarlo
echo.

cd /d "%~dp0"

echo 1. Instalando dependencias AWS SDK v3...
copy package-lambda.json package.json >nul
call npm install --production

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)

echo.
echo 2. Creando ZIP de LIDERES con dependencias...
if exist lambda-lideres.zip del lambda-lideres.zip
powershell -Command "Compress-Archive -Path lambda-lideres.js,node_modules -DestinationPath lambda-lideres.zip -Force"

echo.
echo 3. Creando ZIP de PERSONAS con dependencias...
if exist lambda-personas.zip del lambda-personas.zip
powershell -Command "Compress-Archive -Path lambda-personas.js,node_modules -DestinationPath lambda-personas.zip -Force"

echo.
echo 4. Actualizando Lambdas de LIDERES...
aws lambda update-function-code --function-name partido-conservador-getLideres --zip-file fileb://lambda-lideres.zip --region us-west-2
timeout /t 3 >nul
aws lambda update-function-code --function-name partido-conservador-createLider --zip-file fileb://lambda-lideres.zip --region us-west-2
timeout /t 3 >nul
aws lambda update-function-code --function-name partido-conservador-updateLider --zip-file fileb://lambda-lideres.zip --region us-west-2
timeout /t 3 >nul
aws lambda update-function-code --function-name partido-conservador-deleteLider --zip-file fileb://lambda-lideres.zip --region us-west-2

echo.
echo 5. Actualizando Lambdas de PERSONAS...
timeout /t 3 >nul
aws lambda update-function-code --function-name partido-conservador-getPersonas --zip-file fileb://lambda-personas.zip --region us-west-2
timeout /t 3 >nul
aws lambda update-function-code --function-name partido-conservador-getEstadisticas --zip-file fileb://lambda-personas.zip --region us-west-2

echo.
echo ========================================
echo COMPLETADO!
echo ========================================
echo.
echo Lambdas actualizadas con AWS SDK v3
echo.
echo Esperando 10 segundos para que se propaguen los cambios...
timeout /t 10 >nul

echo.
echo Ahora prueba tu aplicacion en http://localhost:4200
echo.
pause
