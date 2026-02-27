@echo off
echo ========================================
echo DESPLIEGUE COMPLETO DE EXPORTACION
echo ========================================
echo.
echo Este script desplegara:
echo 1. Lambda Export Excel
echo 2. Endpoint /api/export/excel
echo 3. Lambda Export PDF
echo 4. Endpoint /api/export/pdf
echo.
pause

echo.
echo ========================================
echo PASO 1: Desplegando Lambda Export Excel
echo ========================================
call desplegar-export-excel.bat

echo.
echo ========================================
echo PASO 2: Configurando Endpoint Excel
echo ========================================
call configurar-endpoint-export-excel.bat

echo.
echo ========================================
echo PASO 3: Desplegando Lambda Export PDF
echo ========================================
call desplegar-export-pdf.bat

echo.
echo ========================================
echo PASO 4: Configurando Endpoint PDF
echo ========================================
call configurar-endpoint-export-pdf.bat

echo.
echo ========================================
echo DESPLIEGUE COMPLETO FINALIZADO
echo ========================================
echo.
echo Endpoints disponibles:
echo.
echo Excel: https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel
echo PDF:   https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf
echo.
echo Ahora puedes probar desde el frontend en http://localhost:4200
echo.
pause
