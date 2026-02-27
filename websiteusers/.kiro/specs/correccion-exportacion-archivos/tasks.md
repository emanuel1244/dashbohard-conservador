# Implementation Plan

- [x] 1. Agregar funciones auxiliares al ExportService


  - Crear función `base64ToBlob(base64: string, mimeType: string): Blob` para decodificar base64
  - Crear función `getMimeType(format: 'excel' | 'pdf'): string` para obtener el tipo MIME correcto
  - Crear función `extractFilename(headers: HttpHeaders): string` para extraer el nombre del archivo
  - _Requirements: 3.2, 3.3, 3.4_

- [ ]* 1.1 Write property test for base64 round-trip
  - **Property 1: Base64 round-trip preserves data**
  - **Validates: Requirements 1.2, 2.2**

- [ ]* 1.2 Write property test for MIME type consistency
  - **Property 2: MIME type matches file format**
  - **Validates: Requirements 3.3**

- [ ]* 1.3 Write property test for Blob creation
  - **Property 3: Blob creation produces valid objects**
  - **Validates: Requirements 3.2**

- [ ]* 1.4 Write property test for filename extraction
  - **Property 4: Filename extraction handles all valid headers**
  - **Validates: Requirements 3.4**


- [x] 2. Modificar método exportToExcel
  - Cambiar `responseType` de 'blob' a 'text' para recibir base64
  - Usar `base64ToBlob` para decodificar la respuesta
  - Usar `getMimeType('excel')` para el tipo MIME
  - Usar `extractFilename` para obtener el nombre del archivo
  - Mantener el manejo de errores existente

  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Modificar método exportToPDF
  - Cambiar `responseType` de 'blob' a 'text' para recibir base64
  - Usar `base64ToBlob` para decodificar la respuesta
  - Usar `getMimeType('pdf')` para el tipo MIME
  - Usar `extractFilename` para obtener el nombre del archivo

  - Mantener el manejo de errores existente
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Mejorar manejo de errores en handleError
  - Agregar validación para respuestas vacías
  - Agregar manejo específico para errores de decodificación base64
  - Mejorar mensajes de error para diferentes códigos HTTP
  - Agregar manejo para errores de red
  - _Requirements: 1.4, 2.4_



- [ ]* 4.1 Write property test for error handling
  - **Property 5: Error responses produce descriptive messages**
  - **Validates: Requirements 1.4, 2.4**

- [ ] 5. Checkpoint - Verificar que todas las funciones auxiliares funcionan
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 6. Write integration test for Excel export
  - Verificar que se puede exportar personas a Excel
  - Verificar que se puede exportar líderes a Excel
  - Verificar que los archivos descargados son válidos
  - _Requirements: 4.1, 4.2_

- [ ]* 7. Write integration test for PDF export
  - Verificar que se puede generar reporte general en PDF
  - Verificar que se puede generar reporte de líder en PDF
  - Verificar que se pueden generar certificados en PDF
  - Verificar que se puede generar listado de mesa en PDF
  - Verificar que los archivos descargados son válidos


  - _Requirements: 4.3, 4.4, 4.5_

- [ ]* 8. Write property test for file validity
  - **Property 6: Downloaded files are valid and openable**
  - **Validates: Requirements 1.1, 1.3, 2.1, 2.3**

- [ ] 9. Final Checkpoint - Verificar todas las exportaciones
  - Ensure all tests pass, ask the user if questions arise.
