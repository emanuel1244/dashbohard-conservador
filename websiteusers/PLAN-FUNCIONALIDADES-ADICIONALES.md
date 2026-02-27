# Plan de Implementación - Funcionalidades Adicionales

## ✅ Fase 1: Backend - Gestión Avanzada de Personas (COMPLETADO)

### 1.1 Lambda Personas Actualizada
- ✅ Handler principal con routing completo
- ✅ GET /personas - Listar todas
- ✅ GET /personas/{id} - Obtener una específica
- ✅ PUT /personas/{id} - Actualizar persona
- ✅ DELETE /personas/{id} - Eliminar persona
- ✅ PUT /personas/{id}/asignar-lider - Asignar líder

### 1.2 Nuevos Campos en Personas
```javascript
{
  // Campos existentes
  id, cedula, nombre, celular, correo, direccion, mesa, lugarVotacion, zona,
  
  // Nuevos campos
  liderId: string,              // ID del líder asignado
  liderNombre: string,          // Nombre del líder (desnormalizado)
  estado: 'Activo' | 'Inactivo' | 'Potencial',
  nivelCompromiso: 'Alto' | 'Medio' | 'Bajo',
  notas: string,                // Observaciones
  fechaAsignacion: string,      // ISO timestamp
  fechaActualizacion: string,   // ISO timestamp
  historialAsignaciones: [{     // Historial de cambios
    liderId: string,
    fecha: string,
    accion: string
  }]
}
```

### 1.3 Lambda Export Excel
- ✅ Exportar todas las personas
- ✅ Exportar por líder específico
- ✅ Exportar por zona
- ✅ Exportar por mesa
- ✅ Formato CSV con todos los campos

## 📋 Fase 2: API Gateway - Nuevos Endpoints

### Endpoints a Crear:
```bash
# Personas
PUT    /api/personas/{id}                    # Actualizar persona
DELETE /api/personas/{id}                    # Eliminar persona
PUT    /api/personas/{id}/asignar-lider      # Asignar líder
GET    /api/personas/{id}                    # Obtener persona

# Exportar
GET    /api/export/personas                  # Exportar todas
GET    /api/export/personas?liderId=xxx      # Por líder
GET    /api/export/personas?zona=xxx         # Por zona
GET    /api/export/personas?mesa=xxx         # Por mesa

# Autenticación Líderes (Fase 3)
POST   /api/auth/login                       # Login líder
GET    /api/lideres/{id}/panel               # Panel del líder
```

### Scripts de Despliegue:
- ✅ `actualizar-personas-lambda.bat` - Actualizar Lambda personas
- ✅ `crear-endpoints-personas.bat` - Crear endpoints en API Gateway

## 🎨 Fase 3: Frontend - Nuevas Funcionalidades

### 3.1 Gestión de Personas Mejorada
```typescript
// Nuevas interfaces
interface PersonaExtendida extends Persona {
  liderId?: string;
  liderNombre?: string;
  estado: 'Activo' | 'Inactivo' | 'Potencial';
  nivelCompromiso: 'Alto' | 'Medio' | 'Bajo';
  notas?: string;
}

// Nuevos métodos
asignarLider(personaId: string, liderId: string)
actualizarEstado(personaId: string, estado: string)
actualizarCompromiso(personaId: string, nivel: string)
agregarNota(personaId: string, nota: string)
```

### 3.2 Modal de Edición de Persona
- Formulario completo con todos los campos
- Selector de líder (dropdown)
- Selector de estado (Activo/Inactivo/Potencial)
- Selector de nivel de compromiso
- Campo de notas/observaciones
- Historial de asignaciones

### 3.3 Filtros Avanzados
- Filtrar por líder asignado
- Filtrar por estado
- Filtrar por nivel de compromiso
- Filtrar por zona/mesa
- Búsqueda combinada

