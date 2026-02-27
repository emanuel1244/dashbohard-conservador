# 📖 Guía de Uso - Panel de Líderes

## 🚀 Cómo Desplegar

### Paso 1: Desplegar Lambda de Autenticación
```bash
cd backend
.\desplegar-auth-lambda.bat
```

### Paso 2: Crear Endpoints en API Gateway
```bash
.\crear-endpoints-auth.bat
```

### Paso 3: Iniciar Frontend
```bash
cd partido-conservador-dashboard
npm start
```

## 👥 Cómo Usar el Sistema

### Para Administradores

#### 1. Acceder al Dashboard Principal
```
URL: http://localhost:4200
```

- Ver estadísticas generales
- Gestionar personas
- Gestionar líderes
- Cargar datos desde Excel

#### 2. Crear Líderes
```
1. Ir a vista "Líderes"
2. Click en "➕ Agregar Líder"
3. Llenar formulario:
   - Nombre completo
   - Cédula (importante para login)
   - Celular
   - Correo
   - Zona asignada
4. Guardar
```

#### 3. Asignar Personas a Líderes
```
1. Ir a vista "Personas"
2. Click en ✏️ de una persona
3. Seleccionar líder en dropdown
4. Guardar
```

### Para Líderes

#### 1. Acceder al Panel de Líderes
```
1. En el dashboard principal, click en "⭐ Acceso Líderes"
2. O ir directamente a: http://localhost:4200/login
```

#### 2. Iniciar Sesión
```
Cédula: [Tu número de cédula]
Contraseña: [Últimos 4 dígitos de tu cédula]

Ejemplo:
Cédula: 1234567890
Contraseña: 7890
```

#### 3. Ver tu Panel
Una vez autenticado, verás:
- Estadísticas de tus personas asignadas
- Tu información personal
- Lista completa de personas asignadas

#### 4. Gestionar tus Personas

**Filtrar:**
- Por nombre, cédula o celular
- Por estado (Activo/Inactivo/Potencial)
- Por nivel de compromiso (Alto/Medio/Bajo)

**Editar Persona:**
```
1. Click en ✏️ de la persona
2. Cambiar estado
3. Cambiar nivel de compromiso
4. Agregar notas
5. Guardar
```

**Exportar:**
```
Click en "📥 Exportar"
Descarga CSV con todas tus personas
```

#### 5. Actualizar tu Perfil
```
1. Click en "👤 Mi Perfil"
2. Actualizar celular
3. Actualizar correo
4. Guardar cambios
```

#### 6. Cerrar Sesión
```
Click en "🚪 Salir"
Confirmar
```

## 📊 Funcionalidades Disponibles

### Para Líderes

#### Estadísticas Personales
- Total de personas asignadas
- Personas activas
- Personas potenciales
- Personas con alto compromiso

#### Gestión de Personas
- Ver lista completa
- Filtrar por múltiples criterios
- Actualizar estado
- Actualizar nivel de compromiso
- Agregar notas y observaciones
- Exportar a Excel

#### Perfil Personal
- Ver información personal
- Actualizar celular
- Actualizar correo

## 🔐 Seguridad

### Contraseñas
- Por defecto: últimos 4 dígitos de la cédula
- Ejemplo: Cédula 1234567890 → Password: 7890

### Sesión
- Duración: 24 horas
- Se guarda en localStorage
- Cierre manual disponible

### Permisos
- Cada líder solo ve sus personas asignadas
- No puede ver personas de otros líderes
- No puede acceder al panel de administración

## 📱 Casos de Uso Comunes

### Caso 1: Líder Actualiza Estado de Contacto
```
Situación: Llamaste a una persona y está muy interesada

1. Buscar la persona en tu lista
2. Click en ✏️
3. Cambiar estado a "Activo"
4. Cambiar compromiso a "Alto"
5. Agregar nota: "Llamada 24/02 - Muy interesado, asistirá al evento"
6. Guardar
```

### Caso 2: Líder Identifica Personas Inactivas
```
Situación: Quieres ver quiénes no han respondido

1. Filtrar por Estado: "Inactivo"
2. Ver lista de personas inactivas
3. Exportar lista para hacer seguimiento
4. Llamar a cada una
5. Actualizar estado según respuesta
```

