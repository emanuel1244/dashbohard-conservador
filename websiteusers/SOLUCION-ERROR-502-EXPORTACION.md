# 🔧 Solución Error 502 - Exportación

**Error:** `502 Bad Gateway` y `CORS policy: No 'Access-Control-Allow-Origin' header`

**Causa:** Las Lambdas de exportación no están desplegadas o los endpoints no están configurados en API Gateway.

---

## 🚀 SOLUCIÓN RÁPIDA (Opción 1)

Ejecuta este script que hace todo automáticamente:

```bash
cd backend
DESPLEGAR-TODO-EXPORTACION.bat
```

Este script:
1. ✅ Despliega Lambda Export Excel
2. ✅ Configura endpoint `/api/export/excel`
3. ✅ Despliega Lambda Export PDF
4. ✅ Configura endpoint `/api/export/pdf`

**Tiempo estimado:** 5-10 minutos

---

## 🔍 SOLUCIÓN PASO A PASO (Opción 2)

### Paso 1: Verificar Estado Actual

```bash
cd backend
VERIFICAR-Y-DESPLEGAR-EXPORTACION.bat
```

Este script te dirá qué falta.

### Paso 2: Desplegar Lambdas

Si las Lambdas no existen:

```bash
# Lambda Excel
desplegar-export-excel.bat

# Lambda PDF
desplegar-export-pdf.bat
```

### Paso 3: Configurar Endpoints

Si los endpoints no están configurados:

```bash
# Endpoint Excel
configurar-endpoint-export-excel.bat

# Endpoint PDF
configurar-endpoint-export-pdf.bat
```

---

## ✅ VERIFICACIÓN

Después de desplegar, verifica que funcione:

### Opción A: Desde el navegador

Abre estas URLs directamente:

**Excel:**
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
```

**PDF:**
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-general
```

**Resultado esperado:**
- ✅ Se descarga un archivo
- ❌ NO debe mostrar error 502
- ❌ NO debe mostrar error CORS

### Opción B: Desde el frontend

1. Abre `http://localhost:4200`
2. Ve a "Personas"
3. Clic en "📊 Exportar a Excel"
4. Debe descargarse el archivo sin errores

---

## 🐛 TROUBLESHOOTING

### Error: "Lambda no existe"

**Solución:**
```bash
cd backend
desplegar-export-excel.bat
desplegar-export-pdf.bat
```

### Error: "Endpoint no configurado"

**Solución:**
```bash
cd backend
configurar-endpoint-export-excel.bat
configurar-endpoint-export-pdf.bat
```

### Error: "Access Denied" al desplegar

**Causa:** No tienes permisos AWS configurados

**Solución:**
```bash
aws configure
```

Ingresa:
- AWS Access Key ID
- AWS Secret Access Key
- Region: `us-west-2`

### Error persiste después de desplegar

**Solución:**
1. Espera 30 segundos (propagación de cambios)
2. Refresca el navegador (Ctrl+F5)
3. Verifica logs de CloudWatch:
   ```bash
   aws logs tail /aws/lambda/partido-conservador-export-excel --follow --region us-west-2
   ```

---

## 📊 VERIFICAR LOGS

### Ver logs de Lambda Excel:
```bash
aws logs tail /aws/lambda/partido-conservador-export-excel --follow --region us-west-2
```

### Ver logs de Lambda PDF:
```bash
aws logs tail /aws/lambda/partido-conservador-export-pdf --follow --region us-west-2
```

**Logs esperados cuando funciona:**
```
Event: {...}
Export type: personas Filters: {}
Found 150 records
Generated filename: personas_completo_20260225_143022.xlsx
```

---

## 🎯 RESUMEN

**Problema:** Error 502 + CORS
**Causa:** Lambdas no desplegadas o endpoints no configurados
**Solución:** Ejecutar `DESPLEGAR-TODO-EXPORTACION.bat`

**Después de desplegar:**
- ✅ Las URLs de exportación deben funcionar
- ✅ El frontend debe poder descargar archivos
- ✅ No debe haber errores 502 ni CORS

---

## 📞 AYUDA ADICIONAL

Si después de seguir estos pasos el error persiste:

1. **Verifica que las Lambdas existen:**
   ```bash
   aws lambda list-functions --region us-west-2 --query "Functions[?contains(FunctionName, 'export')].FunctionName"
   ```

2. **Verifica que los endpoints existen:**
   ```bash
   aws apigateway get-resources --rest-api-id t6km5ha4e3 --region us-west-2 --query "items[?contains(path, 'export')].{Path:path,Id:id}"
   ```

3. **Verifica los logs de CloudWatch** (ver comandos arriba)

4. **Comparte los errores específicos** que veas en los logs

---

**IMPORTANTE:** Después de desplegar, espera 30 segundos antes de probar para que los cambios se propaguen en AWS.
