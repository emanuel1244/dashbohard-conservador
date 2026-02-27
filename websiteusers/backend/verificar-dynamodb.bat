@echo off
echo ========================================
echo Verificar datos en DynamoDB
echo ========================================
echo.
echo Consultando tabla de Personas...
aws dynamodb scan --table-name PartidoConservadorPersonas --limit 5 --region us-west-2 --query "Items[*].[nombre.S, cedula.S, liderNombre.S]" --output table

echo.
echo Consultando tabla de Líderes...
aws dynamodb scan --table-name PartidoConservadorPersonasLideres --limit 5 --region us-west-2 --query "Items[*].[nombre.S, personasAsignadas.N]" --output table

echo.
echo ========================================
echo Verificación completada
echo ========================================
pause
