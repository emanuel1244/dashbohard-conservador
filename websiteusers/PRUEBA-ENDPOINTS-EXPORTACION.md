# Guía de Prueba - Endpoints de Exportación

## ❌ Error Encontrado

**URL Incorrecta:** `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/personas`
**Error:** `{"message":"Missing Authentication Token"}`

**Causa:** El endpoint `/api/export/personas` no existe. Los endpoints correctos son:
- `/api/export/excel`
- `/api/export/pdf`

## ✅ URLs Correctas para Probar

### Base URL
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api
```

### 1. Exportar Personas a Excel (Lista Completa)
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
```

### 2. Exportar Personas por Líder a Excel
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas&liderId=LIDER_ID&liderNombre=NOMBRE_LIDER
```

### 3. Exportar Líderes a Excel
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=lideres
```

### 4. Reporte General PDF
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-general
```

### 5. Reporte de Líder PDF
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-lider&liderId=LIDER_ID&liderNombre=NOMBRE_LIDER
```

### 6. Certificado Individual PDF
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=certificado&personaId=PERSONA_ID&personaNombre=NOMBRE_PERSONA
```

### 7. Certificados Múltiples PDF
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=certificado&personas=[{"id":"ID1","nombre":"NOMBRE1"},{"id":"ID2","nombre":"NOMBRE2"}]
```

### 8. Listado de Mesa PDF
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=listado-mesa&mesa=NUMERO_MESA
```

## 🧪 Cómo Probar desde el Navegador

### Opción 1: Usar el Dashboard (Recomendado)
1. Abre el dashboard en tu navegador
2. Ve a la vista de "Personas"
3. Haz clic en los botones:
   - "📊 Exportar a Excel" - Exporta todas las personas
   - "📄 Reporte General PDF" - Genera reporte general

4. Ve a la vista de "Líderes"
5. En cada tarjeta de líder, haz clic en:
   - "📊 Excel" - Exporta personas del líder
   - "📄 PDF" - Genera reporte del líder

6. Ve a la vista de "Mesas"
7. Haz clic en una institución para abrir el modal
8. En el modal, prueba:
   - "📄 Certificado" (en cada persona)
   - "📄 Generar Listado PDF"
   - "📄 Certificados Múltiples"

### Opción 2: Probar Directamente en el Navegador
**IMPORTANTE:** Solo funciona si tienes datos en DynamoDB.

1. Copia una de las URLs de arriba
2. Pégala en la barra de direcciones del navegador
3. Presiona Enter
4. El archivo debería descargarse automáticamente

**Ejemplo con datos reales:**
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
```

## 🔍 Verificar Endpoints en API Gateway

Para verificar que los endpoints están configurados correctamente:

```bash
# Listar recursos de API Gateway
aws apigateway get-resources --rest-api-id t6km5ha4e3 --region us-west-2

# Verificar método GET en /export/excel
aws apigateway get-method --rest-api-id t6km5ha4e3 --resource-id RESOURCE_ID --http-method GET --region us-west-2
```

## 📊 Respuestas Esperadas

### Éxito (200 OK)
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (Excel)
- **Content-Type:** `application/pdf` (PDF)
- **Body:** Archivo binario (base64 encoded)
- **Headers:** `Content-Disposition: attachment; filename="..."`

### Sin Datos (404 Not Found)
```json
{
  "error": "No se encontraron datos para exportar"
}
```

### Error del Servidor (500 Internal Server Error)
```json
{
  "error": "Error al generar el archivo",
  "details": "..."
}
```

### Endpoint No Existe (403 Forbidden)
```json
{
  "message": "Missing Authentication Token"
}
```
**Solución:** Verifica que estás usando la URL correcta.

## 🐛 Troubleshooting

### Problema: "Missing Authentication Token"
**Causa:** URL incorrecta o endpoint no configurado
**Solución:** 
1. Verifica que usas `/api/export/excel` o `/api/export/pdf`
2. No uses `/api/export/personas` (no existe)

### Problema: CORS Error
**Causa:** Falta configuración CORS en API Gateway
**Solución:** Ya está configurado, pero si persiste:
```bash
cd backend
configurar-cors-api-gateway.bat
```

### Problema: 502 Bad Gateway
**Causa:** Lambda no responde o tiene error
**Solución:** 
1. Verifica logs de CloudWatch
2. Verifica que las Lambdas están desplegadas:
```bash
aws lambda get-function --function-name partido-conservador-export-excel --region us-west-2
aws lambda get-function --function-name partido-conservador-export-pdf --region us-west-2
```

### Problema: Archivo no se descarga
**Causa:** Falta configuración de binary media types
**Solución:** Ya está configurado en API Gateway con:
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `application/pdf`

## ✅ Checklist de Verificación

Antes de probar, verifica:

- [ ] Las Lambdas están desplegadas:
  - `partido-conservador-export-excel`
  - `partido-conservador-export-pdf`

- [ ] Los endpoints están configurados en API Gateway:
  - GET `/api/export/excel`
  - GET `/api/export/pdf`

- [ ] CORS está configurado correctamente

- [ ] Binary media types están configurados:
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `application/pdf`

- [ ] Hay datos en DynamoDB para exportar

## 🎯 Prueba Rápida

**La forma más fácil de probar:**

1. Abre el dashboard: `http://localhost:4200`
2. Ve a "Personas"
3. Haz clic en "📊 Exportar a Excel"
4. Si se descarga un archivo Excel, ¡funciona! ✅
5. Haz clic en "📄 Reporte General PDF"
6. Si se descarga un archivo PDF, ¡funciona! ✅

**Si no funciona desde el dashboard:**
- Abre la consola del navegador (F12)
- Ve a la pestaña "Network"
- Haz clic en el botón de exportar
- Verifica la URL que se está llamando
- Verifica el código de respuesta HTTP
- Verifica el mensaje de error

## 📝 Notas Importantes

1. **Los endpoints NO requieren autenticación** (por ahora)
2. **Los parámetros se pasan por query string** (?param=value)
3. **Las respuestas son archivos binarios** (no JSON)
4. **El frontend maneja la descarga automáticamente** (ExportService)
5. **Los nombres de archivo incluyen timestamp** para evitar sobrescribir

## 🔗 Enlaces Útiles

- **API Gateway Console:** https://console.aws.amazon.com/apigateway/
- **Lambda Console:** https://console.aws.amazon.com/lambda/
- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/
- **DynamoDB Console:** https://console.aws.amazon.com/dynamodb/
