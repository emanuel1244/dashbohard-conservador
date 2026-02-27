@echo off
echo ========================================
echo CREANDO LAMBDA LAYER PARA DEPENDENCIAS
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] Creando estructura para layer...
if exist nodejs rmdir /s /q nodejs
mkdir nodejs
echo.

echo [2/7] Copiando node_modules a layer...
xcopy /E /I /Y node_modules nodejs\node_modules
echo.

echo [3/7] Empaquetando layer...
if exist layer.zip del layer.zip
powershell -Command "Compress-Archive -Path nodejs -DestinationPath layer.zip -Force"
echo.

echo [4/7] Publicando layer en AWS...
aws lambda publish-layer-version ^
    --layer-name partido-conservador-dependencies ^
    --description "Dependencias compartidas para lambdas de exportacion" ^
    --zip-file fileb://layer.zip ^
    --compatible-runtimes nodejs20.x > layer-output.json

echo.
echo Extrayendo ARN del layer...
powershell -Command "$json = Get-Content layer-output.json | ConvertFrom-Json; $json.LayerVersionArn" > layer-arn.txt
set /p LAYER_ARN=<layer-arn.txt
echo Layer ARN: %LAYER_ARN%
echo.

echo [5/7] Empaquetando lambda export-excel (solo codigo)...
if exist export-excel.zip del export-excel.zip
powershell -Command "Compress-Archive -Path lambda-export-excel.js -DestinationPath export-excel.zip -Force"
echo.

echo [6/7] Empaquetando lambda export-pdf (solo codigo)...
if exist export-pdf.zip del export-pdf.zip
powershell -Command "Compress-Archive -Path lambda-export-pdf.js -DestinationPath export-pdf.zip -Force"
echo.

echo [7/7] Desplegando lambdas y asociando layer...
echo.
echo Actualizando export-excel...
aws lambda update-function-code --function-name partido-conservador-export-excel --zip-file fileb://export-excel.zip
aws lambda update-function-configuration --function-name partido-conservador-export-excel --layers %LAYER_ARN%
echo.

echo Actualizando export-pdf...
aws lambda update-function-code --function-name partido-conservador-export-pdf --zip-file fileb://export-pdf.zip
aws lambda update-function-configuration --function-name partido-conservador-export-pdf --layers %LAYER_ARN%
echo.

echo ========================================
echo COMPLETADO
echo ========================================
echo Layer creado: %LAYER_ARN%
echo Lambdas actualizadas con el layer
echo.
pause
