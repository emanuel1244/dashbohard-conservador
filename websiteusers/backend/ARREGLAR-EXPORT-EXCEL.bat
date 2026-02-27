@echo off
echo ========================================
echo Arreglando Lambda Export Excel
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0ARREGLAR-EXPORT-EXCEL.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Proceso completado exitosamente!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Error en el proceso. Codigo: %ERRORLEVEL%
    echo ========================================
)

pause
