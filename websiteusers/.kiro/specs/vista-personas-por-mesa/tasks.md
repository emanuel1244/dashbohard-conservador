# Implementation Plan - Vista de Personas por Mesa

- [x] 1. Crear Lambda function para consultar personas por mesa


  - Crear archivo `backend/lambda-personas-por-mesa.js` con AWS SDK v3
  - Implementar query a DynamoDB filtrando por número de mesa
  - Incluir validación de parámetros de entrada
  - Agregar headers CORS
  - Retornar formato JSON con mesa, totalPersonas y array de personas
  - _Requirements: 1.2, 8.1, 8.2_

- [ ]* 1.1 Write property test for mesa query
  - **Property 1: Mesa query returns only matching persons**
  - **Validates: Requirements 1.2**

- [x] 2. Crear script de despliegue para Lambda


  - Crear `backend/desplegar-personas-por-mesa.bat`
  - Configurar creación/actualización de Lambda `partido-conservador-getPersonasPorMesa`
  - Usar Account ID correcto: 431655581275
  - Configurar runtime Node.js 18.x
  - Configurar handler: `lambda-personas-por-mesa.handler`
  - _Requirements: 1.2_

- [x] 3. Configurar endpoint en API Gateway


  - Crear recurso `/api/personas/mesa/{numeroMesa}` en API Gateway
  - Configurar método GET con integración AWS_PROXY
  - Configurar método OPTIONS para CORS
  - Agregar permisos de invocación a Lambda
  - Desplegar cambios a stage prod
  - _Requirements: 1.2, 9.1_

- [ ]* 3.1 Test API endpoint manually
  - Probar endpoint con curl o Postman
  - Verificar respuesta con mesa existente
  - Verificar respuesta con mesa sin personas
  - Verificar headers CORS

- [x] 4. Agregar estado del modal en Dashboard Component


  - Agregar propiedades al componente TypeScript:
    - `modalPersonasMesa: boolean`
    - `personasMesaActual: any[]`
    - `mesaSeleccionada: string`
    - `cargandoPersonasMesa: boolean`
    - `errorPersonasMesa: string | null`
    - `searchTermMesa: string`
  - Inicializar valores en constructor
  - _Requirements: 1.1, 1.5, 9.1_

- [x] 5. Implementar métodos del modal en Dashboard Component


  - Crear método `abrirModalPersonasMesa(numeroMesa: string)`
  - Crear método `cerrarModalPersonasMesa()`
  - Crear método `cargarPersonasMesa(numeroMesa: string)`
  - Crear método `reintentar CargarPersonasMesa()`
  - Implementar llamada HTTP a `/api/personas/mesa/{numeroMesa}`
  - Manejar estados de loading y error
  - _Requirements: 1.1, 1.2, 1.4, 9.1, 9.3_

- [ ]* 5.1 Write property test for modal state consistency
  - **Property 6: Modal state consistency**
  - **Validates: Requirements 1.1, 8.1**



- [ ] 6. Implementar funcionalidad de búsqueda
  - Crear método `filtrarPersonasMesa()` que retorna array filtrado
  - Filtrar por nombre, cédula y nombre de líder (case-insensitive)
  - Crear computed property `personasMesaFiltradas`
  - _Requirements: 10.1, 10.2, 10.3_

- [ ]* 6.1 Write property test for search filter
  - **Property 5: Search filter correctness**
  - **Validates: Requirements 10.2, 10.3**

- [x] 7. Crear template HTML del modal


  - Agregar estructura del modal con overlay
  - Agregar header con número de mesa y botón cerrar
  - Agregar contador de personas
  - Agregar input de búsqueda (si hay más de 10 personas)
  - Agregar área scrollable para lista de personas
  - Agregar indicador de loading
  - Agregar mensaje de error con botón reintentar
  - Agregar mensaje de lista vacía
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 7.1, 7.2, 8.1, 8.2, 9.1, 9.3, 10.1_

- [x] 8. Crear cards de personas en el modal


  - Mostrar icono y nombre completo
  - Mostrar cédula con formato
  - Mostrar lugar de votación y dirección
  - Mostrar nombre del líder o "Sin líder asignado"
  - Mostrar teléfono y correo si están disponibles
  - Usar placeholders para datos faltantes
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 6.1, 6.2_

- [x] 9. Agregar estilos CSS para el modal


  - Estilos para overlay y contenedor del modal
  - Estilos para header y botón cerrar
  - Estilos para input de búsqueda
  - Estilos para cards de personas
  - Estilos para estados de loading y error
  - Estilos responsive para mobile y tablet
  - Animaciones de apertura/cierre
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10. Hacer mesas clickeables en el dashboard


  - Identificar dónde se muestran las mesas en el HTML actual
  - Agregar evento click a elementos de mesa
  - Agregar cursor pointer y hover effect
  - Llamar a `abrirModalPersonasMesa(numeroMesa)` en click
  - _Requirements: 1.1_

- [x] 11. Checkpoint - Verificar funcionalidad completa



  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 12. Write unit tests for component methods
  - Test `abrirModalPersonasMesa()` sets correct state
  - Test `cerrarModalPersonasMesa()` resets state
  - Test `filtrarPersonasMesa()` with various search terms
  - Test error handling in `cargarPersonasMesa()`
  - _Requirements: All_

- [ ]* 13. Test responsive design
  - Test modal on desktop (1920x1080)
  - Test modal on tablet (768x1024)
  - Test modal on mobile (375x667)
  - Verify scrolling works correctly
  - Verify touch interactions on mobile
