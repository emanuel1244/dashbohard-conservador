# Solución Lambda Layers - Dependencias xlsx

## Problema Identificado

La función Lambda `partido-conservador-uploadExcel` estaba fallando con el error:
```
Error: Cannot find module 'xlsx'
```

Este error ocurría porque las dependencias npm (xlsx) no estaban disponibles en el runtime de la Lambda.

## Solución Implementada

Se implementó una solución usando **Lambda Layers** para proporcionar las dependencias necesarias a la función Lambda.

### ¿Qué es un Lambda Layer?

Un Lambda Layer es un archivo ZIP que contiene bibliotecas, dependencias o código adicional que puede ser compartido entre múltiples funciones Lambda. Los Layers permiten:
- Reducir el tamaño del código de la Lambda
- Compartir dependencias entre múltiples funciones
- Actualizar dependencias sin modificar el código de la Lambda

### Estructura del Layer

```
lambda-layer/
└── nodejs/
    ├── node_modules/
    │   └── xlsx/
    └── package.json
```

La estructura `nodejs/node_modules/` es requerida por AWS Lambda para que las dependencias estén disponibles automáticamente.

## Pasos Realizados

### 1. Creación del Layer

```bash
cd backend
.\crear-layer.bat
```

Este script:
- Crea la estructura de directorios correcta
- Instala las dependencias (xlsx)
- Empaqueta todo en `lambda-layer.zip`

### 2. Despliegue del Layer a AWS

```bash
.\desplegar-layer.bat
```

Este script:
- Sube el Layer a AWS Lambda
- Publica una nueva versión
- Guarda el ARN del Layer en `layer-arn.txt`

**ARN del Layer:** `arn:aws:lambda:us-west-2:431655581275:layer:nodejs-dependencies-layer:1`

### 3. Asociación del Layer a la Lambda

```bash
.\asociar-layer.bat
```

Este script:
- Lee el ARN del Layer
- Actualiza la configuración de la Lambda
- Asocia el Layer a la función

### 4. Verificación

```bash
.\verificar-layer.bat
```

Este script revisa los logs de CloudWatch para confirmar que no hay errores de módulos faltantes.

## Resultado

✅ **Layer creado exitosamente** (4.7 MB)
✅ **Layer desplegado en AWS**
✅ **Layer asociado a la Lambda**
✅ **Lambda ejecutándose sin errores**
✅ **Módulo xlsx disponible y funcionando**

### Logs de Verificación

```
2026-02-27T19:29:35 START RequestId: bfa7582f-2c1c-49ad-b950-82251eee634c
2026-02-27T19:29:35 INFO Event: { "httpMethod": "OPTIONS", ... }
2026-02-27T19:29:35 END RequestId: bfa7582f-2c1c-49ad-b950-82251eee634c
2026-02-27T19:29:35 REPORT Duration: 5.58 ms Memory Used: 115 MB
```

**No hay errores de "Cannot find module"** ✅

## Scripts Disponibles

### Script Maestro (Recomendado)
```bash
.\desplegar-layer-completo.bat
```
Ejecuta todos los pasos automáticamente: crear, desplegar, asociar y verificar.

### Scripts Individuales

1. **crear-layer.bat** - Crea el Layer localmente
2. **desplegar-layer.bat** - Sube el Layer a AWS
3. **asociar-layer.bat** - Asocia el Layer a la Lambda
4. **verificar-layer.bat** - Revisa logs de CloudWatch
5. **probar-upload-excel.bat** - Guía para probar con archivo real
6. **verificar-dynamodb.bat** - Verifica datos guardados

## Cómo Actualizar Dependencias

Si necesitas actualizar o agregar dependencias en el futuro:

1. Edita `backend/lambda-layer/nodejs/package.json`
2. Agrega o actualiza las dependencias
3. Ejecuta `.\desplegar-layer-completo.bat`

Ejemplo para agregar una nueva dependencia:
```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "nueva-dependencia": "^1.0.0"
  }
}
```

## Pruebas

### Prueba con Postman

1. URL: `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/upload-excel`
2. Método: POST
3. Body: form-data
4. Campo: `file` (tipo File)
5. Archivo: Selecciona tu Excel

### Resultado Esperado

```json
{
  "success": true,
  "mensaje": "Archivo procesado correctamente",
  "lider": {
    "id": "lider-1234567890",
    "nombre": "Emanuel Camargo Quintero",
    "personasAsignadas": 20
  },
  "estadisticas": {
    "totalProcesadas": 20,
    "agregadas": 20,
    "duplicados": 0,
    "errores": 0
  }
}
```

## Configuración de la Lambda

- **Nombre:** partido-conservador-uploadExcel
- **Runtime:** Node.js 20.x
- **Handler:** lambda-upload-excel-multipart.handler
- **Memory:** 512 MB
- **Timeout:** 30 segundos
- **Layer:** nodejs-dependencies-layer:1

## Troubleshooting

### Si ves errores de "Cannot find module"

1. Verifica que el Layer esté asociado:
   ```bash
   aws lambda get-function-configuration --function-name partido-conservador-uploadExcel --region us-west-2 --query "Layers"
   ```

2. Re-asocia el Layer:
   ```bash
   .\asociar-layer.bat
   ```

### Si el Layer no se crea correctamente

1. Verifica que npm esté instalado
2. Elimina `node_modules` y vuelve a instalar:
   ```bash
   cd lambda-layer\nodejs
   rmdir /s /q node_modules
   npm install
   ```

### Si el despliegue falla

1. Verifica tus credenciales de AWS
2. Confirma que tienes permisos para crear Layers
3. Revisa que el archivo ZIP no exceda 50 MB

## Archivos Generados

- `backend/lambda-layer.zip` - Layer empaquetado
- `backend/layer-arn.json` - Respuesta completa de AWS
- `backend/layer-arn.txt` - ARN del Layer (texto plano)
- `backend/response.json` - Respuesta de prueba de invocación

## Referencias

- [AWS Lambda Layers Documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [Node.js Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html)
- [xlsx Library](https://www.npmjs.com/package/xlsx)
