# Implementation Plan - Reporte Visual de Lugares de Votación

- [x] 1. Set up project dependencies and core interfaces


  - Install Chart.js and ng2-charts for charting functionality
  - Install ExcelJS for Excel export functionality
  - Install html2canvas for image export functionality
  - Define TypeScript interfaces for Persona, Lider, DistribucionLugar, DesgloseLider, and Estadisticas
  - _Requirements: All_

- [ ] 2. Implement ReporteVisualService with core calculation logic
- [x] 2.1 Create service with API integration methods


  - Implement `obtenerTodasPersonas()` to fetch all people from API
  - Implement `obtenerLideres()` to fetch all leaders from API
  - Add error handling and retry logic for API calls
  - _Requirements: 1.1, 2.1, 2.2_

- [x] 2.2 Implement distribution calculation logic


  - Implement `calcularDistribucionPorLugar()` to group people by voting location
  - Implement `agruparPorLugarYLider()` to create leader breakdown for each location
  - Implement `normalizarLugar()` to handle empty/null voting locations as "Sin asignar"
  - Handle "Sin líder" categorization for people without assigned leader
  - Sort distribution by cantidadTotal descending
  - Sort desgloseLideres by cantidad descending within each location
  - _Requirements: 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 2.3 Write property test for distribution completeness
  - **Property 1: Distribution completeness**
  - **Validates: Requirements 2.1, 2.5**

- [ ]* 2.4 Write property test for leader breakdown completeness
  - **Property 2: Leader breakdown completeness**
  - **Validates: Requirements 3.5**

- [ ]* 2.5 Write property test for unassigned categorization
  - **Property 3: Unassigned location categorization**
  - **Property 4: Unassigned leader categorization**
  - **Validates: Requirements 1.2, 3.4**

- [ ]* 2.6 Write property test for sorting
  - **Property 5: Distribution sorting**
  - **Property 6: Leader breakdown sorting**
  - **Validates: Requirements 1.3, 3.3**

- [x] 2.7 Implement percentage calculation logic


  - Calculate percentage for each location based on total people
  - Ensure percentages sum to 100% (within rounding tolerance)
  - Format percentages to 2 decimal places
  - _Requirements: 4.5, 4.6, 4.7_

- [ ]* 2.8 Write property test for percentage calculations
  - **Property 7: Percentage calculation accuracy**
  - **Property 8: Percentage formatting**
  - **Property 9: Total row invariant**
  - **Validates: Requirements 4.5, 4.6, 4.7**

- [x] 2.9 Implement filter logic


  - Add filtroLiderId parameter to `calcularDistribucionPorLugar()`
  - Filter people by leader ID when filter is applied
  - Recalculate distribution based on filtered people
  - _Requirements: 7.3, 7.4_

- [ ]* 2.10 Write property test for filter application
  - **Property 10: Filter application correctness**
  - **Validates: Requirements 7.3, 7.4**

- [x] 2.11 Implement statistics calculation


  - Implement `calcularEstadisticas()` to compute summary statistics
  - Calculate total people, total locations, max location, min location, average, and percentage unassigned
  - Handle empty distribution edge case
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ]* 2.12 Write property tests for statistics
  - **Property 19: Unique location count**
  - **Property 20: Maximum location identification**
  - **Property 21: Minimum location identification**
  - **Property 22: Average calculation**
  - **Property 23: Unassigned percentage calculation**
  - **Property 24: Filter recalculation correctness**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**

- [ ]* 2.13 Write unit tests for service methods
  - Test grouping by location with leader breakdown
  - Test "Sin asignar" and "Sin líder" categorization
  - Test filter application
  - Test edge cases: empty arrays, single location, all unassigned
  - _Requirements: All service-related_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create FiltroLiderComponent
- [x] 4.1 Implement component with dropdown for leader selection


  - Create standalone component with CommonModule and FormsModule
  - Add @Input() for lideres array
  - Add @Input() for liderSeleccionado (current selection)
  - Add @Output() for liderSeleccionado event emitter
  - Implement dropdown with "Todos los líderes" as default option
  - Display leaders with name and zone
  - _Requirements: 7.1, 7.2_

