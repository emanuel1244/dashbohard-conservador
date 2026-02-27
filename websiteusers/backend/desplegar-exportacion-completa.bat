@echo off
echo ========================================
echo Despliegue Completo - Exportacion y Reportes
echo ========================================
echo.
echo Este script desplegara:
echo 1. Lambda Export Excel
echo 2. Lambda Export PDF
echo 3. Endpoints en API Gateway
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
echo DESPLIEGUE COMPLETADO!
echo ========================================
echo.
echo Endpoints disponibles:
echo - Excel: https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel
echo - PDF: https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf
echo.
echo SIGUIENTE PASO:
echo 1. Probar los endpoints con Postman
echo 2. Compilar el frontend: cd ../partido-conservador-dashboard ^&^& npm run build
echo 3. Iniciar el frontend: npm start
echo.

pause
