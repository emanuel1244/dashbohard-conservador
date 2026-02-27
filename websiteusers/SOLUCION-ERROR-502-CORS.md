# 🔧 SOLUCIÓN - Error 502 y CORS en Exportación

## 📅 Fecha: 2026-02-25

---

## ❌ PROBLEMA IDENTIFICADO

### Error 1: CORS
```
Access to fetch at 'https://...execute-api.../api/export/excel' 
from origin 'http://localhost:4200' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Error 2: 502 Bad Gateway
```
GET https://...execute-api.../api/export/excel?type=personas&filters=%7B%7D 
net::ERR_FAILED 502 (Bad Gateway)
```

---

## 🔍 CAUSA DEL PROBLEMA

### Error 502 (Principal)
Las Lambdas `partido-conservador-export-excel` y `partido-conservador-export-pdf` están fallando porque **les faltan las dependencias npm**:

- ❌ `exceljs` - Para generar archivos Excel
- ❌ `pdfkit` - Para generar archivos PDF
- ❌ `@aws-sdk/client-dynamodb` - Para consultar DynamoDB
- ❌ `@aws-sdk/lib-dynamodb` - Para consultar DynamoDB

Cuando desplegamos las Lambdas, solo subimos el archivo `.js` pero **NO las dependencias** en `node_modules`.

### Error CORS (Secundario)
El error CORS aparece **porque la Lambda falla primero** (502). Si la Lambda funcionara correctamente, devolvería los headers CORS correctos que ya están en el código.

---

## ✅ SOLUCIÓN

### Opción 1: Script Automático (RECOMENDADO)

Ejecuta el script que creé:

```bash
cd backend
SOLUCION-RAPIDA-EXPORTACION.bat
```

Este script:
1. Crea un directorio temporal
2. Instala todas las dependencias npm necesarias
3. Empaqueta las Lambdas con sus dependencias
4. Despliega las Lambdas actualizadas a AWS

**Tiempo estimado:** 2-3 minutos

---

### Opción 2: Manual (Si el script falla)

#### Paso 1: Crear directorio con dependencias
```bash
cd backend
mkdir lambda-export-temp
cd lambda-export-temp
```

#### Paso 2: Crear package.json
```json
{
  "dependencies": {
    "exceljs": "^4.3.0",
    "pdfkit": "^0.13.0",
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0"
  }
}
```

#### Paso 3: Instalar dependencias
```bash
npm install
```

#### Paso 4: Copiar archivos Lambda
```bash
copy ..\lambda-export-excel.js .
copy ..\lambda-export-pdf.js .
```

#### Paso 5: Crear ZIPs
```powershell
# Excel
Compress-Archive -Path lambda-export-excel.js, node_modules -DestinationPath lambda-export-excel.zip -Force

# PDF
Compress-Archive -Path lambda-export-pdf.js, node_modules -DestinationPath lambda-export-pdf.zip -Force
```

#### Paso 6: Desplegar a AWS
```bash
# Excel
aws lambda update-function-code ^
    --function-name partido-conservador-export-excel ^
    --zip-file fileb://lambda-export-excel.zip ^
    --region us-west-2

# PDF
aws lambda update-function-code ^
    --function-name partido-conservador-export-pdf ^
    --zip-file fileb://lambda-export-pdf.zip ^
    --region us-west-2
```

#### Paso 7: Limpiar
```bash
cd ..
rmdir /s /q lambda-export-temp
```

---

## 🧪 VERIFICACIÓN

### 1. Verificar que las Lambdas se actualizaron
```bash
aws lambda get-function --function-name partido-conservador-export-excel --region us-west-2
aws lambda get-function --function-name partido-conservador-export-pdf --region us-west-2
```

Busca la fecha de `LastModified` - debe ser reciente.

### 2. Probar desde el navegador

#### Prueba Excel:
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
```

**Resultado esperado:** Se descarga un archivo `.xlsx`

#### Prueba PDF:
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-general
```

**Resultado esperado:** Se descarga un archivo `.pdf`

### 3. Probar desde el Dashboard

1. Abre `http://localhost:4200`
2. Ve a "Personas" (👥)
3. Haz clic en "📊 Exportar a Excel"
4. **Resultado esperado:** Se descarga un archivo `.xlsx`
5. Haz clic en "📄 Reporte General PDF"
6. **Resultado esperado:** Se descarga un archivo `.pdf`

---

## 🐛 SI AÚN NO FUNCIONA

### Verificar logs de Lambda

```bash
# Ver logs de Excel
aws logs tail /aws/lambda/partido-conservador-export-excel --region us-west-2 --follow

# Ver logs de PDF
aws logs tail /aws/lambda/partido-conservador-export-pdf --region us-west-2 --follow
```

Busca errores como:
- `Cannot find module 'exceljs'`
- `Cannot find module 'pdfkit'`
- `Cannot find module '@aws-sdk/client-dynamodb'`

### Verificar tamaño del ZIP

Las Lambdas con dependencias son más grandes:
- Sin dependencias: ~10 KB
- Con dependencias: ~5-10 MB

```bash
# Ver tamaño del código
aws lambda get-function --function-name partido-conservador-export-excel --region us-west-2 --query 'Configuration.CodeSize'
```

Si el tamaño es menor a 1 MB, las dependencias NO se subieron correctamente.

### Aumentar timeout de Lambda

Si las Lambdas tardan mucho:

```bash
# Aumentar timeout a 30 segundos
aws lambda update-function-configuration ^
    --function-name partido-conservador-export-excel ^
    --timeout 30 ^
    --region us-west-2

aws lambda update-function-configuration ^
    --function-name partido-conservador-export-pdf ^
    --timeout 30 ^
    --region us-west-2
```

### Aumentar memoria de Lambda

Si hay errores de memoria:

```bash
# Aumentar memoria a 512 MB
aws lambda update-function-configuration ^
    --function-name partido-conservador-export-excel ^
    --memory-size 512 ^
    --region us-west-2

aws lambda update-function-configuration ^
    --function-name partido-conservador-export-pdf ^
    --memory-size 512 ^
    --region us-west-2
```

---

## 📊 RESUMEN

### Problema
- ❌ Error 502: Lambdas fallan por falta de dependencias npm
- ❌ Error CORS: Aparece como consecuencia del 502

### Solución
- ✅ Empaquetar Lambdas con dependencias npm
- ✅ Desplegar ZIPs completos a AWS
- ✅ Verificar que funcionen

### Archivos Necesarios
```
lambda-export-excel.zip
├── lambda-export-excel.js
└── node_modules/
    ├── exceljs/
    ├── @aws-sdk/
    └── ...

lambda-export-pdf.zip
├── lambda-export-pdf.js
└── node_modules/
    ├── pdfkit/
    ├── @aws-sdk/
    └── ...
```

---

## 🚀 SIGUIENTE PASO

**Ejecuta el script de solución:**

```bash
cd backend
SOLUCION-RAPIDA-EXPORTACION.bat
```

**Espera 2-3 minutos** para que:
1. Se instalen las dependencias
2. Se creen los ZIPs
3. Se desplieguen las Lambdas
4. AWS actualice las funciones

**Luego prueba:**
1. Abre `http://localhost:4200`
2. Ve a "Personas"
3. Haz clic en "📊 Exportar a Excel"
4. Debería descargarse un archivo `.xlsx` ✅

---

## 📞 SOPORTE

Si después de ejecutar el script aún tienes problemas:

1. Copia los logs de la consola del script
2. Copia los logs de Lambda (comando arriba)
3. Toma captura de pantalla del error en el navegador
4. Comparte toda la información

**¡Vamos a resolverlo!** 💪
