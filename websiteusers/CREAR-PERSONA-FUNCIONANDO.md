# ✅ Crear Persona - Funcionando

## Problema Resuelto

El endpoint POST `/api/personas` estaba dando error 403 y CORS por dos problemas:

1. **Account ID incorrecto**: La integración usaba `891377310481` en lugar de `431655581275`
2. **AWS SDK incompatible**: `lambda-personas-simple.js` usaba `aws-sdk` v2 que no está disponible en Node.js 18

## Solución Aplicada

### 1. Corregido Account ID en API Gateway ✅
```bash
aws apigateway put-integration \
  --rest-api-id t6km5ha4e3 \
  --resource-id m89gfs \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-west-2:lambda:path/2015-03-31/functions/arn:aws:lambda:us-west-2:431655581275:function:partido-conservador-createPersona/invocations"
```

### 2. Creado Nueva Lambda con AWS SDK v3 ✅

**Archivo**: `backend/lambda-personas-create.js`

- Usa `@aws-sdk/client-dynamodb` y `@aws-sdk/lib-dynamodb` (v3)
- Compatible con Node.js 18.x runtime
- Mantiene toda la lógica de validación:
  - Campos requeridos (nombre, cedula)
  - Formato de email
  - Formato de teléfono (solo números)
  - Límite de 1000 caracteres en notas
  - Detección de cédulas duplicadas
- Headers CORS correctos

### 3. Actualizada Lambda en AWS ✅
```bash
# Actualizar código
aws lambda update-function-code \
  --function-name partido-conservador-createPersona \
  --zip-file fileb://lambda-personas-create.zip

# Actualizar handler
aws lambda update-function-configuration \
  --function-name partido-conservador-createPersona \
  --handler lambda-personas-create.handler
```

### 4. Desplegado en API Gateway ✅
```bash
aws apigateway create-deployment \
  --rest-api-id t6km5ha4e3 \
  --stage-name prod \
  --description "Fix createPersona Account ID"
```

## Estado Actual

✅ Lambda: `partido-conservador-createPersona`
✅ Handler: `lambda-personas-create.handler`
✅ Runtime: Node.js 18.x
✅ Account ID: 431655581275 (correcto)
✅ CORS: Configurado
✅ Endpoint: `POST https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/personas`

## Prueba Exitosa

```bash
POST /api/personas
{
  "nombre": "Test Usuario",
  "cedula": "999888777"
}

Response 201:
{
  "success": true,
  "persona": {
    "id": "persona-1772033965840-63wo8yref",
    "cedula": "999888777",
    "nombre": "Test Usuario",
    "celular": "",
    "correo": "",
    ...
  },
  "message": "Persona creada exitosamente"
}
```

## Archivos Importantes

- `backend/lambda-personas-create.js` - Lambda con AWS SDK v3 (USAR ESTE)
- `backend/lambda-personas-simple.js` - Versión antigua con SDK v2 (NO USAR)
- `backend/arreglar-create-persona.bat` - Script de despliegue

## Próximos Pasos

Ahora puedes:
1. Abrir el dashboard en `http://localhost:4200`
2. Ir a la sección "Personas"
3. Hacer clic en "Agregar Persona"
4. Llenar el formulario
5. Guardar

El formulario ya está implementado en el frontend y ahora el backend funciona correctamente.
