# 🛠️ Comandos Útiles - Dashboard Partido Conservador

## 📦 Instalación Inicial

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd partido-conservador-dashboard
npm install
```

## ▶️ Iniciar Servidores

### Backend (Puerto 3000)
```bash
cd backend
npm start
```

### Backend en modo desarrollo (con auto-reload)
```bash
cd backend
npm run dev
```

### Frontend (Puerto 4200)
```bash
cd partido-conservador-dashboard
npm start
```

### Frontend en modo producción
```bash
cd partido-conservador-dashboard
npm run build
```

## 🔍 Verificar Instalaciones

### Verificar Node.js
```bash
node --version
# Debe mostrar: v22.x.x
```

### Verificar npm
```bash
npm --version
# Debe mostrar: 10.x.x
```

### Verificar Angular CLI
```bash
ng version
# Debe mostrar: Angular CLI 21.x.x
```

## 🧹 Limpiar y Reinstalar

### Limpiar caché de npm
```bash
npm cache clean --force
```

### Reinstalar dependencias del backend
```bash
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Reinstalar dependencias del frontend
```bash
cd partido-conservador-dashboard
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Limpiar caché de Angular
```bash
cd partido-conservador-dashboard
npm run ng cache clean
```

## 🔧 Comandos de Desarrollo

### Generar nuevo componente
```bash
cd partido-conservador-dashboard
ng generate component components/nombre-componente
```

### Generar nuevo servicio
```bash
cd partido-conservador-dashboard
ng generate service services/nombre-servicio
```

### Generar nuevo módulo
```bash
cd partido-conservador-dashboard
ng generate module modules/nombre-modulo
```

## 🏗️ Build y Producción

### Build de producción
```bash
cd partido-conservador-dashboard
npm run build
```

### Build con optimizaciones
```bash
cd partido-conservador-dashboard
ng build --configuration production
```

### Servir build de producción
```bash
cd partido-conservador-dashboard
ng serve --configuration production
```

## 🐛 Debugging

### Ver logs del backend
```bash
cd backend
npm start
# Los logs aparecerán en la consola
```

### Ver logs del frontend
```bash
cd partido-conservador-dashboard
npm start
# Abre la consola del navegador (F12)
```

### Modo verbose de Angular
```bash
cd partido-conservador-dashboard
ng serve --verbose
```

## 🔍 Testing

### Ejecutar tests del frontend
```bash
cd partido-conservador-dashboard
npm test
```

### Ejecutar tests con cobertura
```bash
cd partido-conservador-dashboard
npm run test -- --code-coverage
```

## 📊 Análisis de Código

### Analizar bundle size
```bash
cd partido-conservador-dashboard
npm run build -- --stats-json
```

### Lint del código
```bash
cd partido-conservador-dashboard
ng lint
```

## 🌐 Puertos y URLs

### Backend
- URL: http://localhost:3000
- API: http://localhost:3000/api

### Frontend
- URL: http://localhost:4200
- Build: http://localhost:4200

### Cambiar puerto del frontend
```bash
cd partido-conservador-dashboard
ng serve --port 4300
```

### Cambiar puerto del backend
Edita `backend/server.js` y cambia:
```javascript
const PORT = 3000; // Cambia este número
```

## 🔄 Git (Control de Versiones)

### Inicializar repositorio
```bash
git init
```

### Agregar archivos
```bash
git add .
```

### Hacer commit
```bash
git commit -m "Mensaje del commit"
```

### Ver estado
```bash
git status
```

### Ver historial
```bash
git log
```

## 📦 Actualizar Dependencias

### Actualizar Angular
```bash
cd partido-conservador-dashboard
ng update @angular/core @angular/cli
```

### Actualizar todas las dependencias del backend
```bash
cd backend
npm update
```

### Verificar dependencias desactualizadas
```bash
npm outdated
```

## 🔒 Seguridad

### Auditar vulnerabilidades
```bash
npm audit
```

### Corregir vulnerabilidades automáticamente
```bash
npm audit fix
```

### Corregir vulnerabilidades forzadamente
```bash
npm audit fix --force
```

## 🗄️ Base de Datos (Futuro)

### Instalar MongoDB (si decides usarlo)
```bash
npm install mongodb mongoose
```

### Instalar PostgreSQL (si decides usarlo)
```bash
npm install pg sequelize
```

## 📱 Deployment

### Preparar para producción
```bash
# Frontend
cd partido-conservador-dashboard
npm run build

# Backend
cd backend
# Los archivos ya están listos
```

### Subir a servidor
```bash
# Copiar carpeta dist/ del frontend
# Copiar carpeta backend/ completa
```

## 🔧 Solución de Problemas

### Puerto ocupado (Windows)
```bash
# Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID [número] /F
```

### Puerto ocupado (Puerto 4200)
```bash
netstat -ano | findstr :4200
taskkill /PID [número] /F
```

### Error de permisos
```bash
# Ejecutar como administrador
# Click derecho en CMD > Ejecutar como administrador
```

### Error de módulos no encontrados
```bash
# Reinstalar dependencias
cd [carpeta-del-proyecto]
rmdir /s /q node_modules
npm install
```

## 📊 Monitoreo

### Ver uso de memoria
```bash
# En Windows
tasklist | findstr node
```

### Ver procesos de Node
```bash
tasklist | findstr node
```

## 🎯 Comandos Rápidos

### Iniciar todo (Windows)
```bash
# Opción 1: Usar el script
iniciar-proyecto.bat

# Opción 2: Manual
start cmd /k "cd backend && npm start"
start cmd /k "cd partido-conservador-dashboard && npm start"
```

### Detener servidores
```bash
# Presiona Ctrl+C en cada terminal
# O cierra las ventanas de CMD
```

## 📝 Notas Importantes

1. **Siempre inicia el backend primero** antes que el frontend
2. **Espera 3-5 segundos** entre iniciar backend y frontend
3. **No cierres las terminales** mientras uses la aplicación
4. **Usa Chrome o Edge** para mejor compatibilidad
5. **Guarda cambios** antes de reiniciar servidores

## 🆘 Comandos de Emergencia

### Reiniciar todo
```bash
# Cerrar todas las terminales
# Abrir nuevas terminales
cd backend
npm start

# En otra terminal
cd partido-conservador-dashboard
npm start
```

### Limpiar todo y empezar de cero
```bash
# Backend
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

# Frontend
cd partido-conservador-dashboard
rmdir /s /q node_modules
rmdir /s /q .angular
del package-lock.json
npm install
```

---

## 📞 Ayuda Adicional

Si ningún comando funciona:
1. Verifica que Node.js esté instalado
2. Verifica que estés en la carpeta correcta
3. Ejecuta CMD como administrador
4. Revisa la documentación en README.md
5. Contacta soporte técnico

---

**Tip**: Guarda este archivo como referencia rápida 📌
