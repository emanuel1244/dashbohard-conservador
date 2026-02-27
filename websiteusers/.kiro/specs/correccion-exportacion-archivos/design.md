# Design Document

## Overview

El problema actual es que las funciones Lambda devuelven archivos binarios (Excel y PDF) codificados en base64 a través de API Gateway, pero el servicio Angular ExportService está tratando la respuesta como un blob binario directo sin decodificar el base64 primero. Esto resulta en archivos corruptos que no pueden ser abiertos.

La solución implica modificar el ExportService para:
1. Detectar si la respuesta está codificada en base64
2. Decodificar el contenido base64 a datos binarios
3. Crear un Blob válido con el tipo MIME correcto
4. Descargar el archivo usando FileSaver

## Architecture

El flujo de exportación actual:
```
Usuario → Componente Angular → ExportService → API Gateway → Lambda → DynamoDB
                                      ↓
                              HttpClient (blob)
                                      ↓
                              FileSaver (corrupto)
```

El flujo corregido:
```
Usuario → Componente Angular → ExportService → API Gateway → Lambda → DynamoDB
                                      ↓
                              HttpClient (text)
                                      ↓
                              Base64 Decoder
                                      ↓
                              Blob Creator (MIME correcto)
                                      ↓
                              FileSaver (válido)
```

## Components and Interfaces

### ExportService (Modificado)

El servicio necesita cambios en:

1. **Método de solicitud HTTP**: Cambiar de `responseType: 'blob'` a `responseType: 'text'` para recibir la respuesta base64 como texto
2. **Decodificación base64**: Agregar función para convertir base64 a array de bytes
3. **Creación de Blob**: Crear Blob con el tipo MIME correcto según el formato
4. **Manejo de errores**: Mejorar el manejo de errores para respuestas base64

### Funciones auxiliares nuevas

```typescript
interface DecodedFile {
  blob: Blob;
  filename: string;
}

function base64ToBlob(base64: string, mimeType: string): Blob
function extractFilenameFromHeaders(headers: HttpHeaders): string
function getMimeType(format: 'excel' | 'pdf'): string
```

## Data Models

### ExportOptions (Sin cambios)
```typescript
interface ExportOptions {
  format: 'excel' | 'pdf';
  type: string;
  filters?: Record<string, any>;
  ids?: string[];
}
```

