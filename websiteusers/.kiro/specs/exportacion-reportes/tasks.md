# Implementation Plan - Exportación y Reportes

## Overview

Este plan implementa funcionalidades de exportación a Excel y generación de reportes en PDF, incluyendo backend (Lambda functions) y frontend (Angular service y UI).

## Tasks

- [x] 1. Configurar dependencias y estructura base



  - Instalar ExcelJS y PDFKit en backend
  - Instalar file-saver en frontend
  - Crear estructura de carpetas para lambdas de exportación
  - _Requirements: All_

- [x] 2. Implementar Lambda para exportación a Excel
  - [x] 2.1 Crear lambda-export-excel.js
    - Configurar handler básico
    - Implementar parseQueryParams() para extraer filtros
    - Implementar queryData() para consultar DynamoDB
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [x] 2.2 Implementar generación de Excel para personas
    - Crear función generateExcelPersonas()
    - Configurar columnas según requirements
    - Aplicar estilos (encabezados en negrita, colores)
    - Aplicar auto-filtros
    - Ajustar ancho de columnas
    - _Requirements: 1.2, 10.1, 10.2, 10.3_
  
  - [x] 2.3 Implementar filtros en exportación de personas
    - Aplicar filtro por líder
    - Aplicar filtro por zona
    - Aplicar filtro por mesa
    - Aplicar filtro por estado
    - Aplicar filtro por nivel de compromiso
    - Aplicar búsqueda por texto
    - Combinar múltiples filtros
    - _Requirements: 2.1, 3.1, 3.2, 4.1, 4.2, 4.3_
  
  - [x] 2.4 Implementar hoja de estadísticas para líder
    - Crear segunda hoja en workbook
    - Calcular total de personas
    - Calcular personas activas
    - Calcular personas con alto compromiso
    - _Requirements: 2.3_
  
  - [x] 2.5 Implementar generación de nombres de archivo
    - Crear función generateFilename()
    - Formato para lista completa
    - Formato para filtro por líder
    - Formato para filtro por zona
    - Formato para filtro por mesa
    - Incluir timestamp
    - _Requirements: 1.3, 2.2, 3.3, 3.4_
  
  - [x] 2.6 Implementar exportación de líderes
    - Crear función generateExcelLideres()
    - Incluir columnas de líder y estadísticas
    - Ordenar por total de personas (descendente)
    - Crear hoja de resumen
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 2.7 Implementar manejo de errores en Lambda Excel
    - Manejar caso sin datos (return 404)
    - Manejar errores de DynamoDB
    - Manejar errores de generación de Excel
    - Logging de errores
    - _Requirements: 11.2, 11.3_

- [x] 3. Implementar Lambda para generación de PDFs
  - [x] 3.1 Crear lambda-export-pdf.js
    - Configurar handler básico
    - Implementar parseQueryParams()
    - Implementar queryData()
    - Configurar PDFKit
    - _Requirements: 5.1, 6.1, 7.1, 8.1_
  
  - [x] 3.2 Implementar reporte general PDF
    - Crear función generateReporteGeneral()
    - Agregar header con logo y título
    - Agregar sección de estadísticas generales
    - Agregar gráficos de distribución
    - Agregar top 10 mesas
    - Agregar footer con paginación
    - Aplicar colores del partido
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.4, 10.5, 10.6_
  
  - [x] 3.3 Implementar reporte por líder PDF
    - Crear función generateReporteLider()
    - Agregar datos del líder
    - Agregar estadísticas del líder
    - Agregar lista de personas asignadas
    - Organizar por mesa
    - Agregar gráficos
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 3.4 Implementar generación de certificados
    - Crear función generateCertificados()
    - Diseñar template de certificado
    - Agregar logo y bordes decorativos
    - Personalizar con nombre y cédula
    - Agregar texto de reconocimiento
    - Agregar fecha y firma digital
    - Soportar múltiples certificados en un PDF
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 3.5 Implementar listados de votación por mesa
    - Crear función generateListadoMesa()
    - Agregar header con datos de mesa
    - Listar personas ordenadas alfabéticamente
    - Incluir espacios para firmas
    - Agregar total de personas
    - Soportar múltiples mesas (por institución)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 3.6 Implementar manejo de errores en Lambda PDF
    - Manejar caso sin datos
    - Manejar errores de DynamoDB
    - Manejar errores de generación de PDF
    - Logging de errores








    - _Requirements: 11.2, 11.3_

