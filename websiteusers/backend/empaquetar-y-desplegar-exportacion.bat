@echo off
echo ========================================
echo Empaquetando y Desplegando Lambdas de Exportacion
echo ========================================
echo.

REM Crear directorio temporal
if exist temp-export rmdir /s /q temp-export
mkdir temp-export

echo Copiando archivos para Lambda Export Excel...
copy lambda-export-excel.js temp-export\index.js
copy package-lambda.json temp-export\package.json

cd temp-export
echo Instalando dependencias...
call npm install --production

echo Creando ZIP para Export Excel...
powershell Compress-Archive -Path * -DestinationPath ..\lambda-export-excel.zip -Force

cd ..
rmdir /s /q temp-export

echo.
echo Actualizando Lambda Export Excel...
aws lambda update-function-code ^
  --function-name partido-conservador-export-excel ^
  --zip-file fileb://lambda-export-excel.zip ^
  --region us-west-2

if %ERRORLEVEL% NEQ 0 (
  echo Error actualizando lambda de Excel
  pause
  exit /b 1
)

echo.
echo ========================================
echo.

REM Crear directorio temporal para PDF
mkdir temp-export

echo Copiando archivos para Lambda Export PDF...
copy lambda-export-pdf.js temp-export\index.js
copy package-lambda.json temp-export\package.json

cd temp-export
echo Instalando dependencias...
call npm install --production

echo Creando ZIP para Export PDF...
powershell Compress-Archive -Path * -DestinationPath ..\lambda-export-pdf.zip -Force

cd ..
rmdir /s /q temp-export

echo.
echo Actualizando Lambda Export PDF...
aws lambda update-function-code ^
  --function-name partido-conservador-export-pdf ^
  --zip-file fileb://lambda-export-pdf.zip ^
  --region us-west-2

if %ERRORLEVEL% NEQ 0 (
  echo Error actualizando lambda de PDF
  pause
  exit /b 1
)

echo.
echo ========================================
echo Lambdas empaquetadas y desplegadas exitosamente
echo ========================================
echo.
echo Espera 10 segundos para que las lambdas se actualicen...
timeout /t 10

echo.
echo Listo para probar!
pause
