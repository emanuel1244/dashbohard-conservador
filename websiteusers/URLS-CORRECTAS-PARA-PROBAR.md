# 🎯 URLs Correctas para Probar Exportaciones

## ❌ URL INCORRECTA que usaste:
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/personas
```
**Error:** `{"message":"Missing Authentication Token"}`
**Razón:** Este endpoint NO existe

---

## ✅ URLs CORRECTAS para probar:

### 📊 1. Exportar TODAS las Personas a Excel
**Copia y pega esta URL en tu navegador:**
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
```
**Resultado esperado:** Se descarga un archivo `personas-TIMESTAMP.xlsx`

---

### 📊 2. Exportar Líderes a Excel
**Copia y pega esta URL en tu navegador:**
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=lideres
```
**Resultado esperado:** Se descarga un archivo `lideres-TIMESTAMP.xlsx`

---

### 📄 3. Reporte General PDF
**Copia y pega esta URL en tu navegador:**
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-general
```
**Resultado esperado:** Se descarga un archivo `reporte-general-TIMESTAMP.pdf`

---

## 🎨 MEJOR FORMA DE PROBAR: Usar el Dashboard

En lugar de probar las URLs directamente, es MUCHO MEJOR probar desde el dashboard:

### Paso 1: Abre el Dashboard
```
http://localhost:4200
```

### Paso 2: Prueba los Botones de Excel
1. Ve a la vista "Personas" (👥)
2. Haz clic en el botón **"📊 Exportar a Excel"**
3. Debería descargarse un archivo Excel con todas las personas

### Paso 3: Prueba los Botones de PDF
1. En la misma vista "Personas"
2. Haz clic en el botón **"📄 Reporte General PDF"**
3. Debería descargarse un archivo PDF con el reporte general

### Paso 4: Prueba Exportar por Líder
1. Ve a la vista "Líderes" (⭐)
2. En cualquier tarjeta de líder, haz clic en **"📊 Excel"**
3. Debería descargarse un Excel con las personas de ese líder
4. Haz clic en **"📄 PDF"**
5. Debería descargarse un PDF con el reporte del líder

### Paso 5: Prueba Certificados y Listados
1. Ve a la vista "Mesas" (🗳️)
2. Haz clic en cualquier institución
3. Se abre un modal con las personas
4. Prueba los botones:
   - **"📄 Certificado"** (en cada persona)
   - **"📄 Generar Listado PDF"** (al final del modal)
   - **"📄 Certificados Múltiples"** (al final del modal)

---

## 🔍 Verificar si Funciona

### Si se descarga el archivo:
✅ **¡FUNCIONA!** El endpoint está correctamente configurado

### Si sale error en el navegador:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Haz clic en el botón de exportar
4. Busca la petición que falló
5. Haz clic en ella y ve a la pestaña "Response"
6. Copia el mensaje de error y envíamelo

### Si no pasa nada:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes de error en rojo
4. Copia los errores y envíamelos

---

## 📝 Notas Importantes

1. **Necesitas tener datos en DynamoDB** para que las exportaciones funcionen
2. Si no tienes datos, primero carga algunos usando el botón "📤 Cargar Datos desde Excel"
3. Los endpoints están configurados correctamente (lo verifiqué)
4. El error que tuviste fue porque usaste una URL incorrecta

---

## 🚀 Resumen Rápido

**Para probar AHORA MISMO:**

1. Abre: `http://localhost:4200`
2. Ve a "Personas"
3. Haz clic en "📊 Exportar a Excel"
4. Si se descarga un archivo → ✅ FUNCIONA
5. Si no se descarga → Abre F12 y mira los errores

**URLs para probar directamente en el navegador:**
- Excel: `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas`
- PDF: `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-general`

---

## ✅ Endpoints Verificados

Confirmé que estos endpoints EXISTEN en API Gateway:
- ✅ `/api/export/excel` con método GET
- ✅ `/api/export/pdf` con método GET
- ✅ CORS configurado
- ✅ Binary media types configurados

**El sistema está listo para usar. Solo necesitas probar desde el dashboard o usar las URLs correctas.**
