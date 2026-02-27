# Implementation Plan

- [x] 1. Enriquecer respuesta del backend con datos detallados de duplicados


  - Modificar lambda-upload-excel.js para incluir metadata adicional en duplicados
  - Agregar campos: motivoRechazo, fechaDeteccion, existeEnBD
  - Preservar todos los datos originales de la persona en el objeto duplicado
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_





- [x] 2. Extender Lambda Export Excel para soportar exportación de duplicados
  - [x] 2.1 Crear función generateExcelDuplicados() en lambda-export-excel.js

    - Definir columnas: todas las originales + Motivo Rechazo, Fila Original, Fecha Detección
    - Ordenar duplicados por número de fila (ascendente)


    - Aplicar estilos consistentes con las exportaciones existentes (headers, borders, colores)
    - Agregar auto-filter a la hoja
    - _Requirements: 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.4_


  - [x] 2.2 Modificar handler principal para soportar type='duplicados'
    - Agregar case para type='duplicados' en el switch de tipos
    - Extraer duplicados desde filters.duplicados
    - Generar filename con formato duplicados_[timestamp].xlsx
    - Mantener mismo formato de respuesta (base64 encoded)
    - Soportar POST además de GET para evitar límites de URL
    - _Requirements: 3.6_

  - [ ]* 2.3 Escribir property test para generación de Excel de duplicados
    - **Property 3: Export file generation**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 2.4 Escribir property test para preservación de columnas
    - **Property 4: Column preservation and augmentation**
    - **Validates: Requirements 3.3, 3.4, 3.5, 4.1, 4.2, 4.4, 8.1**

  - [x]* 2.5 Escribir property test para preservación de tipos de datos




    - **Property 5: Data type preservation**
    - **Validates: Requirements 4.3**

  - [ ]* 2.6 Escribir property test para ordenamiento por fila
    - **Property 12: Row ordering**
    - **Validates: Requirements 8.4**

- [x] 3. Extender ExportService en el frontend




  - [x] 3.1 Agregar método exportarDuplicadosExcel() en export.service.ts

    - Método usa POST en lugar de GET para evitar límites de URL
    - Envía duplicados en el body de la petición
    - Reutiliza toda la lógica existente de manejo de errores y descarga
    - _Requirements: 3.2, 7.1, 7.2_



  - [ ]* 3.2 Escribir unit test para exportarDuplicadosExcel()
    - Verificar que llama a exportToExcel con parámetros correctos
    - Verificar manejo de errores
    - _Requirements: 3.2_


- [ ] 4. Implementar UI de resumen de duplicados en Dashboard Component
  - [x] 4.1 Agregar propiedades para manejo de duplicados

    - duplicadosEncontrados: DuplicadoDetallado[]

    - isExportingDuplicates: boolean
    - mostrandoDuplicados: boolean
    - duplicadosVisibles: number (para paginación)
    - _Requirements: 1.1, 2.1_


  - [x] 4.2 Implementar método descargarExcelDuplicados()
    - Validar que hay duplicados antes de exportar
    - Mostrar loader durante generación
    - Deshabilitar botón durante proceso
    - Llamar a exportService.exportarDuplicadosExcel()
    - Mostrar toast de éxito o error según resultado
    - _Requirements: 3.1, 3.2, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2_

  - [x] 4.3 Implementar método toggleDuplicados() para expandir/colapsar lista




    - Toggle de mostrandoDuplicados
    - _Requirements: 2.2_


  - [x] 4.4 Implementar método mostrarTodosDuplicados() para paginación
    - Cambiar duplicadosVisibles de 5 a total
    - _Requirements: 2.4, 2.5_

  - [ ]* 4.5 Escribir property test para contador de duplicados
    - **Property 1: Duplicate count accuracy**
    - **Validates: Requirements 1.1, 1.2**


  - [ ]* 4.6 Escribir property test para visibilidad del botón
    - **Property 7: Button visibility**
    - **Validates: Requirements 3.1, 3.7**

  - [ ]* 4.7 Escribir property test para paginación de lista
    - **Property 9: List pagination**
    - **Validates: Requirements 2.4**

- [ ] 5. Implementar template HTML para sección de duplicados
  - [x] 5.1 Crear sección de resumen de carga con estadísticas

    - Mostrar contador de personas agregadas (éxito)



    - Mostrar contador de duplicados (advertencia) si > 0
    - Mostrar contador de errores (error) si > 0
    - Usar iconos apropiados para cada tipo
    - _Requirements: 1.1, 1.2, 1.4, 1.5_


  - [x] 5.2 Crear sección expandible de duplicados

    - Botón para expandir/colapsar con título "Duplicados Encontrados (N)"
    - Lista de duplicados mostrando: fila, nombre, cédula

    - Mostrar solo primeros 5 duplicados inicialmente
    - Botón "+N más..." si hay más de 5 duplicados
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 5.3 Crear botón de descarga de Excel



    - Icono de Excel reconocible

    - Texto "Descargar Excel con Duplicados"
    - Mostrar spinner y texto "Generando archivo..." cuando isExportingDuplicates=true
    - Deshabilitar durante generación
    - Tooltip explicativo
    - Solo visible cuando duplicadosEncontrados.length > 0
    - _Requirements: 3.1, 3.7, 6.1, 6.2, 10.1, 10.3_

  - [-]* 5.4 Escribir property test para completitud de información en lista



    - **Property 8: List display completeness**
    - **Validates: Requirements 2.3**



