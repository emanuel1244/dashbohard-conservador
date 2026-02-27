# 🏛️ Dashboard Partido Conservador

Sistema de gestión electoral moderno y profesional para el Partido Conservador de Colombia.

## ✨ Características

- 📊 **Dashboard Interactivo**: Visualización de estadísticas en tiempo real
- 👥 **Gestión de Personas**: Base de datos completa de votantes
- ⭐ **Gestión de Líderes**: Administración de líderes políticos por zona
- 📤 **Carga desde Excel**: Importación masiva de datos con validación automática
- ✅ **Validación de Duplicados**: Detección automática de registros repetidos
- 🔍 **Búsqueda Avanzada**: Filtrado por nombre, cédula o celular
- 📱 **Diseño Responsive**: Funciona perfectamente en móviles y tablets
- 🎨 **Interfaz Moderna**: Diseño elegante con los colores del partido

## 🚀 Tecnologías

### Frontend
- **Angular 21** - Framework principal
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos avanzados
- **Standalone Components** - Arquitectura moderna

### Backend
- **Node.js 22** - Runtime de JavaScript
- **Express** - Framework web
- **XLSX** - Procesamiento de archivos Excel
- **Multer** - Manejo de archivos

## 📋 Requisitos Previos

- Node.js 22.x o superior
- npm 10.x o superior
- Angular CLI 21.x

## 🛠️ Instalación

### 1. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 2. Instalar dependencias del Frontend

```bash
cd partido-conservador-dashboard
npm install
```

## ▶️ Ejecución

### Iniciar el Backend (Puerto 3000)

```bash
cd backend
npm start
```

O en modo desarrollo con auto-reload:

```bash
npm run dev
```

### Iniciar el Frontend (Puerto 4200)

En otra terminal:

```bash
cd partido-conservador-dashboard
npm start
```

Abre tu navegador en: **http://localhost:4200**

## 📊 Formato del Excel

El archivo Excel debe tener las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| NOMBRE Y APELLIDOS | Nombre completo de la persona |
| Cedula | Número de cédula |
| LUGAR DE VOTACION | Lugar donde vota |
| DIRECCION L VOTACION | Dirección del lugar de votación |
| MESA | Número de mesa |
| DIRECCION | Dirección de residencia |
| Correo | Correo electrónico |
| Celular | Número de celular |

### Ejemplo de plantilla Excel:

```
| NOMBRE Y APELLIDOS | Cedula | LUGAR DE VOTACION | MESA | DIRECCION | Correo | Celular |
|-------------------|--------|-------------------|------|-----------|--------|---------|
| Juan Pérez | 1234567 | IE MARIA AUXILIADORA | 5 | Calle 1 | juan@mail.com | 3001234567 |
```

## 🎯 Funcionalidades Principales

### Dashboard
- Visualización de estadísticas generales
- Top 5 mesas con más personas
- Carga de archivos Excel
- Alertas de duplicados

### Gestión de Personas
- Listado completo de votantes
- Búsqueda en tiempo real
- Visualización de datos completos
- Filtrado por múltiples criterios

### Gestión de Líderes
- Crear, editar y eliminar líderes
- Asignación de zonas
- Seguimiento de personas asignadas
- Información de contacto

## 🎨 Paleta de Colores

- **Azul Conservador**: #003DA5
- **Dorado**: #FFD700
- **Blanco**: #FFFFFF

## 📱 Responsive Design

El sistema está optimizado para:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px+)
- 📱 Tablet (768px+)
- 📱 Mobile (320px+)

## 🔒 Seguridad

- Validación de datos en frontend y backend
- Sanitización de inputs
- Protección contra duplicados
- Manejo seguro de archivos

## 🚀 Próximas Funcionalidades

- [ ] Exportar datos a Excel
- [ ] Reportes en PDF
- [ ] Gráficos estadísticos avanzados
- [ ] Sistema de autenticación
- [ ] Base de datos persistente (MongoDB/PostgreSQL)
- [ ] Asignación de personas a líderes
- [ ] Notificaciones por email/SMS
- [ ] Mapa de votación interactivo
- [ ] Dashboard de líderes individual

## 👨‍💻 Desarrollo

### Estructura del Proyecto

```
.
├── backend/                    # API Node.js
│   ├── server.js              # Servidor Express
│   └── package.json           # Dependencias backend
│
├── partido-conservador-dashboard/  # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── dashboard/  # Componente principal
│   │   │   ├── app.routes.ts   # Rutas
│   │   │   └── app.config.ts   # Configuración
│   │   └── styles.scss         # Estilos globales
│   └── package.json            # Dependencias frontend
│
└── README.md                   # Este archivo
```

## 📝 Licencia

Proyecto desarrollado para el Partido Conservador Colombiano.

## 🤝 Contribuciones

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

Para soporte técnico, contacta a:
- **Email**: soporte@partidoconservador.com
- **Teléfono**: +57 300 123 4567

---

Desarrollado con ❤️ para el Partido Conservador Colombiano 🇨🇴


## 🔧 Lambda Layers (AWS)

El sistema utiliza **Lambda Layers** para gestionar las dependencias de las funciones Lambda en AWS.

### ¿Qué es un Lambda Layer?

Un Lambda Layer es un archivo ZIP que contiene bibliotecas y dependencias que pueden ser compartidas entre múltiples funciones Lambda. Esto permite:
- Reducir el tamaño del código de la Lambda
- Compartir dependencias entre funciones
- Actualizar dependencias sin modificar el código

### Dependencias Incluidas

El Layer `nodejs-dependencies-layer` incluye:
- **xlsx** (^0.18.5) - Procesamiento de archivos Excel

### Scripts Disponibles

#### Despliegue Completo (Recomendado)
```bash
cd backend
.\desplegar-layer-completo.bat
```

Este script ejecuta automáticamente:
1. Creación del Layer
2. Despliegue a AWS
3. Asociación a la Lambda
4. Verificación de logs

#### Scripts Individuales

```bash
# Crear Layer localmente
.\crear-layer.bat

# Desplegar Layer a AWS
.\desplegar-layer.bat

# Asociar Layer a Lambda
.\asociar-layer.bat

# Verificar logs de CloudWatch
.\verificar-layer.bat

# Probar con archivo Excel real
.\probar-upload-excel.bat

# Verificar datos en DynamoDB
.\verificar-dynamodb.bat
```

### Actualizar Dependencias

Para agregar o actualizar dependencias:

1. Edita `backend/lambda-layer/nodejs/package.json`
2. Agrega o actualiza las dependencias necesarias
3. Ejecuta el script de despliegue completo

```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "nueva-dependencia": "^1.0.0"
  }
}
```

### Troubleshooting

Si encuentras errores de "Cannot find module":

1. Verifica que el Layer esté asociado:
```bash
aws lambda get-function-configuration --function-name partido-conservador-uploadExcel --region us-west-2 --query "Layers"
```

2. Re-asocia el Layer:
```bash
cd backend
.\asociar-layer.bat
```

Para más detalles, consulta: [SOLUCION-LAMBDA-LAYERS.md](SOLUCION-LAMBDA-LAYERS.md)
