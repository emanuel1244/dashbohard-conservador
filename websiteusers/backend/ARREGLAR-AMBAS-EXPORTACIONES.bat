@echo off
echo ========================================
echo Arreglando Lambdas de Exportacion
echo ========================================
echo.
echo Este script actualizara ambas lambdas:
echo 1. Lambda Export Excel
echo 2. Lambda Export PDF
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

echo.
echo ========================================
echo PASO 1: Arreglando Lambda Export Excel
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0ARREGLAR-EXPORT-EXCEL.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Fallo al actualizar Lambda Export Excel
    pause
    exit /b 1
)

echo.
echo ========================================
echo PASO 2: Arreglando Lambda Export PDF
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0ARREGLAR-EXPORT-PDF.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Fallo al actualizar Lambda Export PDF
    pause
    exit /b 1
)

echo.
echo ========================================
echo AMBAS LAMBDAS ACTUALIZADAS EXITOSAMENTE!
echo ========================================
echo.
echo Endpoints para probar:
echo.
echo Excel:
echo https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
echo.
echo PDF:
echo https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-general
echo.
pause
