# ✅ Exportación Excel Funcionando

## Estado Actual

La exportación a Excel está completamente funcional y desplegada en AWS Lambda.

## Arquitectura

### Lambda Layer
- **Nombre**: `partido-conservador-dependencies:1`
- **ARN**: `arn:aws:lambda:us-west-2:431655581275:layer:partido-conservador-dependencies:1`
- **Contenido**: Todas las dependencias de Node.js (AWS SDK, ExcelJS, PDFKit, etc.)
- **Tamaño**: ~17 MB

### Lambda Function
- **Nombre**: `partido-conservador-export-excel`
- **Runtime**: Node.js 20.x
- **Handler**: `lambda-export-excel.handler`
- **Código**: Solo el archivo `lambda-export-excel.js` (~3.8 KB)
- **Layer**: Usa el layer de dependencias
- **Memoria**: 512 MB
- **Timeout**: 30 segundos

### API Gateway
- **API ID**: `t6km5ha4e3`
- **Endpoint**: `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod`
- **Ruta**: `/api/export/excel`
- **Método**: GET

## Endpoints Disponibles

### 1. Exportar Todas las Personas
```
GET https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
```

### 2. Exportar Todos los Líderes
```
GET https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=lideres
```

### 3. Exportar con Filtros
```
GET https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas&filters={"liderId":"123","zona":"Norte"}
```

## Filtros Disponibles

Para personas:
- `liderId`: ID del líder
- `liderNombre`: Nombre del líder (para el nombre del archivo)
- `zona`: Zona electoral
- `mesa`: Número de mesa
- `estado`: Estado (Activo, Inactivo, etc.)
- `nivelCompromiso`: Nivel de compromiso (Alto, Medio, Bajo)
- `busqueda`: Búsqueda por nombre, cédula, celular o correo

## Características del Excel Generado

### Para Personas
- **Columnas**: Nombre, Cédula, Celular, Correo, Dirección, Mesa, Lugar de Votación, Dirección de Votación, Zona, Líder Asignado, Estado, Nivel de Compromiso, Notas
- **Formato**: Encabezados con colores del partido (azul #003DA5)
- **Funcionalidades**: Auto-filtro, bordes, ancho de columnas optimizado
- **Hoja adicional**: Si se filtra por líder, incluye estadísticas

### Para Líderes
- **Columnas**: Nombre, Cédula, Celular, Correo, Zona, Total de Personas Asignadas, Personas Activas, Personas con Alto Compromiso
- **Ordenamiento**: Por total de personas (descendente)
- **Hoja adicional**: Resumen general con totales y promedios

## Nombres de Archivos

Los archivos se generan con nombres descriptivos y timestamp:
- `personas_completo_20260226_160000.xlsx`
- `personas_lider_Juan_Perez_20260226_160000.xlsx`
- `personas_zona_Norte_20260226_160000.xlsx`
- `personas_mesa_001_20260226_160000.xlsx`
- `lideres_20260226_160000.xlsx`

## Cómo Actualizar la Lambda

### Método Rápido (solo código)
```powershell
# 1. Editar lambda-export-excel.js
# 2. Crear ZIP simple
Copy-Item lambda-export-excel.js -Destination x.js -Force
Compress-Archive -Path x.js -DestinationPath x.zip -Force
Remove-Item x.js -Force

# 3. Desplegar
aws lambda update-function-code `
  --function-name partido-conservador-export-excel `
  --zip-file fileb://x.zip `
  --region us-west-2

# 4. Limpiar
Remove-Item x.zip -Force
```

### Actualizar Dependencias (Layer)
Solo si cambias package.json:

```powershell
# 1. Crear estructura del layer
New-Item -ItemType Directory -Path layer-dependencies/nodejs -Force
Copy-Item package.json -Destination layer-dependencies/nodejs/

# 2. Instalar dependencias
npm install --prefix layer-dependencies/nodejs --production

# 3. Crear ZIP
Compress-Archive -Path layer-dependencies/* -DestinationPath layer-dependencies.zip -Force

# 4. Publicar nueva versión del layer
aws lambda publish-layer-version `
  --layer-name partido-conservador-dependencies `
  --description "Dependencies for Partido Conservador Lambdas" `
  --zip-file fileb://layer-dependencies.zip `
  --compatible-runtimes nodejs20.x `
  --region us-west-2

# 5. Actualizar lambda para usar nueva versión
aws lambda update-function-configuration `
  --function-name partido-conservador-export-excel `
  --layers arn:aws:lambda:us-west-2:431655581275:layer:partido-conservador-dependencies:2 `
  --region us-west-2
```

## Frontend

El servicio `ExportService` en Angular maneja:
- Decodificación de base64 a Blob
- Descarga automática del archivo
- Manejo de errores
- Extracción del nombre de archivo desde headers

### Uso en Componentes
```typescript
// Exportar todas las personas
this.exportService.exportarPersonasExcel().subscribe({
  next: () => console.log('Exportado'),
  error: (err) => console.error(err.message)
});

// Exportar con filtros
this.exportService.exportarPersonasExcel({
  liderId: '123',
  liderNombre: 'Juan Pérez',
  zona: 'Norte'
}).subscribe({
  next: () => console.log('Exportado'),
  error: (err) => console.error(err.message)
});

// Exportar líderes
this.exportService.exportarLideresExcel().subscribe({
  next: () => console.log('Exportado'),
  error: (err) => console.error(err.message)
});
```

## Pruebas

### Desde PowerShell
```powershell
# Probar personas
Invoke-WebRequest -Uri "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas" -Method GET -OutFile test.xlsx

# Probar líderes
Invoke-WebRequest -Uri "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=lideres" -Method GET -OutFile lideres.xlsx
```

### Desde curl
```bash
curl -X GET "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas" -o personas.xlsx
```

## Logs

Ver logs en CloudWatch:
```powershell
aws logs tail /aws/lambda/partido-conservador-export-excel --region us-west-2 --since 5m --follow
```

## Archivos Importantes

### Backend
- `backend/lambda-export-excel.js` - Código de la lambda
- `backend/package.json` - Dependencias
- `backend/actualizar-lambda-con-layer.bat` - Script de actualización (tiene issues con rutas de Windows)

### Frontend
- `partido-conservador-dashboard/src/app/services/export.service.ts` - Servicio de exportación
- Componentes que usan el servicio: dashboard, lider-panel

## Notas Técnicas

1. **Base64 Encoding**: La lambda retorna el archivo en base64 porque API Gateway no soporta respuestas binarias directamente
2. **CORS**: Configurado para permitir todas las origins (`*`)
3. **Tamaño Máximo**: El payload de API Gateway tiene un límite de 10 MB
4. **Timeout**: 30 segundos es suficiente para exportaciones de hasta ~10,000 registros
5. **Memoria**: 512 MB es adecuado para el procesamiento de Excel

## Estado: ✅ FUNCIONANDO

Última prueba exitosa: 26/02/2026 16:15
- Personas: 13.5 KB ✓
- Líderes: 10.42 KB ✓
