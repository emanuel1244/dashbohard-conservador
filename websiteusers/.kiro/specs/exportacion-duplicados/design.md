# Design Document

## Overview

Este documento describe el diseño técnico para implementar la funcionalidad de exportación de registros duplicados detectados durante la carga masiva de archivos Excel. La solución permitirá a los usuarios descargar un archivo Excel con todos los registros que fueron rechazados por tener cédulas duplicadas, facilitando su revisión, corrección y posterior re-carga.

La funcionalidad se integra con el flujo existente de carga masiva de Excel, extendiendo la respuesta del backend y agregando capacidades de exportación en el frontend.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Angular)     │
│                 │
│  ┌───────────┐  │
│  │ Dashboard │  │
│  │ Component │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │  Export   │  │
│  │  Service  │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   API Gateway   │
└────────┬────────┘
         │
┌────────▼────────┐
│  Lambda Upload  │
│  Excel Handler  │
│                 │
│  ┌───────────┐  │
│  │ Duplicate │  │
│  │ Detection │  │
│  └───────────┘  │
└─────────────────┘
```

### Component Interaction Flow

1. Usuario selecciona archivo Excel
2. Frontend envía archivo a Lambda via API Gateway
3. Lambda procesa archivo y detecta duplicados
4. Lambda retorna respuesta con estadísticas y array de duplicados
5. Frontend muestra resumen con contador de duplicados
6. Usuario hace clic en "Descargar Excel con Duplicados"
7. Frontend llama al endpoint existente `/api/export/excel` con type='duplicados' y los datos de duplicados
8. Lambda genera archivo Excel usando la infraestructura existente de ExcelJS
9. Lambda retorna archivo en base64
10. Frontend descarga el archivo automáticamente usando el servicio existente

## Components and Interfaces

### Backend Components

#### Lambda Upload Excel Handler (Modificación)

**Responsabilidad**: Procesar archivo Excel, detectar duplicados y retornar información detallada

**Modificaciones necesarias**:
- Enriquecer el objeto `duplicados` con información adicional
- Agregar timestamp de detección
- Incluir motivo específico del rechazo
- Preservar datos completos del registro original

**Interface de Respuesta Extendida**:

```typescript
interface UploadResponse {
  success: boolean;
  mensaje: string;
  estadisticas: {
    totalProcesadas: number;
    agregadas: number;
    duplicados: number;
    errores: number;
  };
  duplicados: DuplicadoDetallado[];
  errores: ErrorDetallado[];
  personas: Persona[];
  lider?: {
    nombre: string;
    personasAsignadas: number;
  };
}

interface DuplicadoDetallado {
  fila: number;
  persona: Persona;
  motivoRechazo: string;
  fechaDeteccion: string;
  existeEnBD: boolean;
  fechaRegistroOriginal?: string;
}
```

#### Lambda Export Excel Handler (Extensión)

**Responsabilidad**: Generar archivos Excel para diferentes tipos de datos, incluyendo duplicados

**Modificaciones necesarias**:
- Agregar soporte para `type='duplicados'` en el endpoint existente
- Reutilizar la infraestructura existente de ExcelJS
- Mantener el mismo formato de respuesta (base64 encoded)

**Nueva función a agregar**:

```javascript
async function generateExcelDuplicados(duplicados) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Duplicados');
  
  // Define columns (originales + adicionales)
  worksheet.columns = [
    { header: 'Fila Original', key: 'fila', width: 15 },
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'Cédula', key: 'cedula', width: 15 },
    { header: 'Celular', key: 'celular', width: 15 },
    { header: 'Correo', key: 'correo', width: 30 },
    { header: 'Dirección', key: 'direccion', width: 35 },
    { header: 'Mesa', key: 'mesa', width: 10 },
    { header: 'Lugar de Votación', key: 'lugarVotacion', width: 30 },
    { header: 'Dirección de Votación', key: 'direccionVotacion', width: 35 },
    { header: 'Zona', key: 'zona', width: 15 },
    { header: 'Líder Asignado', key: 'liderNombre', width: 30 },
    { header: 'Motivo Rechazo', key: 'motivoRechazo', width: 30 },
    { header: 'Fecha Detección', key: 'fechaDeteccion', width: 20 }
  ];
  
  // Add data rows
  // Style header
  // Add borders
  // Return workbook
}
```

### Frontend Components

#### Dashboard Component (Modificación)

**Responsabilidad**: Mostrar resumen de duplicados y botón de descarga

**Nuevas propiedades**:
```typescript
duplicadosEncontrados: DuplicadoDetallado[] = [];
isExportingDuplicates = false;
mostrandoDuplicados = false;
```

**Nuevos métodos**:
```typescript
descargarExcelDuplicados(): void {
  if (this.isExportingDuplicates || this.duplicadosEncontrados.length === 0) return;
  
  this.isExportingDuplicates = true;
  
  // Usar el servicio existente de exportación
  this.exportService.exportarDuplicadosExcel(this.duplicadosEncontrados).subscribe({
    next: () => {
      this.isExportingDuplicates = false;
      this.mostrarMensajeExito('Archivo de duplicados descargado correctamente');
    },
    error: (error) => {
      this.isExportingDuplicates = false;
      this.mostrarMensajeError(error.message || 'Error al generar el archivo de duplicados');
    }
  });
}