### HttpResponse Structure
```typescript
// Respuesta de API Gateway
{
  statusCode: 200,
  headers: {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="export.xlsx"',
    'Access-Control-Allow-Origin': '*'
  },
  body: '<base64-encoded-content>',
  isBase64Encoded: true
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Base64 round-trip preserves data

*For any* binary data, encoding it to base64 and then decoding it using the service's base64ToBlob function should produce a Blob with identical binary content.

**Validates: Requirements 1.2, 2.2**

### Property 2: MIME type matches file format

*For any* export format ('excel' or 'pdf'), the getMimeType function should return the correct and consistent MIME type for that format.

**Validates: Requirements 3.3**

### Property 3: Blob creation produces valid objects

*For any* valid base64 string and MIME type, creating a Blob should produce an object with the correct type property and non-zero size.

**Validates: Requirements 3.2**

### Property 4: Filename extraction handles all valid headers

*For any* valid Content-Disposition header containing a filename, the extractFilename function should correctly extract the filename without quotes or extra characters.

**Validates: Requirements 3.4**

### Property 5: Error responses produce descriptive messages

*For any* HTTP error response (404, 500, network error), the handleError function should produce a descriptive error message appropriate to the error type without attempting to decode or download.

**Validates: Requirements 1.4, 2.4**

### Property 6: Downloaded files are valid and openable

*For any* successfully downloaded file (Excel or PDF), the file should be valid according to its format specification and openable by the corresponding application without errors.

**Validates: Requirements 1.1, 1.3, 2.1, 2.3**

## Error Handling

### Escenarios de error:

1. **Respuesta vacía**: Si `response.body` es null o undefined
   - Lanzar error: "No se recibió el archivo"

2. **Base64 inválido**: Si la decodificación base64 falla
   - Lanzar error: "El archivo recibido está corrupto"

3. **Error HTTP 404**: No hay datos para exportar
   - Lanzar error: "No hay datos para exportar con los filtros seleccionados"

4. **Error HTTP 500**: Error del servidor
   - Lanzar error: "Error del servidor. Intenta nuevamente más tarde"

5. **Error de red**: No se puede conectar
   - Lanzar error: "No se pudo conectar con el servidor"

### Estrategia de manejo:

- Usar operador `catchError` de RxJS
- Convertir errores HTTP a mensajes descriptivos
- Propagar errores como Observable con `throwError`
- Los componentes que llaman al servicio deben mostrar los errores al usuario

## Testing Strategy

### Unit Tests

1. **Test de decodificación base64**
   - Entrada: String base64 válido
   - Salida esperada: Blob con tamaño correcto

2. **Test de tipos MIME**
   - Entrada: 'excel'
   - Salida esperada: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
   - Entrada: 'pdf'
   - Salida esperada: 'application/pdf'

3. **Test de extracción de filename**
   - Entrada: Header 'Content-Disposition: attachment; filename="test.xlsx"'
   - Salida esperada: 'test.xlsx'

4. **Test de manejo de errores**
   - Entrada: HttpErrorResponse con status 404
   - Salida esperada: Error con mensaje "No hay datos para exportar..."

### Property-Based Tests

Los property-based tests se implementarán usando la librería `fast-check` para TypeScript/JavaScript.

1. **Property 1: Base64 round-trip**
   - Generar datos binarios aleatorios
   - Codificar a base64
   - Decodificar usando la función del servicio
   - Verificar que los datos son idénticos

2. **Property 2: MIME type consistency**
   - Para cualquier formato válido ('excel' o 'pdf')
   - El MIME type devuelto debe ser el correcto y consistente

3. **Property 3: Blob creation**
   - Para cualquier string base64 válido y MIME type
   - Crear un Blob debe producir un objeto con el tipo correcto

### Integration Tests

1. **Test end-to-end de exportación Excel**
   - Llamar a `exportToExcel` con opciones válidas
   - Verificar que se descarga un archivo
   - Verificar que el archivo puede ser leído (usando una librería de Excel)

2. **Test end-to-end de exportación PDF**
   - Llamar a `exportToPDF` con opciones válidas
   - Verificar que se descarga un archivo
   - Verificar que el archivo tiene la estructura PDF válida

## Implementation Details

### Función de decodificación base64

```typescript
private base64ToBlob(base64: string, mimeType: string): Blob {
  // Decodificar base64 a string binario
  const binaryString = atob(base64);
  
  // Convertir string binario a array de bytes
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Crear y retornar Blob
  return new Blob([bytes], { type: mimeType });
}
```

### Modificación del método exportToExcel

```typescript
exportToExcel(options: Omit<ExportOptions, 'format'>): Observable<Blob> {
  const url = this.buildExportUrl({ ...options, format: 'excel' });
  
  return this.http.get(url, { 
    responseType: 'text',  // Cambio clave: recibir como texto
    observe: 'response'
  }).pipe(
    map(response => {
      if (!response.body) {
        throw new Error('No se recibió el archivo');
      }
      
      // Decodificar base64 y crear Blob
      const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = this.base64ToBlob(response.body, mimeType);
      
      // Extraer filename
      const filename = this.extractFilename(response.headers) || 'export.xlsx';
      
      // Descargar
      this.downloadFile(blob, filename);
      
      return blob;
    }),
    catchError(this.handleError)
  );
}
```

### Tipos MIME

```typescript
private getMimeType(format: 'excel' | 'pdf'): string {
  const mimeTypes = {
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf'
  };
  return mimeTypes[format];
}
```

## Alternative Approaches Considered

### Alternativa 1: Modificar las Lambdas para devolver binario directo
- **Pros**: No requiere cambios en el frontend
- **Contras**: API Gateway tiene limitaciones con respuestas binarias grandes, requiere configuración adicional de API Gateway
- **Decisión**: Rechazada porque la configuración actual de API Gateway funciona bien con base64

### Alternativa 2: Usar un proxy intermedio
- **Pros**: Separa la lógica de decodificación
- **Contras**: Agrega complejidad innecesaria, otro punto de falla
- **Decisión**: Rechazada por sobrecarga arquitectónica

### Alternativa 3: Cambiar responseType basado en headers
- **Pros**: Más flexible
- **Contras**: API Gateway siempre devuelve base64 para binarios, no hay beneficio
- **Decisión**: Rechazada porque siempre recibiremos base64

## Performance Considerations

- La decodificación base64 es una operación síncrona que puede bloquear el hilo principal para archivos muy grandes
- Para archivos > 10MB, considerar usar Web Workers
- El tamaño del archivo base64 es ~33% más grande que el binario original
- La conversión de string a Uint8Array es O(n) donde n es el tamaño del archivo

## Security Considerations

- Validar que el contenido recibido es realmente base64 válido antes de decodificar
- No ejecutar código del contenido decodificado
- Validar el tipo MIME antes de crear el Blob
- Sanitizar el filename extraído de los headers para prevenir path traversal

## Dependencies

- `@angular/common/http`: Para HttpClient
- `rxjs`: Para operadores reactivos
- `file-saver`: Para descargar archivos (ya instalado)
- `fast-check`: Para property-based testing (nuevo)
