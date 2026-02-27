@echo off
echo ========================================
echo Actualizando Lambdas de Exportacion
echo ========================================
echo.

echo Actualizando Lambda de Export Excel...
aws lambda update-function-code ^
  --function-name PartidoConservadorExportExcel ^
  --zip-file fileb://lambda-export-excel.zip ^
  --region us-west-2

if %ERRORLEVEL% NEQ 0 (
  echo Error actualizando lambda de Excel
  pause
  exit /b 1
)

echo.
echo Actualizando Lambda de Export PDF...
aws lambda update-function-code ^
  --function-name PartidoConservadorExportPDF ^
  --zip-file fileb://lambda-export-pdf.zip ^
  --region us-west-2

if %ERRORLEVEL% NEQ 0 (
  echo Error actualizando lambda de PDF
  pause
  exit /b 1
)

echo.
echo ========================================
echo Lambdas actualizadas exitosamente
echo ========================================
pause