toggleDuplicados(): void {
  this.mostrandoDuplicados = !this.mostrandoDuplicados;
}
```

#### Export Service (Extensión Mínima)

**Responsabilidad**: Agregar método para exportar duplicados usando la infraestructura existente

**Nuevo método**:
```typescript
/**
 * Exportar duplicados a Excel
 */
exportarDuplicadosExcel(duplicados: any[]): Observable<Blob> {
  return this.exportToExcel({
    type: 'duplicados' as any,
    filters: { duplicados }
  });
}
```

**Nota**: Este método reutiliza completamente la infraestructura existente de `exportToExcel()`, solo agrega un nuevo tipo de exportación. No se modifica ninguna lógica existente.

### UI Components

#### Sección de Resumen de Carga

**Ubicación**: Después del mensaje de éxito de carga

**Estructura HTML**:
```html
<div class="upload-summary" *ngIf="mensajeUpload">
  <div class="summary-stats">
    <div class="stat success">
      <i class="icon-check"></i>
      <span>{{estadisticas.agregadas}} agregadas</span>
    </div>
    
    <div class="stat warning" *ngIf="estadisticas.duplicados > 0">
      <i class="icon-warning"></i>
      <span>{{estadisticas.duplicados}} duplicados</span>
    </div>
    
    <div class="stat error" *ngIf="estadisticas.errores > 0">
      <i class="icon-error"></i>
      <span>{{estadisticas.errores}} errores</span>
    </div>
  </div>
  
  <!-- Sección expandible de duplicados -->
  <div class="duplicates-section" *ngIf="duplicadosEncontrados.length > 0">
    <button class="expand-btn" (click)="toggleDuplicados()">
      <i class="icon-expand"></i>
      Duplicados Encontrados ({{duplicadosEncontrados.length}})
    </button>
    
    <div class="duplicates-list" *ngIf="mostrandoDuplicados">
      <div class="duplicate-item" *ngFor="let dup of duplicadosVisibles">
        <span class="fila">Fila {{dup.fila}}</span>
        <span class="nombre">{{dup.persona.nombre}}</span>
        <span class="cedula">{{dup.persona.cedula}}</span>
      </div>
      
      <button *ngIf="duplicadosEncontrados.length > 5" 
              class="show-more"
              (click)="mostrarTodosDuplicados()">
        +{{duplicadosEncontrados.length - 5}} más...
      </button>
    </div>
    
    <!-- Botón de descarga -->
    <button class="btn-download-duplicates"
            (click)="descargarExcelDuplicados()"
            [disabled]="isGeneratingDuplicatesFile"
            title="Descargar archivo Excel con los registros duplicados">
      <i class="icon-excel"></i>
      <span *ngIf="!isGeneratingDuplicatesFile">Descargar Excel con Duplicados</span>
      <span *ngIf="isGeneratingDuplicatesFile">
        <i class="spinner"></i> Generando archivo...
      </span>
    </button>
  </div>
</div>
```

## Data Models

### DuplicadoDetallado

```typescript
interface DuplicadoDetallado {
  // Número de fila en el archivo original (1-indexed)
  fila: number;
  
  // Datos completos de la persona duplicada
  persona: Persona;
  
  // Motivo específico del rechazo
  motivoRechazo: 'Cédula ya existe en el sistema' | 'Cédula duplicada en el archivo';
  
