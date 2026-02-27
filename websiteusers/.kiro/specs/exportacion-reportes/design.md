# Design Document - Exportación y Reportes

## Overview

Este documento describe el diseño técnico para implementar funcionalidades de exportación de datos a Excel y generación de reportes en PDF en el Sistema de Gestión Electoral. La solución utilizará bibliotecas especializadas para la generación de archivos (ExcelJS para Excel, jsPDF/pdfmake para PDF) y se integrará con el backend existente basado en AWS Lambda.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Angular)     │
└────────┬────────┘
         │
         │ HTTP Request
         │ (GET /api/export/...)
         │
┌────────▼────────┐
│  API Gateway    │
└────────┬────────┘
         │
         │ Invoke
         │
┌────────▼────────┐
│  Lambda Export  │
│  - Excel Gen    │
│  - PDF Gen      │
└────────┬────────┘
         │
         │ Query
         │
┌────────▼────────┐
│   DynamoDB      │
│  (Personas,     │
│   Líderes)      │
└─────────────────┘
```

### Component Responsibilities

1. **Frontend (Angular)**
   - Capturar filtros del usuario
   - Construir URLs de exportación con parámetros
   - Iniciar descarga de archivos
   - Mostrar feedback visual (loaders, toasts)

2. **API Gateway**
   - Rutear solicitudes de exportación
   - Manejar CORS
   - Aplicar throttling si es necesario

3. **Lambda Functions**
   - `lambda-export-excel`: Generar archivos Excel
   - `lambda-export-pdf`: Generar archivos PDF
   - Consultar DynamoDB
   - Aplicar filtros
   - Generar archivos en memoria
   - Retornar archivo como base64 o URL presignada de S3

4. **DynamoDB**
   - Almacenar datos de personas y líderes
   - Proveer queries eficientes

## Components and Interfaces

### Frontend Components

#### ExportService (Angular Service)

```typescript
interface ExportOptions {
  format: 'excel' | 'pdf';
  type: 'personas' | 'lideres' | 'reporte-general' | 'reporte-lider' | 'certificado' | 'listado-mesa';
  filters?: {
    liderId?: string;
    zona?: string;
    mesa?: string;
    estado?: string;
    nivelCompromiso?: string;
    busqueda?: string;
  };
  ids?: string[]; // Para certificados múltiples
}

class ExportService {
  exportToExcel(options: ExportOptions): Observable<Blob>
  exportToPDF(options: ExportOptions): Observable<Blob>
  downloadFile(blob: Blob, filename: string): void
  buildExportUrl(options: ExportOptions): string
}
```

#### Dashboard Component Updates

```typescript
// Nuevos métodos
exportarPersonasExcel(): void
exportarLideresExcel(): void
generarReporteGeneralPDF(): void
generarReporteLiderPDF(liderId: string): void
generarCertificado(personaId: string): void
generarListadoMesaPDF(mesa: string): void
```

### Backend Components

#### Lambda Export Excel

```javascript
// Endpoint: GET /api/export/excel
// Query params: type, filters (JSON)

exports.handler = async (event) => {
  const { type, filters } = parseQueryParams(event);
  
  // Consultar DynamoDB
  const data = await queryData(type, filters);
  
  // Generar Excel
  const workbook = await generateExcel(type, data, filters);
  
  // Retornar archivo
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${generateFilename(type, filters)}"`,
      'Access-Control-Allow-Origin': '*'
    },
    body: workbook.toBuffer().toString('base64'),
    isBase64Encoded: true
  };
};
```

#### Lambda Export PDF

```javascript
// Endpoint: GET /api/export/pdf
// Query params: type, filters (JSON), ids (para certificados)

exports.handler = async (event) => {
  const { type, filters, ids } = parseQueryParams(event);
  
  // Consultar DynamoDB
  const data = await queryData(type, filters, ids);
  
  // Generar PDF según tipo
  let pdfBuffer;
  switch(type) {
    case 'reporte-general':
      pdfBuffer = await generateReporteGeneral(data);
      break;
    case 'reporte-lider':
      pdfBuffer = await generateReporteLider(data);
      break;
    case 'certificado':
      pdfBuffer = await generateCertificados(data);
      break;
    case 'listado-mesa':
      pdfBuffer = await generateListadoMesa(data);
      break;
  }
  
  // Retornar archivo
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${generateFilename(type, filters)}"`,
      'Access-Control-Allow-Origin': '*'
    },
    body: pdfBuffer.toString('base64'),
    isBase64Encoded: true
  };
};
```

## Data Models

### Export Request

```typescript
interface ExportRequest {
  type: 'personas' | 'lideres' | 'reporte-general' | 'reporte-lider' | 'certificado' | 'listado-mesa';
  format: 'excel' | 'pdf';
  filters?: FilterOptions;
  ids?: string[];
  timestamp: number;
}

