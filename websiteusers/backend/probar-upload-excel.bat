@echo off
echo ========================================
echo Prueba de Upload Excel con API Gateway
echo ========================================
echo.
echo Este script te ayudará a probar la Lambda con un archivo Excel real.
echo.
echo INSTRUCCIONES:
echo 1. Abre Postman o usa curl
echo 2. Configura una petición POST a:
echo    https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/upload-excel
echo.
echo 3. En el Body, selecciona "form-data"
echo 4. Agrega un campo llamado "file" de tipo "File"
echo 5. Selecciona tu archivo Excel (plantilla-personas.csv o similar)
echo 6. Envía la petición
echo.
echo RESULTADO ESPERADO:
echo - Status Code: 200
echo - Respuesta JSON con estadísticas de personas procesadas
echo - Sin errores de "Cannot find module"
echo.
echo ========================================
echo.
echo Presiona cualquier tecla para ver los logs en tiempo real...
pause

echo.
echo Mostrando logs de CloudWatch (últimos 5 minutos)...
aws logs tail /aws/lambda/partido-conservador-uploadExcel --since 5m --follow --region us-west-2
