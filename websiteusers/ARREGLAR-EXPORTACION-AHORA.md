# 🚨 ARREGLAR EXPORTACIÓN AHORA

## ⚡ SOLUCIÓN RÁPIDA

### El Problema
Las Lambdas de exportación están fallando con **Error 502** porque les faltan las dependencias npm (ExcelJS y PDFKit).

### La Solución
Ejecuta este comando:

```bash
cd backend
SOLUCION-RAPIDA-EXPORTACION.bat
```

**Tiempo:** 2-3 minutos

---

## 📋 QUÉ HACE EL SCRIPT

```
1. Crea directorio temporal
2. Instala dependencias npm:
   - exceljs (para Excel)
   - pdfkit (para PDF)
   - @aws-sdk/* (para DynamoDB)
3. Empaqueta Lambdas con dependencias
4. Despliega a AWS
5. Limpia archivos temporales
```

---

## ✅ DESPUÉS DE EJECUTAR

### Espera 10 segundos
AWS necesita tiempo para actualizar las Lambdas.

### Prueba en el navegador

#### Opción 1: URL Directa
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
```
**Resultado:** Se descarga un archivo `.xlsx` ✅

#### Opción 2: Dashboard
1. Abre `http://localhost:4200`
2. Ve a "Personas" (👥)
3. Haz clic en "📊 Exportar a Excel"
4. **Resultado:** Se descarga un archivo `.xlsx` ✅

---

## 🐛 SI NO FUNCIONA

### Ver logs de Lambda
```bash
aws logs tail /aws/lambda/partido-conservador-export-excel --region us-west-2 --follow
```

### Ejecutar el script nuevamente
A veces AWS tarda en actualizar. Ejecuta el script otra vez:
```bash
cd backend
SOLUCION-RAPIDA-EXPORTACION.bat
```

---

## 📊 ANTES vs DESPUÉS

### ANTES (Error 502)
```
❌ Lambda sin dependencias
❌ Error 502 Bad Gateway
❌ Error CORS
❌ No se descarga nada
```

### DESPUÉS (Funcionando)
```
✅ Lambda con dependencias
✅ Respuesta 200 OK
✅ Headers CORS correctos
✅ Archivo se descarga
```

---

## 🎯 RESUMEN

1. **Ejecuta:** `backend\SOLUCION-RAPIDA-EXPORTACION.bat`
2. **Espera:** 2-3 minutos
3. **Prueba:** Abre el dashboard y exporta a Excel
4. **Resultado:** ✅ Archivo descargado

**¡Hazlo ahora!** 🚀
