# ⚡ Instrucciones Rápidas

## ✅ PROBLEMA RESUELTO

El error 502 estaba causado por falta del módulo `xlsx` en la Lambda.
**Ya está solucionado** - Lambda actualizada con todas las dependencias.

---

## 🎯 Para Probar AHORA:

### 1️⃣ El frontend ya está corriendo en:
```
http://localhost:4200
```

Abre tu navegador y ve a esa URL.

### 2️⃣ Sube tu Excel:
- Click en "📤 Cargar Excel"
- Selecciona tu archivo Excel
- ¡Ahora funcionará correctamente!

**O usa el archivo de ejemplo:**
- Abre `plantilla-personas.csv` en Excel
- Guárdalo como `.xlsx`
- Súbelo al sistema

---

## ✅ ¿Qué se arregló?

### Error 502 - Módulo 'xlsx' no encontrado
**Causa:** El ZIP de Lambda no incluía las dependencias de node_modules.
**Solución:** Actualicé el ZIP con todas las dependencias (xlsx, aws-sdk, etc.)

### Detección automática de columnas
La Lambda ahora detecta automáticamente las columnas de tu Excel, aunque tengan nombres diferentes.

**Tu Excel con columnas:**
- `NOMBRE Y APELLIDOS` ✅
- `Cedula` ✅
- `LUGAR DE VOTACION` ✅
- etc.

**Ahora funciona perfectamente!**

---

## 🔍 Ver qué está pasando:

Si quieres ver los logs mientras procesas:

```bash
aws logs tail /aws/lambda/partido-conservador-uploadExcel --region us-west-2 --follow
```

---

## 📊 Resultado Esperado:

```
✅ 21 personas procesadas
✅ 21 agregadas
✅ 0 errores
```

---

## 🆘 Si algo falla:

1. Verifica que el frontend esté corriendo en http://localhost:4200
2. Revisa los logs de Lambda (comando arriba)
3. Abre la consola del navegador (F12) para ver errores

---

## 🎉 ¡Eso es todo!

**La aplicación está lista para usar.**

---

**API Gateway:** https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api
**Región:** us-west-2 (Oregon)
**Lambda actualizada:** ✅ partido-conservador-uploadExcel