- [ ]* 4.2 Write unit tests for FiltroLiderComponent
  - Test component initialization
  - Test leader selection event emission
  - Test default "Todos los líderes" option
  - _Requirements: 7.1, 7.2_

- [ ] 5. Create TablaDistribucionComponent
- [x] 5.1 Implement table component with leader breakdown column


  - Create standalone component with CommonModule
  - Add @Input() for distribucion array
  - Add @Input() for cargando boolean
  - Render table with columns: Lugar, Total Personas, Líderes (desglose), Porcentaje
  - Format desglose as "Líder: X personas" for each leader
  - Add total row at bottom
  - Add loading overlay
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 5.2 Write unit tests for TablaDistribucionComponent
  - Test table rendering with distribution data
  - Test desglose formatting
  - Test total row calculation
  - Test loading state
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 6. Create GraficaBarrasComponent
- [x] 6.1 Implement bar chart component with Chart.js


  - Create standalone component with NgChartsModule
  - Add @Input() for distribucion array
  - Add @Input() for cargando boolean
  - Configure Chart.js bar chart with cantidadTotal data
  - Implement tooltip with leader breakdown
  - Use partido conservador color palette
  - Add loading overlay
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 6.2 Write property test for bar chart data completeness
  - **Property 11: Bar chart data completeness**
  - **Validates: Requirements 5.1, 5.3**

- [ ]* 6.3 Write property test for tooltip desglose
  - **Property 13: Tooltip desglose completeness**
  - **Validates: Requirements 5.5**

- [ ]* 6.4 Write unit tests for GraficaBarrasComponent
  - Test chart initialization
  - Test data binding
  - Test tooltip configuration
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 7. Create GraficaPastelComponent
- [x] 7.1 Implement pie chart component with Chart.js


  - Create standalone component with NgChartsModule
  - Add @Input() for distribucion array
  - Add @Input() for cargando boolean
  - Configure Chart.js pie chart with cantidadTotal data
  - Implement tooltip with leader breakdown
  - Add legend with location names and percentages
  - Use partido conservador color palette
  - Add loading overlay
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 7.2 Write property test for pie chart data completeness
  - **Property 12: Pie chart data completeness**
  - **Validates: Requirements 6.1, 6.4**

- [ ]* 7.3 Write unit tests for GraficaPastelComponent
  - Test chart initialization
  - Test data binding
  - Test tooltip configuration
  - Test legend configuration
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 8. Create EstadisticasGeneralesComponent
- [x] 8.1 Implement statistics display component


  - Create standalone component with CommonModule
  - Add @Input() for estadisticas object
  - Display stat cards for: total people, total locations, average per location, max location, min location
  - Format numbers appropriately
  - Add responsive grid layout
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 8.2 Write unit tests for EstadisticasGeneralesComponent
  - Test component rendering with statistics data
  - Test number formatting
  - Test edge cases (null values)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 9. Implement ExportacionReporteService
- [x] 9.1 Create Excel export functionality


  - Implement `exportarTablaExcel()` using ExcelJS
  - Include columns: Lugar de Votación, Total Personas, Desglose por Líder, Porcentaje
  - Format desglose as comma-separated list
  - Add total row with bold formatting
  - Style headers with partido conservador colors
  - Generate filename based on filter: "reporte_lugares_todos_YYYYMMDD_HHMMSS.xlsx" or "reporte_lugares_[NOMBRE]_YYYYMMDD_HHMMSS.xlsx"
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ]* 9.2 Write property tests for Excel export
  - **Property 14: Excel export structure**
  - **Property 15: Excel filename format without filter**
  - **Property 16: Excel filename format with filter**
  - **Property 17: Excel total row inclusion**
  - **Validates: Requirements 11.2, 11.3, 11.4, 11.5, 11.6**

- [x] 9.3 Create image export functionality


  - Implement `exportarGraficasImagen()` using html2canvas
  - Capture both bar and pie charts
  - Generate PNG image
  - Trigger download with appropriate filename
  - _Requirements: 11.7, 11.8_

