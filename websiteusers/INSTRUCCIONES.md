# 📖 Instrucciones de Uso - Dashboard Partido Conservador

## 🎯 Guía Rápida de Inicio

### Paso 1: Instalar Dependencias

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd partido-conservador-dashboard
npm install
```

### Paso 2: Iniciar los Servidores

#### Terminal 1 - Backend:
```bash
cd backend
npm start
```
El backend estará corriendo en: **http://localhost:3000**

#### Terminal 2 - Frontend:
```bash
cd partido-conservador-dashboard
npm start
```
El frontend estará corriendo en: **http://localhost:4200**

### Paso 3: Abrir el Dashboard

Abre tu navegador y ve a: **http://localhost:4200**

---

## 📊 Cómo Usar el Sistema

### 1. Dashboard Principal

Al abrir la aplicación verás:
- **Estadísticas generales**: Total de personas, líderes, mesas y lugares de votación
- **Sección de carga de Excel**: Para importar datos masivamente
- **Top 5 mesas**: Las mesas con más personas registradas

### 2. Cargar Datos desde Excel

#### Preparar tu archivo Excel:

Tu archivo debe tener estas columnas (en este orden o con estos nombres):

| NOMBRE Y APELLIDOS | Cedula | LUGAR DE VOTACION | DIRECCION L VOTACION | MESA | DIRECCION | Correo | Celular |
|-------------------|--------|-------------------|---------------------|------|-----------|--------|---------|

**Ejemplo:**
```
Emanuel Camargo Quintero | 22.047.777 | IE MARIA AUXILIADORA SEDE 2 | Cl. 11 #13-74 | 4 | Calle 9 #14-96 | emanuel@mail.com | 3045664700
```

#### Pasos para cargar:

1. Click en **"Seleccionar archivo Excel"**
2. Elige tu archivo .xlsx o .xls
3. Click en **"⬆️ Subir Archivo"**
4. El sistema procesará automáticamente:
   - ✅ Validará datos completos
   - ✅ Detectará duplicados por cédula
   - ✅ Mostrará estadísticas del proceso

#### Resultados:

Verás un mensaje como:
```
✓ 150 personas agregadas. 5 duplicados encontrados.
```

Si hay duplicados, se mostrarán en una lista con:
- Número de fila en el Excel
- Nombre y cédula de la persona duplicada

### 3. Ver Todas las Personas

1. Click en el botón **"👥 Personas"** en la navegación
2. Verás una tabla con todas las personas registradas
3. Usa el buscador para filtrar por:
   - Nombre
   - Cédula
   - Celular

**Funciones:**
- 🔍 Búsqueda en tiempo real
- 📊 Visualización completa de datos
- 📱 Scroll horizontal en móviles

### 4. Gestionar Líderes

1. Click en **"⭐ Líderes"** en la navegación
2. Click en **"➕ Agregar Líder"**
3. Completa el formulario:
   - Nombre completo
   - Cédula
   - Celular
   - Correo electrónico
   - Zona asignada
4. Click en **"Guardar"**

**Funciones disponibles:**
- ✏️ Editar líder (click en el botón de lápiz)
- 🗑️ Eliminar líder (click en el botón de basura)
- 👁️ Ver personas asignadas

---

## 🎨 Características del Diseño

### Colores del Partido Conservador:
- **Azul Principal**: #003DA5
- **Dorado**: #FFD700
- **Blanco**: #FFFFFF

### Elementos Visuales:
- Logo del partido en el header
- Iconos intuitivos para cada sección
- Tarjetas con estadísticas coloridas
- Animaciones suaves al hacer hover
- Diseño responsive para móviles

---

## 🔧 Funcionalidades Avanzadas

### Validación de Duplicados

El sistema valida automáticamente:
- ✅ Personas con la misma cédula
- ✅ Datos incompletos (sin nombre o cédula)
- ✅ Formato correcto de los datos

### Estadísticas en Tiempo Real

El dashboard muestra:
- Total de personas registradas
- Total de líderes activos
- Número de mesas de votación
- Número de lugares de votación
- Top 5 mesas con más personas

### Búsqueda Inteligente

Busca por:
- Nombre completo o parcial
- Número de cédula
- Número de celular

---

## 📱 Uso en Dispositivos Móviles

El sistema está optimizado para móviles:
- Navegación adaptativa
- Tablas con scroll horizontal
- Botones grandes y fáciles de tocar
- Formularios optimizados para pantallas pequeñas

---

## ⚠️ Solución de Problemas

### El backend no inicia:
```bash
# Verifica que el puerto 3000 esté libre
# En Windows:
netstat -ano | findstr :3000

# Mata el proceso si es necesario
taskkill /PID [número_de_proceso] /F
```

### El frontend no inicia:
```bash
# Verifica que el puerto 4200 esté libre
# Limpia la caché de Angular
cd partido-conservador-dashboard
npm run ng cache clean
```

### Error al cargar Excel:
- Verifica que el archivo tenga las columnas correctas
- Asegúrate de que el backend esté corriendo
- Revisa que el archivo no esté corrupto

### No se ven los datos:
- Verifica que el backend esté corriendo en http://localhost:3000
- Abre la consola del navegador (F12) para ver errores
- Verifica la conexión a internet

---

## 🚀 Próximos Pasos

Una vez que domines el sistema básico, puedes:

1. **Exportar datos**: Implementar exportación a Excel
2. **Reportes**: Generar reportes en PDF
3. **Asignaciones**: Asignar personas a líderes específicos
4. **Notificaciones**: Enviar mensajes masivos
5. **Mapas**: Visualizar ubicaciones en un mapa

---

## 📞 Contacto y Soporte

Si necesitas ayuda:
- 📧 Email: soporte@partidoconservador.com
- 📱 WhatsApp: +57 300 123 4567
- 🌐 Web: www.partidoconservador.com

---

## 💡 Consejos Útiles

1. **Haz backups regulares** de tus datos
2. **Valida los Excel** antes de subirlos
3. **Usa nombres descriptivos** para las zonas de líderes
4. **Mantén actualizada** la información de contacto
5. **Revisa las estadísticas** regularmente

---

¡Éxito en tu gestión electoral! 🎉🇨🇴
