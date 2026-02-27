@echo off
echo ========================================
echo DESPLIEGUE COMPLETO DE LAMBDA LAYER
echo ========================================
echo.
echo Este script ejecutará los siguientes pasos:
echo 1. Crear Layer (instalar dependencias y empaquetar)
echo 2. Desplegar Layer a AWS
echo 3. Asociar Layer a la Lambda
echo 4. Verificar logs de CloudWatch
echo.
pause

echo.
echo ========================================
echo PASO 1: Creando Layer...
echo ========================================
call crear-layer.bat
if errorlevel 1 (
    echo ERROR: Fallo al crear el Layer
    pause
    exit /b 1
)

echo.
echo ========================================
echo PASO 2: Desplegando Layer a AWS...
echo ========================================
call desplegar-layer.bat
if errorlevel 1 (
    echo ERROR: Fallo al desplegar el Layer
    pause
    exit /b 1
)

echo.
echo ========================================
echo PASO 3: Asociando Layer a Lambda...
echo ========================================
call asociar-layer.bat
if errorlevel 1 (
    echo ERROR: Fallo al asociar el Layer
    pause
    exit /b 1
)

echo.
echo ========================================
echo PASO 4: Verificando logs...
echo ========================================
call verificar-layer.bat

echo.
echo ========================================
echo DESPLIEGUE COMPLETO FINALIZADO
echo ========================================
echo.
echo Ahora puedes probar la Lambda subiendo un archivo Excel.
echo.
pause
