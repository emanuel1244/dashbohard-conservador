# ✅ Solución Error 502 - Lambda Actualizada

## 🐛 Problema Identificado

El error 502 era causado por:
```
Error: Cannot find module 'xlsx'
```

### Causa:
El ZIP que subí a Lambda solo contenía el código JavaScript, pero NO las dependencias de `node_modules` (específicamente el módulo `xlsx` que se usa para leer archivos Excel).

---

## ✅ Solución Aplicada

1. **Instalé las dependencias:**
   ```bash
   npm install --production
   ```

2. **Creé el ZIP correctamente con node_modules:**
   ```bash
   Compress-Archive -Path lambda-upload-excel-multipart.js,lambda-package.json,node_modules -DestinationPath lambda-function.zip
   ```

3. **Actualicé la Lambda en AWS:**
   ```bash
   aws lambda update-function-code --function-name partido-conservador-uploadExcel --zip-file fileb://lambda-function.zip --region us-west-2
   ```

---

## 📊 Estado Actual

```
✅ Función: partido-conservador-uploadExcel
✅ Estado: Active
✅ Última Actualización: Successful
✅ Tamaño del código: 19,842,269 bytes (~19 MB)
✅ Región: us-west-2
✅ Dependencias incluidas: xlsx, aws-sdk
```

---

## 🧪 Probar Ahora

### 1. El frontend ya está corriendo en:
```
http://localhost:4200
```

### 2. Sube tu Excel:
- Click en "📤 Cargar Excel"
- Selecciona tu archivo
- ¡Ahora debería funcionar correctamente!

### 3. O usa el archivo de ejemplo:
He creado `plantilla-personas.csv` que puedes:
1. Abrir en Excel
2. Guardar como `.xlsx`
3. Subir al sistema

---

## 📋 Formato del Excel

Tu Excel debe tener estas columnas (primera fila):

### Requeridas:
- `NOMBRE Y APELLIDOS` (o variaciones: Nombre, nombre, NOMBRE)
- `Cedula` (o variaciones: Cédula, cedula, CEDULA, CC, Documento)

### Opcionales:
- `LUGAR DE VOTACION`
- `DIRECCION L VOTACION`
- `MESA`
- `DIRECCION`
- `Correo`
- `Celular`

---

## 🔍 Verificar que Funciona

### Ver logs en tiempo real:
```bash
aws logs tail /aws/lambda/partido-conservador-uploadExcel --region us-west-2 --follow
```

Ahora deberías ver logs como:
```
Procesando 21 filas del Excel
Columnas detectadas: ['NOMBRE Y APELLIDOS', 'Cedula', 'LUGAR DE VOTACION', ...]
Primera fila de datos: {...}
Guardadas 21 personas en DynamoDB
```

En lugar de:
```
Error: Cannot find module 'xlsx'
```

---

## 📊 Respuesta Esperada

Ahora cuando subas el Excel, deberías recibir:

```json
{
  "success": true,
  "mensaje": "Archivo procesado correctamente",
  "estadisticas": {
    "totalProcesadas": 21,
    "agregadas": 21,
    "duplicados": 0,
    "errores": 0
  },
  "personas": [...]
}
```

---

## 🛠️ Script Actualizado

El script `actualizar-lambda-upload.bat` ahora incluye automáticamente las dependencias:

```bash
cd backend
actualizar-lambda-upload.bat
```

---

## ✅ Checklist de Verificación

- [x] Dependencias instaladas (node_modules)
- [x] ZIP creado con node_modules incluido
- [x] Lambda actualizada en AWS
- [x] Estado: Active y Successful
- [x] Tamaño: ~19 MB (antes era 3 KB)
- [x] Módulo xlsx disponible
- [ ] Probar carga de Excel
- [ ] Verificar que las personas se procesen correctamente

---

## 🎯 Diferencia Clave

### ANTES (❌):
```
lambda-function.zip (3 KB)
├── lambda-upload-excel-multipart.js
└── lambda-package.json
```

### AHORA (✅):
```
lambda-function.zip (19 MB)
├── lambda-upload-excel-multipart.js
├── lambda-package.json
└── node_modules/
    ├── xlsx/
    ├── aws-sdk/
    └── ... (todas las dependencias)
```

---

## 💡 Lección Aprendida

Cuando despliegas funciones Lambda que usan módulos npm, SIEMPRE debes incluir la carpeta `node_modules` en el ZIP. Lambda no instala dependencias automáticamente.

---

## 🎉 ¡Listo para Probar!

Ahora sí, todo debería funcionar correctamente. Ve a:

**http://localhost:4200**

Y sube tu Excel. El error 502 ya no debería aparecer.

---

**Fecha de solución:** 23 de febrero de 2026, 4:12 PM
**Región:** us-west-2 (Oregon)
**Función actualizada:** partido-conservador-uploadExcel
**Tamaño del código:** 19.8 MB
