@echo off
echo ========================================
echo   DEPLOY SIMPLE CON AWS CloudFormation
echo ========================================
echo.

echo Creando paquete ZIP...
powershell -Command "if (Test-Path lambda-function.zip) { Remove-Item lambda-function.zip }; Compress-Archive -Path lambda-upload-excel-multipart.js,lambda-personas.js,lambda-lideres.js,node_modules -DestinationPath lambda-function.zip"

echo.
echo Creando bucket S3 para deployment...
set BUCKET_NAME=partido-conservador-deploy-%RANDOM%
aws s3 mb s3://%BUCKET_NAME% --region us-east-1

echo.
echo Subiendo codigo a S3...
aws s3 cp lambda-function.zip s3://%BUCKET_NAME%/lambda-function.zip

echo.
echo Desplegando con CloudFormation...
aws cloudformation deploy ^
  --template-file template.yaml ^
  --stack-name partido-conservador-stack ^
  --capabilities CAPABILITY_IAM ^
  --parameter-overrides CodeBucket=%BUCKET_NAME% ^
  --region us-east-1

echo.
echo Obteniendo URL de la API...
aws cloudformation describe-stacks ^
  --stack-name partido-conservador-stack ^
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" ^
  --output text

echo.
echo ========================================
echo   DEPLOY COMPLETADO
echo ========================================
pause