### Caso 3: Líder Prepara Reporte
```
Situación: Necesitas reportar avances al coordinador

1. Ver estadísticas en el panel
2. Filtrar por "Alto Compromiso"
3. Exportar lista
4. Enviar reporte al coordinador
```

### Caso 4: Líder Actualiza su Información
```
Situación: Cambiaste de número de celular

1. Click en "👤 Mi Perfil"
2. Actualizar celular
3. Guardar
4. Ahora el coordinador tiene tu nuevo número
```

## 🎯 Mejores Prácticas

### Para Líderes

1. **Actualiza Regularmente**
   - Revisa tu panel diariamente
   - Actualiza estados después de cada contacto
   - Agrega notas detalladas

2. **Usa los Filtros**
   - Identifica personas que necesitan seguimiento
   - Prioriza alto compromiso
   - Exporta listas para trabajo offline

3. **Mantén Notas Claras**
   - Fecha del contacto
   - Resultado de la conversación
   - Próximos pasos
   - Ejemplo: "24/02 - Llamada exitosa, asistirá al evento del 28/02"

4. **Exporta Regularmente**
   - Backup de tu información
   - Trabajo offline
   - Reportes al coordinador

### Para Administradores

1. **Crea Líderes Correctamente**
   - Verifica que la cédula sea correcta
   - Asigna zona apropiada
   - Proporciona credenciales al líder

2. **Asigna Personas Estratégicamente**
   - Por zona geográfica
   - Carga balanceada
   - Considera experiencia del líder

3. **Monitorea Actividad**
   - Revisa estadísticas generales
   - Identifica líderes más activos
   - Apoya a líderes con dificultades

## ⚠️ Solución de Problemas

### No puedo iniciar sesión
```
Problema: "Cédula no encontrada"
Solución: Verifica que tu cédula esté registrada como líder

Problema: "Contraseña incorrecta"
Solución: Usa los últimos 4 dígitos de tu cédula
```

### No veo mis personas
```
Problema: Lista vacía
Solución: 
1. Verifica que tengas personas asignadas
2. Contacta al administrador
3. Revisa que no haya filtros activos
```

### La sesión expiró
```
Problema: "Token inválido o expirado"
Solución:
1. Cierra sesión
2. Vuelve a iniciar sesión
3. La sesión dura 24 horas
```

### No puedo exportar
```
Problema: No se descarga el archivo
Solución:
1. Verifica que tengas personas asignadas
2. Revisa permisos del navegador
3. Intenta con otro navegador
```

## 📞 Soporte

### Para Líderes
Contacta al coordinador de tu zona si:
- No puedes iniciar sesión
- No ves tus personas asignadas
- Necesitas cambiar tu información
- Tienes dudas sobre el uso

### Para Administradores
Revisa la documentación técnica:
- PANEL-LIDERES-IMPLEMENTADO.md
- FUNCIONALIDADES-IMPLEMENTADAS.md
- RESUMEN-IMPLEMENTACION-COMPLETA.md

## 🎓 Video Tutorial (Próximamente)

Se recomienda crear un video tutorial mostrando:
1. Cómo iniciar sesión
2. Cómo navegar el panel
3. Cómo actualizar personas
4. Cómo exportar datos
5. Cómo actualizar perfil

## ✅ Checklist para Líderes

### Al Iniciar
- [ ] Iniciar sesión correctamente
- [ ] Verificar que veo mis personas
- [ ] Revisar mis estadísticas
- [ ] Verificar mi información de contacto

### Diariamente
- [ ] Revisar lista de personas
- [ ] Actualizar estados de contactos realizados
- [ ] Agregar notas de seguimiento
- [ ] Identificar personas que necesitan atención

### Semanalmente
- [ ] Exportar reporte de avances
- [ ] Revisar personas inactivas
- [ ] Actualizar compromisos
- [ ] Reportar al coordinador

### Mensualmente
- [ ] Revisar todas las personas asignadas
- [ ] Actualizar información desactualizada
- [ ] Identificar nuevos líderes potenciales
- [ ] Evaluar metas cumplidas

## 🎉 Conclusión

El Panel de Líderes te permite:
- Gestionar tus personas asignadas de forma independiente
- Mantener información actualizada
- Generar reportes fácilmente
- Trabajar de forma organizada

¡Úsalo regularmente para maximizar tu efectividad como líder!
