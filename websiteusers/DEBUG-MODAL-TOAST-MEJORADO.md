# 🔧 Debug Modal y Toast - Mejoras Implementadas

## Problema Reportado

El usuario reportó que:
1. ❌ Al crear persona: Modal no se cierra, botón se queda en "Guardando...", no aparece toast
2. ❌ Al editar persona: Toast apareció una vez pero ya no aparece más
3. ❌ Al eliminar persona: Modal de confirmación aparece pero no muestra toast de éxito

## Diagnóstico

El problema sugiere que las solicitudes HTTP no están completando correctamente. Posibles causas:
- Backend no responde
- Timeout de red
- Error CORS
- Lambda function no está funcionando
- API Gateway no está configurado correctamente

## Soluciones Implementadas

### 1. ✅ Timeout de 30 Segundos

Agregado timeout de 30 segundos a todas las operaciones HTTP:
- Si la solicitud tarda más de 30 segundos, se cancela automáticamente
- Se muestra mensaje de error: "La solicitud tardó demasiado tiempo. Verifica tu conexión o intenta nuevamente."
- Esto previene que el botón se quede en "Guardando..." indefinidamente

### 2. ✅ Logging Detallado

Agregados console.log extensivos para debugging:

**Al guardar persona:**
```
=== INICIO GUARDAR PERSONA ===
Datos del formulario: {...}
Es edición: true/false
POST/PUT Request a: https://...
=== ÉXITO EN GUARDAR === (si funciona)
Respuesta del servidor: {...}
Mostrando toast: Usuario creado correctamente
Recargando datos...
=== REQUEST COMPLETADO ===
```

**En caso de error:**
```
=== ERROR EN GUARDAR ===
Error completo: {...}
Status: 500
Message: ...
Error body: {...}
```

**Al eliminar:**
```
=== INICIO ELIMINAR PERSONA ===
DELETE Request a: https://...
=== ÉXITO: Persona eliminada ===
```

### 3. ✅ Imports RxJS

Agregados imports necesarios:
```typescript
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
```

### 4. ✅ Manejo de Timeout

Todas las operaciones HTTP ahora usan:
```typescript
.pipe(
  timeout(30000), // 30 segundos
  catchError(error => {
    if (error.name === 'TimeoutError') {
      return throwError(() => ({
        status: 0,
        message: 'La solicitud tardó demasiado tiempo...'
      }));
    }
    return throwError(() => error);
  })
)
```

## Cómo Probar y Diagnosticar

### Paso 1: Abrir Consola del Navegador

1. Presiona F12 en el navegador
2. Ve a la pestaña "Console"
3. Limpia la consola (botón 🚫 o Ctrl+L)

### Paso 2: Intentar Crear una Persona

1. Haz clic en "Agregar Persona"
2. Llena los campos requeridos (Nombre y Cédula)
3. Haz clic en "Guardar"
4. **OBSERVA LA CONSOLA** - Deberías ver:

**Si funciona correctamente:**
```
=== INICIO GUARDAR PERSONA ===
Datos del formulario: {...}
Es edición: false
POST Request a: https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/personas
=== ÉXITO EN GUARDAR ===
Respuesta del servidor: {...}
Mostrando toast: Usuario creado correctamente
Recargando datos...
=== REQUEST COMPLETADO ===
```

**Si hay error de red:**
```
=== INICIO GUARDAR PERSONA ===
POST Request a: https://...
=== ERROR EN GUARDAR ===
Error completo: HttpErrorResponse {...}
Status: 0
Message: Http failure response for https://...: 0 Unknown Error
```

**Si hay timeout:**
```
=== INICIO GUARDAR PERSONA ===
POST Request a: https://...
=== TIMEOUT: La solicitud tardó más de 30 segundos ===
=== ERROR EN GUARDAR ===
```

**Si hay error del backend:**
```
=== INICIO GUARDAR PERSONA ===
POST Request a: https://...
=== ERROR EN GUARDAR ===
Status: 500
Error body: {error: "Internal server error"}
```

### Paso 3: Verificar Backend

Si ves errores, verifica:

#### A. Backend está corriendo
```bash
# Verificar que las Lambda functions existen
aws lambda list-functions --region us-west-2 | findstr personas
```

Deberías ver:
- lambda-personas-create
- lambda-personas-update
- lambda-personas-delete
- lambda-personas-list

#### B. API Gateway está configurado
```bash
# Verificar endpoints
aws apigatewayv2 get-apis --region us-west-2
```

Busca el API ID: `t6km5ha4e3`

