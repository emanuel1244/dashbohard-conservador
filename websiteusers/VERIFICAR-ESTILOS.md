# Verificación de Estilos - Dashboard

## Estado Actual

Los archivos están correctos:
- ✅ HTML tiene las clases correctas
- ✅ SCSS tiene todos los estilos definidos
- ✅ TypeScript tiene los métodos necesarios

## Botones que Deberías Ver

### Header Principal
1. **➕ Agregar Persona** - Botón azul con gradiente (clase: `btn-primary`)
2. **📊 Exportar a Excel** - Botón verde con gradiente (clase: `btn-export`)

### Tarjetas de Líderes
Cada tarjeta de líder tiene 3 botones en el footer:
1. **📊 Excel** - Botón cyan/turquesa (clase: `btn-action btn-export`)
2. **✏️ Editar** - Botón azul info (clase: `btn-action btn-edit`)
3. **🗑️ Eliminar** - Botón rojo (clase: `btn-action btn-delete`)

## Si No Ves los Estilos

### Opción 1: Limpiar Caché del Navegador
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Opción 2: Reiniciar el Servidor de Desarrollo
```powershell
# Detener el servidor (Ctrl + C)
# Luego reiniciar
cd partido-conservador-dashboard
npm start
```

### Opción 3: Verificar que Angular esté compilando
Abre la consola del navegador (F12) y busca errores de compilación.

### Opción 4: Forzar Recompilación
```powershell
cd partido-conservador-dashboard
# Limpiar
Remove-Item -Recurse -Force .angular
# Reinstalar y reiniciar
npm install
npm start
```

## Clases CSS Importantes

### Botones Principales
```scss
.btn-primary {
  background: linear-gradient(135deg, #003DA5 0%, #0052cc 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  // ... más estilos
}

.btn-export {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  // ... más estilos
}
```

### Botones de Acción (Líderes)
```scss
.btn-action {
  flex: 1;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  // ... más estilos
  
  &.btn-export {
    background: #17a2b8; // Cyan
  }
  
  &.btn-edit {
    background: #17a2b8; // Azul info
  }
  
  &.btn-delete {
    background: #dc3545; // Rojo
  }
}
```

## Verificar en el Navegador

1. Abre las DevTools (F12)
2. Ve a la pestaña "Elements"
3. Selecciona un botón
4. En el panel derecho, verifica que los estilos se estén aplicando
5. Si ves estilos tachados, hay un conflicto de CSS

## Archivos a Verificar

- `partido-conservador-dashboard/src/app/components/dashboard/dashboard.component.html` ✅
- `partido-conservador-dashboard/src/app/components/dashboard/dashboard.component.scss` ✅
- `partido-conservador-dashboard/src/app/components/dashboard/dashboard.component.ts` ✅

## Colores del Sistema

- **Azul Principal**: #003DA5
- **Dorado Secundario**: #FFD700
- **Verde Éxito**: #4caf50
- **Rojo Peligro**: #dc3545
- **Cyan Info**: #17a2b8

## Próximos Pasos

1. Limpia el caché del navegador
2. Reinicia el servidor de desarrollo
3. Si persiste, verifica la consola del navegador por errores
4. Asegúrate de que el archivo SCSS se esté importando correctamente

## Comando Rápido para Reiniciar

```powershell
# En la carpeta partido-conservador-dashboard
npm start
```

Luego abre: http://localhost:4200
