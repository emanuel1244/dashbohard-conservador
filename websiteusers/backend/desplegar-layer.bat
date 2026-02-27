@echo off
echo ========================================
echo Desplegando Lambda Layer a AWS
echo ========================================

set LAYER_NAME=nodejs-dependencies-layer
set REGION=us-west-2

echo.
echo Publicando Layer en AWS Lambda...
aws lambda publish-layer-version ^
  --layer-name %LAYER_NAME% ^
  --description "Dependencies for Excel upload Lambda (xlsx)" ^
  --zip-file fileb://lambda-layer.zip ^
  --compatible-runtimes nodejs20.x ^
  --region %REGION% > layer-arn.json

echo.
echo Extrayendo ARN del Layer...
powershell -Command "$json = Get-Content layer-arn.json | ConvertFrom-Json; $json.LayerVersionArn | Out-File -FilePath layer-arn.txt -Encoding ASCII"

echo.
echo ARN del Layer:
type layer-arn.txt

echo.
echo ========================================
echo Layer desplegado exitosamente
echo ARN guardado en: layer-arn.txt
echo ========================================
