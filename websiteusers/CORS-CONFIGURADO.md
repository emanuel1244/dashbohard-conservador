# ✅ CORS Configurado en API Gateway

## 🐛 Problema

```
Access to fetch at 'https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/lideres' 
from origin 'http://localhost:4200' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solución Aplicada

Configuré el método OPTIONS en API Gateway para el endpoint `/api/lideres`:

1. **Creado método OPTIONS** con autorización NONE
2. **Configurada integración MOCK** para responder automáticamente
3. **Agregados headers CORS** en la respuesta:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
4. **Desplegado** a producción (stage: prod)

## 📋 Configuración Aplicada

### API Gateway
- **API ID**: t6km5ha4e3
- **Resource ID**: mhquqb
- **Path**: /api/lideres
- **Método**: OPTIONS
- **Tipo**: MOCK (responde automáticamente sin llamar a Lambda)

### Headers CORS
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
```

## 🧪 Probar Ahora

### 1. Recarga el dashboard
```
http://localhost:4200
```

### 2. Intenta crear un líder
- Ve a "⭐ Líderes"
- Click en "➕ Nuevo Líder"
- Completa el formulario:
  - Nombre: Emanuel Camargo
  - Cédula: 22047777
  - Celular: 3045664700
  - Correo: ecamargo@example.com
  - Zona: Norte
- Click en "Guardar"

### 3. Debería funcionar
- El líder se creará correctamente
- Aparecerá en la lista
- No habrá error de CORS

## 🔍 Verificar en la Consola del Navegador

Abre la consola (F12) y ve a la pestaña "Network":

1. **Verás 2 peticiones:**
   - `OPTIONS /api/lideres` (preflight) - Status: 200
   - `POST /api/lideres` (crear líder) - Status: 200

2. **La petición OPTIONS debe tener estos headers en la respuesta:**
   ```
   access-control-allow-origin: *
   access-control-allow-methods: GET,POST,PUT,DELETE,OPTIONS
   access-control-allow-headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
   ```

## 📝 Comandos Usados

```powershell
# 1. Crear método OPTIONS
aws apigateway put-method --rest-api-id t6km5ha4e3 --resource-id mhquqb --http-method OPTIONS --authorization-type NONE --region us-west-2

# 2. Configurar integración MOCK
aws apigateway put-integration --rest-api-id t6km5ha4e3 --resource-id mhquqb --http-method OPTIONS --type MOCK --request-templates file://cors-config.json --region us-west-2

# 3. Configurar respuesta del método
aws apigateway put-method-response --rest-api-id t6km5ha4e3 --resource-id mhquqb --http-method OPTIONS --status-code 200 --response-parameters file://method-response-params.json --region us-west-2

# 4. Configurar respuesta de integración
aws apigateway put-integration-response --rest-api-id t6km5ha4e3 --resource-id mhquqb --http-method OPTIONS --status-code 200 --response-parameters file://integration-response-params.json --region us-west-2

# 5. Desplegar cambios
aws apigateway create-deployment --rest-api-id t6km5ha4e3 --stage-name prod --region us-west-2
```

## 🎯 Resultado Esperado

Cuando crees un líder, deberías ver en la consola:

```
POST https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/lideres
Status: 200 OK

Response:
{
  "id": "lider-1708718400000",
  "nombre": "Emanuel Camargo",
  "cedula": "22047777",
  "celular": "3045664700",
  "correo": "ecamargo@example.com",
  "zona": "Norte",
  "personasAsignadas": 0,
  "fechaCreacion": "2026-02-23T21:42:00.000Z"
}
```

## ✅ Estado Final

- ✅ Método OPTIONS configurado en `/api/lideres`
- ✅ Headers CORS agregados
- ✅ Integración MOCK configurada
- ✅ Cambios desplegados a producción
- ✅ Listo para crear líderes sin errores de CORS

## 🆘 Si Aún No Funciona

1. **Limpia la caché del navegador:**
   - Ctrl + Shift + Delete
   - Selecciona "Caché"
   - Click en "Borrar datos"

2. **Recarga la página con Ctrl + F5**

3. **Verifica en la consola del navegador:**
   - Pestaña "Network"
   - Busca la petición OPTIONS
   - Verifica que tenga status 200
   - Verifica que tenga los headers CORS

4. **Si sigue fallando, revisa los logs:**
```bash
aws logs tail /aws/lambda/partido-conservador-createLider --region us-west-2 --follow
```

---

**Fecha de configuración:** 23 de febrero de 2026, 4:42 PM
**API Gateway:** t6km5ha4e3
**Endpoint:** /api/lideres
**Deployment ID:** hq0w1o