- [ ] 6. Implementar estilos CSS para sección de duplicados
  - [x] 6.1 Estilos para resumen de estadísticas

    - Colores distintivos: verde (éxito), amarillo (advertencia), rojo (error)
    - Layout horizontal con iconos
    - _Requirements: 1.4_


  - [x] 6.2 Estilos para sección expandible
    - Animación suave de expand/collapse
    - Estilos para lista de duplicados
    - _Requirements: 2.1, 2.2_


  - [x] 6.3 Estilos para botón de descarga
    - Color distintivo (acción secundaria)
    - Estado hover
    - Estado disabled con opacidad reducida
    - Responsive (mínimo 44x44px en móvil)
    - _Requirements: 10.2, 10.4, 10.5_

- [ ] 7. Implementar detección de duplicados mejorada en backend
  - [x] 7.1 Mejorar lógica de detección en lambda-upload-excel.js

    - Detectar duplicados contra base de datos existente
    - Detectar duplicados dentro del mismo archivo
    - Asignar motivo correcto según tipo de duplicado
    - Agregar timestamp de detección
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.2 Escribir property test para detección de duplicados
    - **Property 2: Duplicate detection completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ] 8. Implementar validación de datos antes de exportación
  - [x] 8.1 Validar que cada duplicado tenga nombre y cédula

    - Verificar campos requeridos antes de generar Excel
    - Marcar campos vacíos claramente si existen
    - _Requirements: 9.1, 9.2_


  - [ ] 8.2 Validar que el conteo coincida con registros exportados
    - Verificar que número de filas en Excel = contador de duplicados
    - Mostrar error si no coincide
    - _Requirements: 9.3, 9.4_

  - [ ]* 8.3 Escribir property test para validación de datos
    - **Property 11: Data validation before export**
    - **Validates: Requirements 9.1**

  - [ ]* 8.4 Escribir property test para invariante de conteo
    - **Property 10: Export count invariant**
    - **Validates: Requirements 9.3**

- [ ] 9. Implementar columnas condicionales y metadata
  - [ ] 9.1 Agregar columna "Líder Asignado" si aplica
    - Verificar si el archivo original incluía líder
    - Incluir columna solo si hay datos de líder
    - _Requirements: 8.2_

  - [ ] 9.2 Agregar columna "Fecha Registro Original" para duplicados en BD
    - Incluir solo cuando existeEnBD = true
    - Consultar fecha del registro existente
    - _Requirements: 8.3_

  - [ ]* 9.3 Escribir property test para metadata
    - **Property 17: Metadata inclusion**
    - **Validates: Requirements 5.5, 8.3**

  - [ ]* 9.4 Escribir property test para columna condicional de líder
    - **Property 18: Conditional leader column**
    - **Validates: Requirements 8.2**


- [ ] 10. Implementar manejo de notificaciones
  - [x] 10.1 Agregar notificación de éxito
    - Toast "Archivo de duplicados descargado correctamente"
    - Auto-dismiss después de 3 segundos
    - _Requirements: 7.1, 7.5_

  - [x] 10.2 Agregar notificación de error
    - Toast con mensaje de error específico
    - Auto-dismiss después de 3 segundos
    - _Requirements: 7.2, 7.5_

  - [x] 10.3 Agregar notificación para caso sin duplicados
    - Toast "No hay duplicados para exportar"
    - _Requirements: 7.3_

  - [ ]* 10.4 Escribir property test para notificaciones de éxito
    - **Property 14: Success notification**
    - **Validates: Requirements 7.1**

  - [x]* 10.5 Escribir property test para notificaciones de error

    - **Property 15: Error notification**
    - **Validates: Requirements 7.2**

- [ ] 11. Implementar gestión de estado UI durante exportación
  - [x] 11.1 Manejar estado de carga
    - Mostrar spinner durante generación
    - Deshabilitar botón durante proceso
    - Rehabilitar botón al completar
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 11.2 Escribir property test para gestión de estado UI
    - **Property 13: UI state management during export**
    - **Validates: Requirements 6.1, 6.2, 6.4**

- [x] 12. Desplegar cambios al backend
  - Actualizar lambda-upload-excel.js en AWS Lambda
  - Actualizar lambda-export-excel.js en AWS Lambda
  - Verificar que los endpoints respondan correctamente
  - _Requirements: Todos_

- [x] 13. Checkpoint - Pruebas de integración
  - Cargar archivo con duplicados y verificar detección
  - Verificar que el resumen muestre el contador correcto
  - Descargar Excel de duplicados y verificar contenido
  - Verificar que el archivo tenga todas las columnas esperadas
  - Verificar notificaciones toast
  - Probar en diferentes navegadores
  - NOTA: Tests automatizados pendientes, funcionalidad lista para pruebas manuales
