# Exportación de Duplicados - Implementación POST

## Problema Resuelto

El sistema estaba limitando la exportación de duplicados a solo 10 registros cuando había 20 encontrados. El problema era que los duplicados se enviaban por URL (método GET) y había un límite en la longitud de la URL.

## Solución Implementada

### 1. Frontend - Export Service

**Archivo:** `partido-conservador-dashboard/src/app/services/export.service.ts`

Cambios:
- Modificado `exportarDuplicadosExcel()` para usar **POST** en lugar de GET
- Los duplicados ahora se envían en el **body** de la petición, no en la URL
- Esto elimina el límite de longitud de URL

```typescript
exportarDuplicadosExcel(duplicados: any[]): Observable<Blob> {
  const url = `${this.API_URL}/export/excel`;
  
  return this.http.post(url, {
    type: 'duplicados',
    duplicados: duplicados
  }, { 
    responseType: 'text',
    observe: 'response'
  }).pipe(
    // ... manejo de respuesta
  );
}
```

### 2. Backend - Lambda Export Excel

**Archivo:** `backend/lambda-export-excel.js`

Cambios:
- Modificado el handler para soportar tanto **GET** como **POST**
- Cuando es POST, lee los duplicados del body
- Cuando es GET, lee los duplicados de los query parameters (para compatibilidad)

```javascript
if (event.httpMethod === 'POST') {
  const body = JSON.parse(event.body || '{}');
  type = body.type || 'personas';
  filters = body.duplicados ? { duplicados: body.duplicados } : (body.filters || {});
} else {
  const params = parseQueryParams(event);
  type = params.type;
  filters = params.filters;
}
```

### 3. API Gateway - Configuración

**Cambios realizados:**

1. **Creado método POST** en el recurso `/api/export/excel`
2. **Configurada integración** con Lambda usando AWS_PROXY
3. **Agregados permisos** para que API Gateway pueda invocar la Lambda con POST
4. **Actualizado CORS** para permitir método POST
5. **Desplegados cambios** a producción

**Scripts creados:**
- `backend/configurar-post-export-excel.bat` - Configura el método POST en API Gateway
- `backend/actualizar-export-excel-post.bat` - Actualiza la Lambda y configura POST

## Endpoints Disponibles

### GET (para personas y líderes)
```
GET https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas
GET https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=lideres
```

### POST (para duplicados)
```
POST https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel
Content-Type: application/json

{
  "type": "duplicados",
  "duplicados": [
    {
      "fila": 2,
      "persona": {
        "nombre": "Juan Pérez",
        "cedula": "123456789",
        // ... más campos
      },
      "motivoRechazo": "Cédula duplicada",
      "fechaDeteccion": "2026-02-27T17:00:00.000Z"
    }
    // ... más duplicados
  ]
}
```

## Resultado

✅ Ahora se exportan **TODOS** los duplicados encontrados (20 en el caso de prueba)
✅ No hay límite en la cantidad de duplicados que se pueden exportar
✅ El archivo Excel contiene todas las columnas y datos correctos
✅ Mantiene compatibilidad con las exportaciones existentes (GET)

## Cómo Probar

1. Recarga la página en el navegador
2. Carga un archivo Excel con duplicados
3. Verifica que el mensaje muestre "⚠ 20 duplicados encontrados"
4. Haz clic en "Descargar Excel con Duplicados"
5. Verifica que el archivo descargado contenga los 20 registros duplicados

## Archivos Modificados

- `partido-conservador-dashboard/src/app/services/export.service.ts`
- `backend/lambda-export-excel.js`
- `.kiro/specs/exportacion-duplicados/tasks.md`

## Archivos Creados

- `backend/configurar-post-export-excel.bat`
- `backend/actualizar-export-excel-post.bat`
- `backend/cors-patch.json`
- `EXPORTACION-DUPLICADOS-POST-IMPLEMENTADO.md`

## Estado del Spec

Tareas completadas:
- ✅ 2.1 - Función generateExcelDuplicados()
- ✅ 2.2 - Handler con soporte POST
- ✅ 3.1 - Método exportarDuplicadosExcel() con POST
- ✅ 12 - Despliegue al backend

Pendientes:
- Tests automatizados (marcados con *)
- Columnas condicionales (líder, fecha registro)
- Validación de conteo

## Notas Técnicas

- El método POST es necesario porque las URLs tienen un límite de ~2000 caracteres
- Con 20 duplicados, cada uno con múltiples campos, la URL excedía este límite
- POST permite enviar datos ilimitados en el body
- La Lambda sigue soportando GET para mantener compatibilidad con exportaciones de personas y líderes