- [ ] 4. Desplegar Lambdas y configurar API Gateway
  - [ ] 4.1 Crear endpoints en API Gateway
    - Crear endpoint GET /api/export/excel


    - Crear endpoint GET /api/export/pdf
    - Configurar CORS
    - Configurar binary media types

    - _Requirements: All_
  
  - [x] 4.2 Desplegar Lambda de Excel


    - Empaquetar dependencias (ExcelJS)
    - Desplegar a AWS

    - Configurar memoria (512MB)
    - Configurar timeout (30s)
    - Conectar con API Gateway
    - _Requirements: All_


  
  - [ ] 4.3 Desplegar Lambda de PDF
    - Empaquetar dependencias (PDFKit)
    - Desplegar a AWS
    - Configurar memoria (512MB)
    - Configurar timeout (30s)
    - Conectar con API Gateway
    - _Requirements: All_
  
  - [ ] 4.4 Probar endpoints desde Postman
    - Probar exportación de personas
    - Probar exportación con filtros
    - Probar exportación de líderes
    - Probar reportes PDF
    - Verificar CORS
    - _Requirements: All_

- [x] 5. Implementar ExportService en frontend
  - [x] 5.1 Crear export.service.ts
    - Crear interface ExportOptions
    - Implementar buildExportUrl()
    - Implementar exportToExcel()
    - Implementar exportToPDF()
    - Implementar downloadFile()
    - _Requirements: All_
  
  - [x] 5.2 Implementar manejo de respuestas
    - Convertir base64 a Blob
    - Manejar errores HTTP
    - Mostrar toasts de éxito/error
    - _Requirements: 1.5, 5.6, 11.1, 11.2, 11.3, 11.4_
  
  - [x] 5.3 Implementar indicadores de carga
    - Agregar propiedad isExporting
    - Deshabilitar botones durante exportación
    - Mostrar spinner en botones
    - _Requirements: 9.2, 9.5, 11.5_

- [x] 6. Agregar botones de exportación en Dashboard
  - [x] 6.1 Agregar botones en vista de personas
    - Botón "Exportar a Excel" en header
    - Conectar con exportService
    - Aplicar filtros activos
    - Mostrar loader durante exportación
    - _Requirements: 1.1, 4.1, 4.2_
  
  - [x] 6.2 Agregar botones en vista de líderes
    - Botón "Exportar Líderes a Excel"
    - Botón "Generar Reporte PDF" por líder
    - Conectar con exportService
    - _Requirements: 6.1, 12.1_
  
  - [x] 6.3 Agregar botón de reporte general
    - Botón "Reporte General PDF" en dashboard
    - Conectar con exportService
    - _Requirements: 5.1_
  
  - [x] 6.4 Agregar botones en modal de personas por mesa
    - Botón "Generar Listado PDF" en modal
    - Botón "Generar Certificado" por persona
    - Conectar con exportService
    - _Requirements: 7.1, 8.1_

- [x] 7. Implementar estilos para botones de exportación
  - Crear estilos consistentes con el diseño
  - Iconos para Excel (📊) y PDF (📄)
  - Estados hover y disabled
  - Animaciones de loading
  - _Requirements: All_

- [ ] 8. Checkpoint - Probar exportaciones básicas
  - Probar exportar lista completa de personas
  - Probar exportar con filtro por líder
  - Probar exportar líderes
  - Probar reporte general PDF
  - Verificar que no hay errores en consola
  - _Requirements: 1.1, 2.1, 5.1, 12.1_

- [ ]* 9. Escribir tests unitarios
  - [ ]* 9.1 Tests para ExportService
    - Test: buildExportUrl construye URL correcta
    - Test: downloadFile inicia descarga
    - Test: manejo de errores muestra toast correcto
  
  - [ ]* 9.2 Tests para Lambda Excel
    - Test: generateFilename genera nombre correcto
    - Test: filtros se aplican correctamente
    - Test: columnas requeridas están presentes
  
  - [ ]* 9.3 Tests para Lambda PDF
    - Test: reporte general contiene todas las secciones
    - Test: certificado contiene datos personalizados
    - Test: listado está ordenado alfabéticamente

