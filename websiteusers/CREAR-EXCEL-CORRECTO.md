# 📊 Cómo Crear el Excel Correcto

## ✅ El Frontend Ya Está Corriendo

Tu aplicación ya está activa en: **http://localhost:4200**

---

## 📝 Formato del Excel

### Opción 1: Usar el CSV de Ejemplo

He creado un archivo `plantilla-personas.csv` que puedes:

1. Abrir en Excel
2. Guardar como `.xlsx`
3. Subir directamente al sistema

### Opción 2: Crear tu Propio Excel

Crea un archivo Excel con estas columnas (primera fila):

| NOMBRE Y APELLIDOS | Cedula | LUGAR DE VOTACION | DIRECCION L VOTACION | MESA | DIRECCION | Correo | Celular |
|-------------------|--------|-------------------|---------------------|------|-----------|--------|---------|

### Ejemplo de Datos:

```
NOMBRE Y APELLIDOS: Emanuel Camargo
Cedula: 22047777
LUGAR DE VOTACION: IE MARIA AUXILIADORA
DIRECCION L VOTACION: Cl. 11 #13-74
MESA: 4
DIRECCION: Calle 9 #10-45
Correo: ecamargo@example.com
Celular: 3045664700
```

---

## 🎯 Columnas Requeridas (Mínimo)

Solo necesitas estas 2 columnas obligatorias:

1. **NOMBRE Y APELLIDOS** (o variaciones: Nombre, nombre, NOMBRE)
2. **Cedula** (o variaciones: Cédula, cedula, CEDULA, CC, Documento)

Las demás columnas son opcionales.

---

## ✅ Variaciones de Nombres de Columnas Soportadas

El sistema detecta automáticamente estas variaciones:

### Nombre (requerido):
- `NOMBRE Y APELLIDOS` ✅
- `Nombre y Apellidos` ✅
- `nombre` ✅
- `Nombre` ✅
- `NOMBRE` ✅

### Cédula (requerido):
- `Cedula` ✅
- `Cédula` ✅
- `cedula` ✅
- `CEDULA` ✅
- `CC` ✅
- `Documento` ✅

### Lugar de Votación (opcional):
- `LUGAR DE VOTACION` ✅
- `Lugar de Votacion` ✅
- `lugarVotacion` ✅

### Dirección Votación (opcional):
- `DIRECCION L VOTACION` ✅
- `Direccion L Votacion` ✅
- `direccionVotacion` ✅

### Mesa (opcional):
- `MESA` ✅
- `Mesa` ✅
- `mesa` ✅
- `Puesto` ✅

### Dirección (opcional):
- `DIRECCION` ✅
- `Direccion` ✅
- `direccion` ✅
- `Dirección` ✅

### Correo (opcional):
- `Correo` ✅
- `correo` ✅
- `Email` ✅
- `email` ✅
- `E-mail` ✅

### Celular (opcional):
- `Celular` ✅
- `celular` ✅
- `Telefono` ✅
- `Teléfono` ✅
- `Movil` ✅

---

## 🚀 Cómo Probar

### 1. Abre el navegador:
```
http://localhost:4200
```

### 2. Sube el Excel:
- Click en "📤 Cargar Excel"
- Selecciona tu archivo `.xlsx` o el `plantilla-personas.csv` convertido a Excel
- Click en "⬆️ Subir Archivo"

### 3. Verifica el resultado:
Deberías ver:
```
✅ Archivo procesado correctamente
📊 Total procesadas: 10
✅ Agregadas: 10
⚠️ Duplicados: 0
❌ Errores: 0
```

---

## 🔍 Probar con Postman (Alternativa)

Si prefieres probar directamente la API:

### Endpoint:
```
POST https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/upload-excel
```

### Headers:
```
Content-Type: multipart/form-data
```

### Body:
- Tipo: `form-data`
- Key: `file`
- Value: Selecciona tu archivo Excel

---

## 🐛 Si Recibes Error 502

El error 502 generalmente significa:

1. **Lambda timeout** - La función tardó más de 30 segundos
2. **Error en el código** - Hay un problema procesando el Excel
3. **Problema de memoria** - El archivo es muy grande

### Solución:

1. **Verifica los logs:**
```bash
aws logs tail /aws/lambda/partido-conservador-uploadExcel --region us-west-2 --follow
```

2. **Prueba con un archivo pequeño:**
   - Usa el `plantilla-personas.csv` con solo 10 filas
   - Convierte a Excel
   - Sube nuevamente

3. **Verifica el formato:**
   - Asegúrate de que la primera fila tenga los nombres de columnas
   - Verifica que no haya filas vacías al inicio
   - Confirma que el archivo sea `.xlsx` o `.xls`

---

## 📋 Checklist de Verificación

Antes de subir tu Excel, verifica:

- [ ] La primera fila tiene los nombres de las columnas
- [ ] Tienes al menos las columnas: `NOMBRE Y APELLIDOS` y `Cedula`
- [ ] No hay filas vacías al inicio
- [ ] El archivo es `.xlsx` o `.xls`
- [ ] Los datos están completos (nombre y cédula en cada fila)
- [ ] El frontend está corriendo en http://localhost:4200

---

## 🎯 Ejemplo Completo en Excel

Crea un archivo Excel así:

**Fila 1 (Headers):**
```
NOMBRE Y APELLIDOS | Cedula | LUGAR DE VOTACION | MESA | Correo | Celular
```

**Fila 2 (Datos):**
```
Emanuel Camargo | 22047777 | IE MARIA AUX | 4 | email@example.com | 3045664700
```

**Fila 3 (Datos):**
```
Maria Rodriguez | 1234567890 | COLEGIO SAN JOSE | 12 | maria@example.com | 3101234567
```

Y así sucesivamente...

---

## 💡 Tip

Si tu Excel actual tiene columnas con nombres diferentes, no te preocupes. El sistema ahora detecta automáticamente variaciones comunes. Solo asegúrate de que tenga al menos:

- Una columna con el nombre (cualquier variación)
- Una columna con la cédula (cualquier variación)

---

## 🎉 ¡Listo!

Con esto deberías poder crear y subir tu Excel correctamente.

**URL del Dashboard:** http://localhost:4200
**API Gateway:** https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api

---

**Si sigues teniendo problemas, comparte:**
1. Los logs de Lambda (comando arriba)
2. El mensaje de error exacto
3. Las primeras 2 filas de tu Excel