  // Timestamp de cuando se detectó el duplicado
  fechaDeteccion: string; // ISO 8601 format
  
  // Indica si el duplicado existe en la BD o solo en el archivo
  existeEnBD: boolean;
  
  // Fecha del registro original en BD (si existe)
  fechaRegistroOriginal?: string; // ISO 8601 format
}
```

### ExcelDuplicadosConfig

```typescript
interface ExcelDuplicadosConfig {
  // Columnas del archivo original a incluir
  columnasOriginales: string[];
  
  // Columnas adicionales a agregar
  columnasAdicionales: Array<{
    nombre: string;
    campo: keyof DuplicadoDetallado;
    formato?: 'texto' | 'numero' | 'fecha';
  }>;
  
  // Configuración de estilos
  estilos: {
    encabezado: ExcelStyle;
    filasPares: ExcelStyle;
    filasImpares: ExcelStyle;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties from the prework analysis, the following redundancies were identified:

- Properties 3.3 and 4.1 both test column preservation - can be combined
- Properties 3.4, 3.5, and 8.1 all test additional column inclusion - can be combined into one comprehensive property
- Properties 5.1 and 5.2 test duplicate detection logic - can be combined into one property about detection across both sources
- Properties 6.1, 6.2, 6.4 test UI state management during export - can be combined

After consolidation, we have the following unique correctness properties:

Property 1: Duplicate count accuracy
*For any* processed Excel file, the displayed duplicate count should equal the actual number of duplicate records detected
**Validates: Requirements 1.1, 1.2**

Property 2: Duplicate detection completeness
*For any* Excel file with records, the system should detect duplicates both against the existing database and within the same file, marking each with the appropriate rejection reason
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

Property 3: Export file generation
*For any* set of detected duplicates, clicking the download button should generate an Excel file containing exactly those duplicate records
**Validates: Requirements 3.2, 3.3**

Property 4: Column preservation and augmentation
*For any* generated duplicates file, it should contain all original columns in their original order, plus additional columns (Motivo Rechazo, Fila Original, Fecha Detección) appended at the end
**Validates: Requirements 3.3, 3.4, 3.5, 4.1, 4.2, 4.4, 8.1**

Property 5: Data type preservation
*For any* duplicate record exported, the data types (text, numbers, dates) should be preserved from the original file
**Validates: Requirements 4.3**

Property 6: Filename format
*For any* generated duplicates file, the filename should follow the pattern "duplicados_[fecha]_[hora].xlsx" where fecha and hora represent the download timestamp
**Validates: Requirements 3.6**

Property 7: Button visibility
*For any* upload result, the download button should be visible if and only if duplicates were detected (count > 0)
**Validates: Requirements 3.1, 3.7**

Property 8: List display completeness
*For any* duplicate record in the list, the displayed information should include row number, full name, and cedula
**Validates: Requirements 2.3**

Property 9: List pagination
*For any* duplicate list with more than 5 items, initially only the first 5 should be visible with a "+N más..." link to expand
**Validates: Requirements 2.4**

Property 10: Export count invariant
*For any* generated Excel file, the number of data rows should exactly match the duplicate count reported in the upload summary
**Validates: Requirements 9.3**

Property 11: Data validation before export
*For any* duplicate record being exported, it should have at minimum a nombre and cedula field populated
**Validates: Requirements 9.1**

Property 12: Row ordering
*For any* generated duplicates file, the records should be sorted by their original row number in ascending order
**Validates: Requirements 8.4**

Property 13: UI state management during export
*For any* export operation, while the file is being generated, the download button should be disabled and a loading indicator should be visible
**Validates: Requirements 6.1, 6.2, 6.4**

Property 14: Success notification
*For any* successful file generation, a toast notification with the message "Archivo de duplicados descargado correctamente" should be displayed
**Validates: Requirements 7.1**

Property 15: Error notification
*For any* failed file generation, a toast notification with an error message should be displayed
**Validates: Requirements 7.2**

Property 16: Expandable section presence
*For any* upload result with duplicates, an expandable section titled "Duplicados Encontrados (N)" should be present in the UI
**Validates: Requirements 2.1**

Property 17: Metadata inclusion
*For any* duplicate record, the export should include detection metadata (fechaDeteccion, existeEnBD, and fechaRegistroOriginal if applicable)
**Validates: Requirements 5.5, 8.3**

Property 18: Conditional leader column
*For any* duplicates file where the original upload included leader assignment, the export should include a "Líder Asignado" column
**Validates: Requirements 8.2**

## Error Handling

### Frontend Error Scenarios

1. **File Generation Failure**
   - Cause: ExcelJS library error, memory issues
   - Handling: Catch exception, show error toast, re-enable button
   - User Action: Retry download or contact support

2. **Empty Duplicates Array**
   - Cause: User clicks download when no duplicates exist
   - Handling: Show warning toast "No hay duplicados para exportar"
   - User Action: None needed

3. **Browser Download Blocked**
   - Cause: Browser security settings
   - Handling: Detect download failure, show toast with instructions
   - User Action: Allow downloads in browser settings

4. **Large File Generation**
   - Cause: Thousands of duplicates
   - Handling: Show progress indicator, use streaming if needed
   - User Action: Wait for completion

### Backend Error Scenarios

1. **Duplicate Detection Logic Error**
   - Cause: Database query failure
   - Handling: Log error, return partial results with warning
   - User Action: Review results, retry if needed

2. **Memory Overflow**
   - Cause: Extremely large Excel file
   - Handling: Lambda timeout, return error response
   - User Action: Split file into smaller chunks

3. **Invalid Data Format**
   - Cause: Corrupted Excel file
   - Handling: Return 400 error with details
   - User Action: Fix file format and retry

## Testing Strategy

### Unit Testing

The testing strategy will include both unit tests and property-based tests to ensure comprehensive coverage.

**Unit Tests** will cover:
- ExportService.exportarDuplicadosExcel() method with sample data
- Dashboard component duplicate display logic
- Filename generation with fixed timestamps
- Button visibility toggling
- Toast notification triggering

**Property-Based Testing** will use **fast-check** library for TypeScript/JavaScript to verify universal properties across many randomly generated inputs.

### Property-Based Testing

**Library**: fast-check (https://github.com/dubzzz/fast-check)

**Configuration**: Each property test should run a minimum of 100 iterations to ensure statistical confidence.

**Test Tagging**: Each property-based test must include a comment with the format:
```typescript
// **Feature: exportacion-duplicados, Property N: [property description]**
// **Validates: Requirements X.Y**
```

**Property Tests to Implement**:

1. **Property 1: Duplicate count accuracy**
   - Generator: Random Excel file data with varying duplicate counts
   - Test: Verify displayed count matches actual duplicates
   - Tag: `// **Feature: exportacion-duplicados, Property 1: Duplicate count accuracy**`

2. **Property 2: Duplicate detection completeness**
   - Generator: Random records with some duplicates in DB and in file
   - Test: Verify all duplicates detected with correct reasons
   - Tag: `// **Feature: exportacion-duplicados, Property 2: Duplicate detection completeness**`

3. **Property 3: Export file generation**
   - Generator: Random duplicate arrays
   - Test: Verify file contains exactly the input duplicates
   - Tag: `// **Feature: exportacion-duplicados, Property 3: Export file generation**`

4. **Property 4: Column preservation and augmentation**
   - Generator: Random column sets and duplicate data
   - Test: Verify all original columns present + additional columns at end
   - Tag: `// **Feature: exportacion-duplicados, Property 4: Column preservation and augmentation**`

5. **Property 5: Data type preservation**
   - Generator: Random data with mixed types (strings, numbers, dates)
   - Test: Verify types preserved in export
   - Tag: `// **Feature: exportacion-duplicados, Property 5: Data type preservation**`

6. **Property 6: Filename format**
   - Generator: Random timestamps
   - Test: Verify filename matches pattern with correct timestamp
   - Tag: `// **Feature: exportacion-duplicados, Property 6: Filename format**`

7. **Property 7: Button visibility**
   - Generator: Random duplicate counts (including 0)
   - Test: Verify button visible iff count > 0
   - Tag: `// **Feature: exportacion-duplicados, Property 7: Button visibility**`

8. **Property 8: List display completeness**
   - Generator: Random duplicate records
   - Test: Verify each displayed item has row, name, cedula
   - Tag: `// **Feature: exportacion-duplicados, Property 8: List display completeness**`

9. **Property 9: List pagination**
   - Generator: Random duplicate lists of varying sizes
   - Test: Verify pagination at 5 items
   - Tag: `// **Feature: exportacion-duplicados, Property 9: List pagination**`

10. **Property 10: Export count invariant**
    - Generator: Random duplicate data
    - Test: Verify file row count equals reported count
    - Tag: `// **Feature: exportacion-duplicados, Property 10: Export count invariant**`

11. **Property 11: Data validation before export**
    - Generator: Random records with some missing nombre/cedula
    - Test: Verify only valid records exported or errors shown
    - Tag: `// **Feature: exportacion-duplicados, Property 11: Data validation before export**`

12. **Property 12: Row ordering**
    - Generator: Random duplicates with shuffled row numbers
    - Test: Verify export sorted by row number ascending
    - Tag: `// **Feature: exportacion-duplicados, Property 12: Row ordering**`

13. **Property 13: UI state management during export**
    - Generator: Random export operations
    - Test: Verify button disabled and loader shown during generation
    - Tag: `// **Feature: exportacion-duplicados, Property 13: UI state management during export**`

14. **Property 14: Success notification**
    - Generator: Random successful exports
    - Test: Verify success toast shown
    - Tag: `// **Feature: exportacion-duplicados, Property 14: Success notification**`

15. **Property 15: Error notification**
    - Generator: Random export failures
    - Test: Verify error toast shown
    - Tag: `// **Feature: exportacion-duplicados, Property 15: Error notification**`

16. **Property 16: Expandable section presence**
    - Generator: Random upload results with duplicates
    - Test: Verify expandable section exists in DOM
    - Tag: `// **Feature: exportacion-duplicados, Property 16: Expandable section presence**`

17. **Property 17: Metadata inclusion**
    - Generator: Random duplicates with metadata
    - Test: Verify all metadata fields present in export
    - Tag: `// **Feature: exportacion-duplicados, Property 17: Metadata inclusion**`

18. **Property 18: Conditional leader column**
    - Generator: Random uploads with/without leader data
    - Test: Verify leader column present only when applicable
    - Tag: `// **Feature: exportacion-duplicados, Property 18: Conditional leader column**`

### Integration Testing

- Test complete flow: upload file → detect duplicates → download Excel
- Test with real Excel files of varying sizes
- Test with different browsers (Chrome, Firefox, Safari, Edge)
- Test mobile responsiveness

### Manual Testing Checklist

- [ ] Upload file with no duplicates - verify button hidden
- [ ] Upload file with duplicates - verify count and list display
- [ ] Click download button - verify file downloads
- [ ] Open downloaded file - verify all columns present
- [ ] Verify filename format matches specification
- [ ] Test with large file (1000+ duplicates)
- [ ] Test expand/collapse of duplicate list
- [ ] Test "+N más..." link functionality
- [ ] Verify toast notifications appear and auto-dismiss
- [ ] Test on mobile device

## Implementation Notes

### Reutilización del Sistema de Exportación Existente

La solución aprovecha completamente la infraestructura de exportación Excel que ya está funcionando:

**Backend (lambda-export-excel.js)**:
- Se agrega soporte para `type='duplicados'` en el switch de tipos
- Se reutiliza toda la lógica de generación de Excel (ExcelJS, estilos, headers)
- Se mantiene el mismo formato de respuesta (base64 encoded)
- No se toca ninguna funcionalidad existente

**Frontend (export.service.ts)**:
- Se agrega un método `exportarDuplicadosExcel()` que llama a `exportToExcel()`
- Se reutiliza toda la lógica de decodificación base64, manejo de errores y descarga
- No se modifica ningún método existente

### Lambda Export Excel - Nueva Función

```javascript
/**
 * Generate Excel for duplicados
 */
async function generateExcelDuplicados(duplicados) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Duplicados');
  
  // Define columns (todas las originales + adicionales)
  worksheet.columns = [
    { header: 'Fila Original', key: 'fila', width: 15 },
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'Cédula', key: 'cedula', width: 15 },
    { header: 'Celular', key: 'celular', width: 15 },
    { header: 'Correo', key: 'correo', width: 30 },
    { header: 'Dirección', key: 'direccion', width: 35 },
    { header: 'Mesa', key: 'mesa', width: 10 },
    { header: 'Lugar de Votación', key: 'lugarVotacion', width: 30 },
    { header: 'Dirección de Votación', key: 'direccionVotacion', width: 35 },
    { header: 'Zona', key: 'zona', width: 15 },
    { header: 'Líder Asignado', key: 'liderNombre', width: 30 },
    { header: 'Motivo Rechazo', key: 'motivoRechazo', width: 30 },
    { header: 'Fecha Detección', key: 'fechaDeteccion', width: 20 }
  ];
  
  // Sort by fila (row number)
  const sortedDuplicados = [...duplicados].sort((a, b) => a.fila - b.fila);
  
  // Add data rows
  sortedDuplicados.forEach(dup => {
    worksheet.addRow({
      fila: dup.fila,
      nombre: dup.persona.nombre || '',
      cedula: dup.persona.cedula || '',
      celular: dup.persona.celular || '',
      correo: dup.persona.correo || '',
      direccion: dup.persona.direccion || '',
      mesa: dup.persona.mesa || '',
      lugarVotacion: dup.persona.lugarVotacion || '',
      direccionVotacion: dup.persona.direccionVotacion || '',
      zona: dup.persona.zona || '',
      liderNombre: dup.persona.liderNombre || '',
      motivoRechazo: dup.motivoRechazo || 'Cédula duplicada',
      fechaDeteccion: dup.fechaDeteccion ? new Date(dup.fechaDeteccion) : new Date()
    });
  });
  
  // Style header row (reutilizar estilos existentes)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.headerBg }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;
  
  // Add auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: 'M1'
  };
  
  // Add borders (reutilizar lógica existente)
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
  
  return workbook;
}
```

### Lambda Export Excel - Modificación del Handler

```javascript
// En el handler principal, agregar case para duplicados:

// Generate Excel based on type
let workbook;
if (type === 'lideres') {
  const personas = await queryData('personas', {});
  workbook = await generateExcelLideres(data, personas);
} else if (type === 'duplicados') {
  // Nuevo: generar Excel de duplicados
  const duplicados = filters.duplicados || [];
  workbook = await generateExcelDuplicados(duplicados);
} else {
  const lideres = await queryData('lideres', {});
  workbook = await generateExcelPersonas(data, filters, lideres);
}

// Generate filename
const filename = type === 'duplicados' 
  ? `duplicados_${new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_')}.xlsx`
  : generateFilename(type, filters);
```

### Performance Considerations

- For files with > 1000 duplicates, the backend Lambda handles generation efficiently
- Use virtual scrolling for large duplicate lists in UI
- Backend already optimized for Excel generation with ExcelJS
- No client-side memory concerns since generation happens server-side

### Accessibility

- Ensure download button has proper ARIA labels
- Provide keyboard navigation for expand/collapse
- Use semantic HTML for duplicate list
- Ensure color contrast meets WCAG AA standards
- Provide text alternatives for icons

## Security Considerations

- Validate file size before processing (max 10MB)
- Sanitize all data before displaying in UI (XSS prevention)
- Ensure downloaded files don't contain executable code
- Rate limit download requests to prevent abuse
- Log all export operations for audit trail
- Duplicados data is passed through existing secure API endpoint

## Dependencies

### No New Dependencies Required

La solución reutiliza completamente las dependencias existentes:

- **exceljs**: Ya instalado en el backend Lambda layer
- **file-saver**: Ya en uso en el frontend
- **@angular/common**: Ya disponible
- **rxjs**: Ya disponible

### Existing Dependencies

- **Backend**: ExcelJS ya configurado en lambda-export-excel.js
- **Frontend**: ExportService ya implementado y funcionando

## Deployment Considerations

- No backend changes required for MVP (uses existing duplicate detection)
- Frontend changes can be deployed independently
- No database migrations needed
- Consider feature flag for gradual rollout
- Monitor download success rate via analytics

## Future Enhancements

1. **Bulk Actions on Duplicates**
   - Allow user to select duplicates and merge/update in bulk
   - Provide "Fix and Re-upload" workflow

2. **Duplicate Resolution Suggestions**
   - AI-powered suggestions for resolving duplicates
   - Show side-by-side comparison of duplicate vs existing record

3. **Export Format Options**
   - Support CSV export in addition to Excel
   - PDF report with duplicate summary

4. **Advanced Filtering**
   - Filter duplicates by rejection reason
   - Search within duplicate list

5. **Historical Tracking**
   - Keep history of all duplicate exports
   - Show trends in duplicate rates over time