- [ ]* 10. Escribir property-based tests
  - [ ]* 10.1 Property test: Excel export completeness
    - **Feature: exportacion-reportes, Property 1: Excel export completeness**
    - **Validates: Requirements 1.1, 1.2**
    - Generar datasets aleatorios de personas
    - Exportar a Excel
    - Verificar que el número de filas coincide
  
  - [ ]* 10.2 Property test: Excel column presence
    - **Feature: exportacion-reportes, Property 2: Excel column presence**
    - **Validates: Requirements 1.2**
    - Generar datasets aleatorios
    - Exportar a Excel
    - Verificar que todas las columnas requeridas existen
  
  - [ ]* 10.3 Property test: Filename format correctness
    - **Feature: exportacion-reportes, Property 3: Filename format correctness**
    - **Validates: Requirements 1.3, 2.2, 3.3, 3.4**
    - Generar diferentes tipos de exportación
    - Verificar que el nombre cumple con el patrón regex
  
  - [ ]* 10.4 Property test: Filter application correctness
    - **Feature: exportacion-reportes, Property 4: Filter application correctness**
    - **Validates: Requirements 2.1, 3.1, 3.2**
    - Generar datos con múltiples líderes/zonas
    - Aplicar filtro aleatorio
    - Verificar que todos los resultados cumplen el filtro
  
  - [ ]* 10.5 Property test: Multiple filter combination
    - **Feature: exportacion-reportes, Property 5: Multiple filter combination**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Generar combinaciones aleatorias de filtros
    - Verificar que todos los resultados cumplen todos los filtros
  
  - [ ]* 10.6 Property test: Empty result handling
    - **Feature: exportacion-reportes, Property 6: Empty result handling**
    - **Validates: Requirements 2.4, 4.5**
    - Aplicar filtros que no coinciden con ningún dato
    - Verificar mensaje de error correcto
  
  - [ ]* 10.7 Property test: PDF section completeness
    - **Feature: exportacion-reportes, Property 7: PDF section completeness**
    - **Validates: Requirements 5.2**
    - Generar reporte general
    - Verificar que todas las secciones están presentes
  
  - [ ]* 10.8 Property test: Líder report data accuracy
    - **Feature: exportacion-reportes, Property 8: Líder report data accuracy**
    - **Validates: Requirements 6.2**
    - Generar datos aleatorios de líder con personas
    - Generar reporte
    - Verificar que las estadísticas coinciden con los datos reales
  
  - [ ]* 10.9 Property test: Certificate personalization
    - **Feature: exportacion-reportes, Property 9: Certificate personalization**
    - **Validates: Requirements 7.2**
    - Generar personas aleatorias
    - Generar certificados
    - Verificar que cada certificado contiene los datos correctos
  
  - [ ]* 10.10 Property test: Mesa listing alphabetical order
    - **Feature: exportacion-reportes, Property 10: Mesa listing alphabetical order**
    - **Validates: Requirements 8.2**
    - Generar personas aleatorias para una mesa
    - Generar listado
    - Verificar orden alfabético
  
  - [ ]* 10.11 Property test: Toast notification display
    - **Feature: exportacion-reportes, Property 11: Toast notification display**
    - **Validates: Requirements 1.5, 5.6, 11.1**
    - Realizar exportación exitosa
    - Verificar que aparece toast de éxito
  
  - [ ]* 10.12 Property test: Error notification display
    - **Feature: exportacion-reportes, Property 12: Error notification display**
    - **Validates: Requirements 11.2, 11.3, 11.4**
    - Simular errores de exportación
    - Verificar que aparece toast de error correcto
  
  - [ ]* 10.13 Property test: Excel formatting presence
    - **Feature: exportacion-reportes, Property 13: Excel formatting presence**
    - **Validates: Requirements 10.1, 10.2, 10.3**
    - Generar Excel
    - Verificar que tiene encabezados formateados y filtros
  
  - [ ]* 10.14 Property test: PDF branding consistency
    - **Feature: exportacion-reportes, Property 14: PDF branding consistency**
    - **Validates: Requirements 5.4, 10.6**
    - Generar PDFs aleatorios
    - Verificar que contienen logo y colores del partido
  
  - [ ]* 10.15 Property test: Líderes export statistics accuracy
    - **Feature: exportacion-reportes, Property 15: Líderes export statistics accuracy**
    - **Validates: Requirements 12.2**
    - Generar datos de líderes con personas
    - Exportar líderes
    - Verificar que las estadísticas coinciden

- [ ] 11. Checkpoint final - Pruebas de integración
  - Probar todos los tipos de exportación
  - Probar con diferentes filtros
  - Probar con datasets grandes (>1000 registros)
  - Verificar performance
  - Verificar que todos los archivos se descargan correctamente
  - Verificar formato profesional de archivos
  - Documentar cualquier issue encontrado

## Notes

- Usar ExcelJS para generación de Excel (soporta estilos y formato avanzado)
- Usar PDFKit para generación de PDF (flexible y bien documentado)
- Los tests marcados con * son opcionales pero recomendados
- Usar fast-check para property-based testing con mínimo 100 iteraciones
- Considerar usar S3 para archivos grandes (>5MB) con URLs presignadas
- Implementar rate limiting en API Gateway para prevenir abuso
- Logging detallado en Lambdas para debugging