### 3.4 Exportación
```typescript
exportarTodas()
exportarPorLider(liderId: string)
exportarPorZona(zona: string)
exportarPorMesa(mesa: string)
exportarConFiltros(filtros: any)
```

### 3.5 Vista de Líder Individual
- Tabla de personas asignadas
- Estadísticas del líder
- Botón para agregar/quitar personas
- Exportar lista del líder

## 🔐 Fase 4: Autenticación Simple para Líderes

### 4.1 Backend
```javascript
// lambda-auth.js
exports.login = async (event) => {
  const { cedula, password } = JSON.parse(event.body);
  // Verificar contra tabla de líderes
  // Password = últimos 4 dígitos de cédula (simple)
  // Retornar token JWT simple
}

exports.verificarToken = async (event) => {
  // Middleware para verificar token
}
```

### 4.2 Frontend
- Página de login para líderes
- Guard de autenticación
- Panel individual del líder
- Ver solo sus personas asignadas
- Actualizar información de contacto
- Reportar novedades

## 📊 Fase 5: Reportes y Gráficos

### 5.1 Gráficos con Chart.js
```typescript
// Instalar: npm install chart.js ng2-charts

// Gráficos a implementar:
- Barras: Personas por mesa
- Circular: Distribución por zona
- Líneas: Crecimiento temporal
- Barras horizontales: Top líderes por personas
```

### 5.2 Exportar PDF
```typescript
// Instalar: npm install jspdf jspdf-autotable

generarReporteGeneral()
generarReporteLider(liderId: string)
generarCertificado(liderId: string)
generarListadoMesa(mesa: string)
```

## 🚀 Orden de Implementación Recomendado

### Paso 1: Actualizar Backend (HOY)
1. ✅ Actualizar lambda-personas.js
2. ⏳ Ejecutar `actualizar-personas-lambda.bat`
3. ⏳ Ejecutar `crear-endpoints-personas.bat`
4. ⏳ Probar endpoints con Postman

### Paso 2: Actualizar Frontend (HOY)
1. Actualizar interfaces TypeScript
2. Crear modal de edición de persona
3. Implementar asignación de líder
4. Agregar campos de estado y compromiso
5. Implementar exportación básica

### Paso 3: Funcionalidades Avanzadas (MAÑANA)
1. Implementar autenticación de líderes
2. Crear panel individual de líder
3. Agregar gráficos estadísticos
4. Implementar exportación a PDF

### Paso 4: Refinamiento (DESPUÉS)
1. Mejorar UX/UI
2. Agregar validaciones
3. Optimizar rendimiento
4. Agregar más filtros

## 📝 Comandos Rápidos

```bash
# Actualizar Lambda Personas
cd backend
.\actualizar-personas-lambda.bat

# Crear endpoints en API Gateway
.\crear-endpoints-personas.bat

# Actualizar todas las lambdas
.\actualizar-todas-lambdas.bat

# Probar localmente
npm start
```

## 🎯 Prioridades

### Alta Prioridad (Hacer Primero)
1. ✅ Asignación de personas a líderes
2. ⏳ Actualizar/Eliminar personas
3. ⏳ Estados y nivel de compromiso
4. ⏳ Exportar a CSV/Excel

### Media Prioridad
1. Panel individual de líderes
2. Autenticación simple
3. Gráficos estadísticos
4. Filtros avanzados

### Baja Prioridad
1. Exportar a PDF
2. Certificados
3. Historial detallado
4. Notificaciones

## ✅ Checklist de Verificación

- [ ] Lambda personas actualizada y desplegada
- [ ] Endpoints de API Gateway creados
- [ ] CORS configurado correctamente
- [ ] Permisos de Lambda agregados
- [ ] Frontend actualizado con nuevas interfaces
- [ ] Modal de edición funcionando
- [ ] Asignación de líder funcionando
- [ ] Exportación básica funcionando
- [ ] Pruebas end-to-end completadas