#### C. CORS está configurado
El error más común es CORS. Si ves en la consola:
```
Access to XMLHttpRequest at 'https://...' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

Entonces necesitas configurar CORS en API Gateway.

#### D. Probar endpoint directamente

Abre una nueva pestaña del navegador y ve a:
```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/personas
```

Deberías ver:
- ✅ Una lista de personas en formato JSON
- ❌ Error 403 Forbidden → Problema de CORS o permisos
- ❌ Error 502 Bad Gateway → Lambda no está funcionando
- ❌ Error 404 Not Found → Endpoint no existe

### Paso 4: Verificar Red

En la consola del navegador:
1. Ve a la pestaña "Network" (Red)
2. Intenta crear una persona
3. Busca la solicitud a `/personas`
4. Haz clic en ella y revisa:
   - **Status Code**: Debería ser 200 o 201
   - **Response**: Debería tener datos JSON
   - **Headers**: Verifica que tenga `Access-Control-Allow-Origin`

## Posibles Problemas y Soluciones

### Problema 1: Status 0 - Error de Red

**Síntomas:**
- Status: 0
- Message: "Http failure response for https://...: 0 Unknown Error"

**Causas:**
- Backend no está corriendo
- URL incorrecta
- Problema de CORS
- Firewall bloqueando

**Solución:**
1. Verifica que el backend esté desplegado
2. Verifica la URL en `apiUrl`
3. Configura CORS en API Gateway
4. Desactiva temporalmente firewall/antivirus

### Problema 2: Status 502 - Bad Gateway

**Síntomas:**
- Status: 502
- Message: "Bad Gateway"

**Causas:**
- Lambda function tiene error
- Lambda timeout (más de 30 segundos)
- Lambda no tiene permisos a DynamoDB

**Solución:**
1. Revisa logs de CloudWatch:
```bash
aws logs tail /aws/lambda/lambda-personas-create --follow --region us-west-2
```

2. Verifica permisos IAM de la Lambda
3. Aumenta timeout de Lambda si es necesario

### Problema 3: Status 403 - Forbidden

**Síntomas:**
- Status: 403
- Message: "Forbidden"

**Causas:**
- CORS no configurado
- API Key requerida pero no enviada
- Permisos IAM incorrectos

**Solución:**
1. Configura CORS en API Gateway
2. Verifica que no requiera API Key
3. Revisa permisos de la Lambda

### Problema 4: Status 500 - Internal Server Error

**Síntomas:**
- Status: 500
- Message del backend con detalles

**Causas:**
- Error en el código de la Lambda
- Error de DynamoDB
- Datos inválidos

**Solución:**
1. Revisa logs de CloudWatch
2. Verifica que la tabla DynamoDB existe
3. Verifica formato de datos enviados

### Problema 5: Timeout después de 30 segundos

**Síntomas:**
- Mensaje: "La solicitud tardó demasiado tiempo..."

**Causas:**
- Lambda está tardando mucho
- Problema de red lenta
- Lambda en cold start

**Solución:**
1. Aumenta memoria de Lambda (más memoria = más CPU)
2. Usa Provisioned Concurrency para evitar cold starts
3. Optimiza código de Lambda

## Archivos Modificados

### `dashboard.component.ts`
- ✅ Agregados imports: `timeout`, `catchError`, `throwError`
- ✅ Agregado timeout de 30 segundos a todas las operaciones HTTP
- ✅ Agregado logging detallado en todas las operaciones
- ✅ Mejorado manejo de errores con información específica

## Próximos Pasos

1. **Abre la consola del navegador (F12)**
2. **Intenta crear una persona**
3. **Copia y pega TODOS los mensajes de la consola aquí**
4. **Toma screenshot de la pestaña Network mostrando la solicitud**
5. **Reporta qué ves exactamente**

Con esa información podremos identificar exactamente qué está fallando:
- ¿El request se envía?
- ¿Qué status code devuelve?
- ¿Hay error de CORS?
- ¿El backend responde?
- ¿Cuánto tiempo tarda?

## Comandos Útiles para Debugging

### Ver logs de Lambda en tiempo real
```bash
# Personas Create
aws logs tail /aws/lambda/lambda-personas-create --follow --region us-west-2

# Personas Update
aws logs tail /aws/lambda/lambda-personas-update --follow --region us-west-2

# Personas Delete
aws logs tail /aws/lambda/lambda-personas-delete --follow --region us-west-2
```

### Probar Lambda directamente
```bash
# Test crear persona
aws lambda invoke --function-name lambda-personas-create --region us-west-2 --payload "{\"body\":\"{\\\"nombre\\\":\\\"Test\\\",\\\"cedula\\\":\\\"123\\\"}\"}" response.json
cat response.json
```

### Ver configuración de API Gateway
```bash
aws apigatewayv2 get-api --api-id t6km5ha4e3 --region us-west-2
aws apigatewayv2 get-routes --api-id t6km5ha4e3 --region us-west-2
```

---

**Fecha**: Hoy
**Estado**: ✅ Mejoras implementadas, esperando feedback del usuario
**Siguiente acción**: Usuario debe abrir consola del navegador y reportar qué ve