interface FilterOptions {
  liderId?: string;
  zona?: string;
  mesa?: string;
  estado?: 'Activo' | 'Inactivo' | 'Potencial';
  nivelCompromiso?: 'Alto' | 'Medio' | 'Bajo';
  busqueda?: string;
}
```

### Excel Structure

```typescript
interface ExcelWorkbook {
  sheets: ExcelSheet[];
}

interface ExcelSheet {
  name: string;
  headers: string[];
  rows: any[][];
  styles?: CellStyle[];
}

interface CellStyle {
  font?: { bold?: boolean; color?: string; size?: number };
  fill?: { type: string; fgColor: string };
  alignment?: { horizontal: string; vertical: string };
}
```

### PDF Structure

```typescript
interface PDFDocument {
  header: PDFHeader;
  content: PDFContent[];
  footer: PDFFooter;
  styles: PDFStyles;
}

interface PDFHeader {
  logo: string; // base64
  title: string;
  subtitle?: string;
  date: string;
}

interface PDFContent {
  type: 'text' | 'table' | 'chart' | 'image';
  data: any;
  style?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Excel export completeness
*For any* set of personas in the database, when exporting to Excel, the generated file should contain exactly the same number of rows as personas in the dataset (excluding header row).
**Validates: Requirements 1.1, 1.2**

### Property 2: Excel column presence
*For any* Excel export of personas, the file should contain all required columns: Nombre, Cédula, Celular, Correo, Dirección, Mesa, Lugar de Votación, Dirección de Votación, Zona, Líder Asignado, Estado, Nivel de Compromiso, Notas.
**Validates: Requirements 1.2**

### Property 3: Filename format correctness
*For any* export operation, the generated filename should match the expected pattern for that export type (e.g., "personas_completo_YYYYMMDD_HHMMSS.xlsx").
**Validates: Requirements 1.3, 2.2, 3.3, 3.4**

### Property 4: Filter application correctness
*For any* export with a líder filter applied, all rows in the exported file should have the liderId matching the filter value.
**Validates: Requirements 2.1, 3.1, 3.2**

### Property 5: Multiple filter combination
*For any* combination of filters (líder, zona, estado, compromiso), the exported data should satisfy all filter conditions simultaneously.
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Empty result handling
*For any* filter combination that results in zero matching records, the system should display the message "No hay datos para exportar con los filtros seleccionados" and not generate a file.
**Validates: Requirements 2.4, 4.5**

### Property 7: PDF section completeness
*For any* general report PDF generation, the document should contain all required sections: total personas, total líderes, distribución por estado, distribución por compromiso, top 10 mesas, distribución por zona.
**Validates: Requirements 5.2**

### Property 8: Líder report data accuracy
*For any* líder report PDF, the statistics shown (total personas, activas, alto compromiso) should match the actual count of personas assigned to that líder with those characteristics.
**Validates: Requirements 6.2**

### Property 9: Certificate personalization
*For any* certificate generation, the PDF should contain the exact nombre and cédula of the person for whom the certificate is being generated.
**Validates: Requirements 7.2**

### Property 10: Mesa listing alphabetical order
*For any* mesa listing PDF, the personas should be ordered alphabetically by nombre.
**Validates: Requirements 8.2**

### Property 11: Toast notification display
*For any* successful export operation, a success toast notification should be displayed with the appropriate message.
**Validates: Requirements 1.5, 5.6, 11.1**

### Property 12: Error notification display
*For any* failed export operation, an error toast notification should be displayed with an appropriate error message.
**Validates: Requirements 11.2, 11.3, 11.4**

### Property 13: Excel formatting presence
*For any* Excel export, the file should have formatted headers (bold, colored) and auto-filters enabled on the header row.
**Validates: Requirements 10.1, 10.2, 10.3**

### Property 14: PDF branding consistency
*For any* PDF generation, the document should use the official party colors (blue #003DA5 and gold #FFD700) and include the party logo.
**Validates: Requirements 5.4, 10.6**

### Property 15: Líderes export statistics accuracy
*For any* líderes Excel export, the "Total de Personas Asignadas" column for each líder should match the actual count of personas with that liderId.
**Validates: Requirements 12.2**

## Error Handling

### Error Scenarios

1. **No Data Found**
   - Show warning toast: "No hay datos para exportar"
   - Don't generate file
   - Log warning

2. **Server Error**
   - Show error toast: "Error al generar el archivo"
   - Log error details
   - Retry option

3. **Timeout**
   - Show error toast: "La generación tardó demasiado"
   - Suggest using more specific filters
   - Log timeout

4. **Invalid Filters**
   - Validate filters before sending request
   - Show error toast with specific validation message
   - Don't send request

5. **File Generation Error**
   - Catch exceptions during Excel/PDF generation
   - Return 500 error with details
   - Log full stack trace

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: number;
}
```

## Testing Strategy

### Unit Testing

We will write unit tests for:
- Filter building logic
- Filename generation
- Data transformation for Excel/PDF
- Error handling paths

### Property-Based Testing

We will use **fast-check** (JavaScript) for property-based testing with a minimum of 100 iterations per property.

Each property-based test will be tagged with a comment referencing the correctness property:
- Format: `// Feature: exportacion-reportes, Property X: [property text]`
- Example: `// Feature: exportacion-reportes, Property 1: Excel export completeness`

Property tests will:
- Generate random datasets of personas and líderes
- Apply random filter combinations
- Verify that exported data matches expected properties
- Verify file format correctness
- Verify error handling for edge cases

### Integration Testing

- Test complete export flow from frontend to Lambda
- Verify file downloads work in browser
- Test with real DynamoDB data
- Verify CORS headers
- Test file size limits

## Performance Considerations

### Optimization Strategies

1. **Streaming for Large Datasets**
   - For exports > 5000 records, use streaming
   - Generate file in chunks
   - Use S3 for temporary storage if needed

2. **Caching**
   - Cache frequently requested reports (e.g., general report)
   - Cache for 5 minutes
   - Invalidate on data changes

3. **Pagination**
   - Limit Excel exports to 10,000 rows
   - Suggest filters for larger datasets

4. **Async Generation**
   - For very large reports, use async generation
   - Send email with download link when ready
   - Show progress indicator

### Performance Targets

- Excel < 1000 rows: < 3 seconds
- Excel 1000-5000 rows: < 10 seconds
- PDF reports: < 5 seconds
- Certificates: < 2 seconds

## Security Considerations

1. **Authentication**
   - Verify user is authenticated before allowing export
   - Check user role/permissions

2. **Data Filtering**
   - Sanitize all filter inputs
   - Prevent SQL injection (use parameterized queries)
   - Validate filter values against allowed values

3. **Rate Limiting**
   - Limit exports to 10 per minute per user
   - Prevent abuse

4. **Data Privacy**
   - Don't include sensitive data in filenames
   - Log export operations for audit
   - Comply with data protection regulations

## Libraries and Dependencies

### Frontend
- **ExcelJS**: Excel file generation (client-side if needed)
- **jsPDF** or **pdfmake**: PDF generation (client-side if needed)
- **FileSaver.js**: File download handling

### Backend (Lambda)
- **exceljs**: Excel file generation (Node.js)
- **pdfkit** or **pdfmake**: PDF generation (Node.js)
- **aws-sdk**: DynamoDB queries, S3 storage
- **chart.js** or **d3**: Chart generation for PDFs

### Installation

```bash
# Frontend
npm install exceljs jspdf pdfmake file-saver

# Backend
npm install exceljs pdfkit aws-sdk
```

## Deployment Considerations

1. **Lambda Configuration**
   - Memory: 512MB (for PDF generation)
   - Timeout: 30 seconds
   - Environment variables: S3_BUCKET, DYNAMODB_TABLE

2. **API Gateway**
   - Binary media types: application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   - CORS configuration
   - Request/response size limits

3. **S3 Bucket** (optional, for large files)
   - Bucket for temporary file storage
   - Lifecycle policy: delete after 24 hours
   - Presigned URLs for downloads

## Future Enhancements

1. **Scheduled Reports**
   - Generate reports automatically (daily/weekly)
   - Email to administrators

2. **Custom Templates**
   - Allow users to customize PDF templates
   - Save export configurations

3. **Batch Operations**
   - Export multiple reports at once
   - Zip multiple files

4. **Advanced Charts**
   - More visualization options in PDFs
   - Interactive charts in Excel
