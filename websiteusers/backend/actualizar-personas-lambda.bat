@echo off
setlocal
set AWS_PAGER=

cd /d "%~dp0"

echo Creando ZIP para lambda-personas...
if exist lambda-personas.zip del lambda-personas.zip
powershell -Command "Compress-Archive -Path lambda-personas.js -DestinationPath lambda-personas.zip -Force"

echo.
echo Actualizando getPersonas...
aws lambda update-function-code --function-name partido-conservador-getPersonas --zip-file fileb://lambda-personas.zip --region us-west-2 --no-cli-pager

timeout /t 2 /nobreak >nul

echo.
echo Actualizando handler...
aws lambda update-function-configuration --function-name partido-conservador-getPersonas --handler lambda-personas.handler --region us-west-2 --no-cli-pager

echo.
echo LISTO!
pause