- [ ]* 9.4 Write property test for image export
  - **Property 18: Image export format**
  - **Validates: Requirements 11.8**

- [ ]* 9.5 Write unit tests for ExportacionReporteService
  - Test Excel generation with various distributions
  - Test filename generation
  - Test image export
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [ ] 10. Create AccionesExportacionComponent
- [x] 10.1 Implement export actions component


  - Create standalone component with CommonModule
  - Add @Input() for habilitado boolean
  - Add @Output() for exportarExcel event
  - Add @Output() for exportarImagen event
  - Render "Exportar a Excel" button
  - Render "Exportar Gráficas como Imagen" button
  - Disable buttons when habilitado is false
  - _Requirements: 11.1, 11.7_

- [ ]* 10.2 Write unit tests for AccionesExportacionComponent
  - Test button rendering
  - Test event emission
  - Test disabled state
  - _Requirements: 11.1, 11.7_

- [ ] 11. Create ReporteVisualComponent (container)
- [x] 11.1 Implement main container component


  - Create standalone component importing all child components
  - Inject ReporteVisualService and ExportacionReporteService
  - Implement ngOnInit to load personas and lideres
  - Implement state management for filtroLiderId, distribucion, estadisticas, cargando, error
  - Implement onLiderSeleccionado() to handle filter changes
  - Implement actualizarVisualizaciones() to recalculate distribution and statistics
  - Implement exportarExcel() to trigger Excel export
  - Implement exportarImagen() to trigger image export
  - Handle loading states and error states
  - Display appropriate messages for empty states
  - _Requirements: 1.1, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 11.2 Write unit tests for ReporteVisualComponent
  - Test component initialization and data loading
  - Test filter application
  - Test visualization updates
  - Test export actions
  - Test error handling
  - Test empty state handling
  - _Requirements: All container-related_

- [ ] 12. Add responsive styling
- [ ] 12.1 Implement SCSS styles for all components
  - Create responsive grid layouts for statistics and charts
  - Add mobile breakpoints (< 768px): stack charts vertically
  - Add tablet breakpoints (768px - 1023px): single column charts
  - Add desktop breakpoints (>= 1024px): two-column chart grid
  - Style table with partido conservador colors
  - Style desglose-lideres with proper spacing
  - Add loading spinner styles
  - Add error message styles
  - _Requirements: 10.1, 10.2, 10.3_

- [ ]* 12.2 Write responsive design tests
  - Test layout at different breakpoints
  - Test chart sizing
  - Test table responsiveness
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 13. Add component to routing
- [x] 13.1 Configure lazy loading route



  - Add route to app.routes.ts with lazy loading
  - Configure route path as 'reporte-visual'
  - Test navigation to component
  - _Requirements: All_

- [ ] 14. Implement accessibility features
- [ ] 14.1 Add ARIA labels and keyboard navigation
  - Add aria-label to dropdown
  - Add aria-label to charts
  - Ensure all interactive elements are keyboard accessible
  - Add focus indicators
  - Test with screen reader
  - _Requirements: All_

- [ ] 15. Add chart interactivity
- [ ] 15.1 Implement click handlers for charts
  - Add click handler to bar chart to highlight selected bar
  - Add click handler to pie chart to highlight selected segment
  - Display detailed information on click
  - Add smooth animations for transitions
  - _Requirements: 10.4, 10.5, 10.6_

- [ ]* 15.2 Write integration tests for chart interactivity
  - Test click interactions
  - Test highlight behavior
  - Test animations
  - _Requirements: 10.4, 10.5, 10.6_

- [ ] 16. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Integration testing
- [ ] 17.1 Test complete user flows
  - Test: Load page → View all locations → Apply leader filter → Export Excel
  - Test: Load page → View all locations → Export charts as image
  - Test: Apply filter → Switch filter → Clear filter
  - Test error scenarios with mocked API failures
  - _Requirements: All_

- [ ]* 17.2 Write end-to-end tests
  - Test complete user workflows
  - Test error recovery
  - Test data consistency across components
  - _Requirements: All_
