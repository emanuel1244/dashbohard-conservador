@echo off
setlocal
set AWS_PAGER=

cd /d "%~dp0"

echo Creando ZIP...
if exist lambda-lideres.zip del lambda-lideres.zip
powershell -Command "Compress-Archive -Path lambda-lideres.js -DestinationPath lambda-lideres.zip -Force"

echo.
echo Actualizando getLideres...
aws lambda update-function-code --function-name partido-conservador-getLideres --zip-file fileb://lambda-lideres.zip --region us-west-2 --no-cli-pager

timeout /t 3 /nobreak >nul

echo.
echo Actualizando createLider...
aws lambda update-function-code --function-name partido-conservador-createLider --zip-file fileb://lambda-lideres.zip --region us-west-2 --no-cli-pager

timeout /t 3 /nobreak >nul

echo.
echo Actualizando updateLider...
aws lambda update-function-code --function-name partido-conservador-updateLider --zip-file fileb://lambda-lideres.zip --region us-west-2 --no-cli-pager

timeout /t 3 /nobreak >nul

echo.
echo Actualizando deleteLider...
aws lambda update-function-code --function-name partido-conservador-deleteLider --zip-file fileb://lambda-lideres.zip --region us-west-2 --no-cli-pager

echo.
echo LISTO! Todas las lambdas actualizadas.
pause
