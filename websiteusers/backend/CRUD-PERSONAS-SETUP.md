# Setup CRUD de Personas - Backend AWS

## 📋 Resumen

Se ha actualizado la Lambda `PartidoConservadorPersonas` para soportar operaciones CRUD completas con validaciones robustas.

## ✨ Nuevas Funcionalidades

### Endpoints Implementados

1. **POST /api/personas** - Crear nueva persona
   - Validación de campos requeridos (nombre, cédula)
   - Validación de formato de email
   - Validación de formato de teléfono (solo números)
   - Detección de cédulas duplicadas
   - Validación de límite de caracteres en notas (1000)
   - Valores por defecto: estado='Activo', nivelCompromiso='Medio'

2. **PUT /api/personas/{id}** - Actualizar persona existente
   - Todas las validaciones del POST
   - Verificación de existencia de persona
   - Actualización de timestamp automática
   - Actualización de fecha de asignación si cambia el líder

3. **DELETE /api/personas/{id}** - Eliminar persona
   - Verificación de existencia
   - Limpieza de asignación de líder
   - Respuesta de confirmación

4. **PUT /api/personas/{id}/asignar-lider** - Asignar líder
   - Guarda liderId y liderNombre
   - Registra fecha de asignación automáticamente

### Validaciones Implementadas

```javascript
// Campos requeridos
- nombre: no puede estar vacío
- cedula: no puede estar vacía, debe ser única

// Formatos
- correo: debe ser email válido (regex)
- celular: solo números
- estado: 'Activo' | 'Inactivo' | 'Potencial'
- nivelCompromiso: 'Alto' | 'Medio' | 'Bajo'
- notas: máximo 1000 caracteres

// Duplicados
- cedula: verifica que no exista en la base de datos
```

### Estructura de Persona

```javascript
{
  id: string,                    // Generado automáticamente
  cedula: string,                // Requerido, único
  nombre: string,                // Requerido
  celular: string,               // Opcional
  correo: string,                // Opcional, validado
  direccion: string,             // Opcional
  mesa: string,                  // Opcional
  lugarVotacion: string,         // Opcional
  direccionLugarVotacion: string,// Opcional
  zona: string,                  // Opcional
  liderId: string,               // Opcional
  liderNombre: string,           // Opcional
  estado: string,                // Default: 'Activo'
  nivelCompromiso: string,       // Default: 'Medio'
  notas: string,                 // Opcional, max 1000 chars
  fechaAsignacion: string,       // ISO timestamp
  fechaActualizacion: string,    // ISO timestamp
  fechaCreacion: string          // ISO timestamp
}
```

## 🚀 Pasos para Desplegar

### 1. Actualizar Lambda

```bash
cd backend
.\actualizar-lambda-personas-crud.bat
```

Este script:
- Crea un paquete con las dependencias
- Genera el ZIP
- Actualiza la Lambda en AWS
- Limpia archivos temporales

### 2. Crear Endpoint POST en API Gateway

```bash
.\crear-endpoint-post-personas.bat
```

**IMPORTANTE:** Antes de ejecutar, edita el archivo y reemplaza:
- `YOUR_ACCOUNT_ID` con tu AWS Account ID

Este script:
- Crea el método POST en /api/personas
- Configura la integración con Lambda
- Configura CORS
- Da permisos a API Gateway
- Despliega los cambios

### 3. Verificar Endpoints Existentes

Los siguientes endpoints ya deberían estar configurados:
- ✅ GET /api/personas
- ✅ GET /api/personas/{id}
- ✅ PUT /api/personas/{id}
- ✅ DELETE /api/personas/{id}

Si falta alguno, usa los scripts existentes en la carpeta backend.

## 🧪 Probar los Endpoints

### Crear Persona

```bash
curl -X POST https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "cedula": "1234567890",
    "celular": "3001234567",
    "correo": "juan@example.com",
    "mesa": "5",
    "lugarVotacion": "IE MARIA AUXILIADORA",
    "estado": "Activo",
    "nivelCompromiso": "Alto",
    "notas": "Persona muy comprometida"
  }'
```

### Actualizar Persona

```bash
curl -X PUT https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/personas/PERSONA_ID \
  -H "Content-Type: application/json" \
  -d '{
    "celular": "3009876543",
    "estado": "Activo",
    "notas": "Actualización de contacto"
  }'
```

### Eliminar Persona

```bash
curl -X DELETE https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/personas/PERSONA_ID
```

### Asignar Líder

```bash
curl -X PUT https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/personas/PERSONA_ID/asignar-lider \
  -H "Content-Type: application/json" \
  -d '{
    "liderId": "lider-123",
    "liderNombre": "María García"
  }'
```

## 📊 Respuestas de la API

### Éxito (201 Created)

```json
{
  "success": true,
  "persona": { /* objeto persona */ },
  "message": "Persona creada exitosamente"
}
```

### Error de Validación (400 Bad Request)

```json
{
  "error": "Campos requeridos faltantes",
  "details": {
    "nombre": "El nombre es requerido",
    "cedula": "La cédula es requerida"
  }
}
```

### Cédula Duplicada (409 Conflict)

```json
{
  "error": "Cédula duplicada",
  "details": {
    "cedula": "Esta cédula ya está registrada en el sistema"
  }
}
```

### No Encontrado (404 Not Found)

```json
{
  "error": "Persona no encontrada"
}
```

## 🔧 Troubleshooting

### Error: Lambda no se actualiza

```bash
# Verificar que la Lambda existe
aws lambda get-function --function-name PartidoConservadorPersonas --region us-west-2

# Ver logs
aws logs tail /aws/lambda/PartidoConservadorPersonas --follow --region us-west-2
```

### Error: Endpoint POST no funciona

```bash
# Verificar que el método existe
aws apigateway get-method --rest-api-id t6km5ha4e3 --resource-id RESOURCE_ID --http-method POST --region us-west-2

# Verificar permisos
aws lambda get-policy --function-name PartidoConservadorPersonas --region us-west-2
```

### Error: CORS

```bash
# Reconfigurar CORS
.\backend\configurar-cors-api-gateway.bat
```

## 📝 Próximos Pasos

Una vez desplegado el backend, continuar con:

1. ✅ Tarea 1: Backend CRUD - COMPLETADA
2. ⏳ Tarea 2: Crear modal de formulario en frontend
3. ⏳ Tarea 3: Implementar validaciones en frontend
4. ⏳ Tarea 4: Conectar formulario con API

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs de CloudWatch
2. Verifica que los endpoints estén desplegados
3. Prueba con Postman o curl
4. Revisa la configuración de CORS

---

**Última actualización:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
