@echo off
echo ========================================
echo   PROBAR LAMBDA LOCALMENTE
echo   Serverless Offline
echo ========================================
echo.

echo Instalando serverless-offline si no esta instalado...
call npm install --save-dev serverless-offline

echo.
echo Iniciando servidor local en http://localhost:3000
echo.
echo Endpoints disponibles:
echo   POST http://localhost:3000/dev/api/upload-excel
echo   GET  http://localhost:3000/dev/api/personas
echo   GET  http://localhost:3000/dev/api/estadisticas
echo   GET  http://localhost:3000/dev/api/lideres
echo   POST http://localhost:3000/dev/api/lideres
echo   PUT  http://localhost:3000/dev/api/lideres/{id}
echo   DELETE http://localhost:3000/dev/api/lideres/{id}
echo.
echo Presiona Ctrl+C para detener
echo.

call serverless offline start
