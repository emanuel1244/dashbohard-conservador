@echo off
echo ========================================
echo   DASHBOARD PARTIDO CONSERVADOR
echo ========================================
echo.
echo Iniciando Backend (Puerto 3000)...
echo.

start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo.
echo Iniciando Frontend (Puerto 4200)...
echo.

start cmd /k "cd partido-conservador-dashboard && npm start"

echo.
echo ========================================
echo   SERVIDORES INICIADOS
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
