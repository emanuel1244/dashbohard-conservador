# Design Document - Selección Mejorada de Lugar de Votación

## Overview

Esta funcionalidad mejora el campo "Lugar de Votación" en el formulario de registro/edición de personas del Dashboard del Partido Conservador. Reemplaza el campo de texto libre actual con un sistema híbrido que combina:
1. Una lista de instituciones predefinidas seleccionables mediante checkboxes (comportamiento de radio buttons)
2. Una opción "Otro" que habilita un campo de texto para entrada manual

El diseño garantiza consistencia de datos mediante normalización automática de instituciones predefinidas, mientras mantiene flexibilidad para casos especiales. La solución es responsive y funciona en dispositivos móviles y desktop.

## Architecture

### Component Structure

```
DashboardComponent (existing)
└── PersonModalComponent (existing - to be enhanced)
    └── LugarVotacionSelectorComponent (new)
        ├── InstitucionCheckboxComponent (new)
        └── CustomInputComponent (new)
```

### Data Flow

1. **Load Flow**: Modal opens → Load institutions list → Check if person has existing location → Pre-select matching checkbox or "Otro" with custom text
2. **Selection Flow**: User clicks institution checkbox → Uncheck previous selection → Update form field → Validate
3. **Custom Flow**: User selects "Otro" → Enable text input → User types custom location → Validate → Save as-is
4. **Save Flow**: Form submits → Validate location field → Save standardized institution name or custom text → Update database

### State Management

```typescript
interface LugarVotacionState {
  instituciones: Institucion[];
  seleccionTipo: 'institucion' | 'custom';
  institucionSeleccionada: string | null;
  textoCustom: string;
  validationError: string | null;
}
```

## Components and Interfaces

### Data Models

```typescript
/**
 * Representa una institución de votación predefinida
 */
interface Institucion {
  id: string;                    // Identificador único
  nombre: string;                // Nombre normalizado (ej: "MARIA AUXILIADORA")
  nombreCompleto: string;        // Nombre completo con sede (ej: "MARIA AUXILIADORA SEDE PRINCIPAL")
  tipo: 'colegio' | 'universidad' | 'otro';
  sedes?: string[];              // Sedes adicionales si aplica
  activa: boolean;               // Si está disponible para selección
}

/**
 * Configuración de instituciones del sistema
 */
interface ConfiguracionInstituciones {
  instituciones: Institucion[];
  version: string;
  ultimaActualizacion: string;
}

/**
 * Props para el componente selector
 */
interface LugarVotacionSelectorProps {
  valorInicial?: string;         // Valor actual del lugar de votación
  onChange: (valor: string) => void;
  onValidationChange: (isValid: boolean, error?: string) => void;
  disabled?: boolean;
}

/**
 * Estado interno del selector
 */
interface SelectorState {
  instituciones: Institucion[];
  modoSeleccion: 'institucion' | 'custom';
  institucionSeleccionadaId: string | null;
  textoCustom: string;
  cargando: boolean;
  error: string | null;
}
```

### Instituciones Predefinidas

Basado en el análisis del código existente, las instituciones principales son:

```typescript
const INSTITUCIONES_PREDEFINIDAS: Institucion[] = [
  {
    id: 'maria-auxiliadora-principal',
    nombre: 'MARIA AUXILIADORA',
    nombreCompleto: 'MARIA AUXILIADORA SEDE PRINCIPAL',
    tipo: 'colegio',
    sedes: ['PRINCIPAL'],
    activa: true
  },
  {
    id: 'maria-auxiliadora-sede-2',
    nombre: 'MARIA AUXILIADORA',
    nombreCompleto: 'MARIA AUXILIADORA SEDE 2',
    tipo: 'colegio',
    sedes: ['2'],
    activa: true
  },
  {
    id: 'francisco-de-paula-principal',
    nombre: 'FRANCISCO DE PAULA',
    nombreCompleto: 'FRANCISCO DE PAULA PRINCIPAL',
    tipo: 'colegio',
    activa: true
  },
  {
    id: 'petronitas',
    nombre: 'PETRONITAS',
    nombreCompleto: 'PETRONITAS',
    tipo: 'colegio',
    activa: true
  },
  {
    id: 'megacolegio-villa-olimpica',
    nombre: 'MEGACOLEGIO VILLA OLIMPICA',
    nombreCompleto: 'MEGACOLEGIO VILLA OLIMPICA',
    tipo: 'colegio',
    activa: true
  },
  {
    id: 'carruages',
    nombre: 'CARRUAGES',
    nombreCompleto: 'CARRUAGES',
    tipo: 'colegio',
    activa: true
  }
];
```

### Component Methods

```typescript
class LugarVotacionSelectorComponent {
  // Lifecycle
  ngOnInit(): void
  ngOnChanges(changes: SimpleChanges): void
  
  // Data loading
  cargarInstituciones(): Promise<void>
  obtenerInstitucionesDesdeConfig(): Institucion[]
  
  // Selection handling
  seleccionarInstitucion(institucionId: string): void
  seleccionarModoCustom(): void
  actualizarTextoCustom(texto: string): void
  
  // Validation
  validarSeleccion(): { isValid: boolean; error?: string }
  validarTextoCustom(texto: string): { isValid: boolean; error?: string }
  
  // Value management
  obtenerValorActual(): string
  establecerValorInicial(valor: string): void
  detectarTipoValor(valor: string): 'institucion' | 'custom'
  buscarInstitucionPorNombre(nombre: string): Institucion | null
  
  // Normalization
  normalizarNombreInstitucion(nombre: string): string
  
  // UI helpers
  esInstitucionSeleccionada(institucionId: string): boolean
  esModoCustomActivo(): boolean
}
```

### Validation Logic

```typescript
/**
 * Valida que se haya seleccionado una institución o ingresado texto custom
 */
function validarLugarVotacion(
  modoSeleccion: 'institucion' | 'custom',
  institucionId: string | null,
  textoCustom: string
): ValidationResult {
  if (modoSeleccion === 'institucion') {
    if (!institucionId) {
      return {
        isValid: false,
        error: 'Debe seleccionar una institución'
      };
    }
    return { isValid: true };
  }
  
  if (modoSeleccion === 'custom') {
    const textoLimpio = textoCustom.trim();
    
    if (textoLimpio.length === 0) {
      return {
        isValid: false,
        error: 'Debe ingresar un lugar de votación'
      };
    }
    
    if (textoLimpio.length > 200) {
      return {
        isValid: false,
        error: 'El lugar de votación no puede exceder 200 caracteres'
      };
    }
    
    return { isValid: true };
  }
  
  return {
    isValid: false,
    error: 'Modo de selección inválido'
  };
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


Property 1: Institution selection updates field
*For any* institution in the predefined list, when selected, the "Lugar de Votación" field should be populated with that institution's standardized name
**Validates: Requirements 1.2, 1.3**

Property 2: Single selection enforcement
*For any* two different institutions, selecting the second institution should automatically deselect the first institution
**Validates: Requirements 1.4, 7.3**

Property 3: Standardized name persistence
*For any* institution selected and saved, the database should contain the standardized institution name, not a variant
**Validates: Requirements 1.5**

Property 4: Alphabetical ordering within groups
*For any* set of institutions within the same group, they should be displayed in alphabetical order by name
**Validates: Requirements 2.2**

Property 5: Institution display completeness
*For any* institution displayed, the UI should show both the full institution name and any relevant identifiers (like sede)
**Validates: Requirements 2.5**

Property 6: Custom text character limit
*For any* text entered in the custom field, the system should accept text up to 200 characters and reject text exceeding this limit
**Validates: Requirements 3.3**

Property 7: Custom text round-trip
*For any* custom location text entered and saved, retrieving that person's data should return the exact same text
**Validates: Requirements 3.4**

Property 8: Mode switching clears custom text
*For any* custom text entered, switching to select a predefined institution should clear the custom text field
**Validates: Requirements 3.5**

Property 9: Edit mode pre-selection
*For any* person with an assigned voting location, opening the edit modal should pre-select the matching institution checkbox or populate the custom field
**Validates: Requirements 4.1, 4.2, 4.3**

Property 10: Selection change updates field
*For any* change in institution selection or custom text, the voting location field value should immediately reflect the new selection
**Validates: Requirements 4.5**

Property 11: Removed institution backward compatibility
*For any* person assigned to an institution that is later removed from the active list, the system should still display that institution name for that person
**Validates: Requirements 6.4**

Property 12: Validation error display
*For any* validation error that occurs, the voting location section should display an error state with appropriate styling
**Validates: Requirements 7.5**

Property 13: Required field validation
*For any* form submission attempt, if neither an institution is selected nor custom text is provided, validation should fail with an appropriate error message
**Validates: Requirements 8.1, 8.2**

Property 14: Whitespace validation
*For any* custom text that contains only whitespace characters, the system should treat it as empty and display a validation error
**Validates: Requirements 8.4**

Property 15: Valid state allows submission
*For any* form state where either a valid institution is selected or valid custom text is provided, the form validation should pass and allow submission
**Validates: Requirements 8.5**

## Error Handling

### Validation Errors

**Empty Selection Error**
- Trigger: Form submitted with no institution selected and no custom text
- Display: "Debe seleccionar un lugar de votación o ingresar uno manualmente"
- Location: Below the institution list
- Style: Red text with error icon

**Character Limit Error**
- Trigger: Custom text exceeds 200 characters
- Display: "El lugar de votación no puede exceder 200 caracteres (actual: X/200)"
- Location: Below custom text input
- Style: Red text with character counter

**Whitespace Error**
- Trigger: Custom text contains only spaces/tabs/newlines
- Display: "El lugar de votación no puede estar vacío"
- Location: Below custom text input
- Style: Red text with error icon

### Loading Errors

**Institution List Load Failure**
- Trigger: HTTP error or timeout when loading institutions
- Behavior: Fall back to custom text input only
- Display: Warning message "No se pudieron cargar las instituciones. Use el campo personalizado."
- Recovery: Retry button to attempt reload

**Configuration Parse Error**
- Trigger: Invalid JSON or missing required fields in configuration
- Behavior: Use hardcoded default institution list
- Logging: Log error details to console for debugging

### User Feedback

**Success States**
- Institution selected: Checkbox shows checkmark, field updates
- Custom text entered: Character counter shows remaining characters
- Form saved: Standard success toast notification

**Loading States**
- Initial load: Skeleton loaders for institution list
- Saving: Disabled state on all inputs with spinner

**Error States**
- Validation error: Red border on section, error message displayed
- Load error: Warning banner with retry option

## Testing Strategy

### Unit Tests

**Component Tests**
- Test institution list rendering with various data sets
- Test checkbox selection and deselection behavior
- Test custom text input and character counting
- Test validation logic with edge cases
- Test mode switching between institution and custom
- Test initial value loading for edit mode

**Service Tests**
- Test institution loading from configuration
- Test normalization of institution names
- Test matching logic for existing locations
- Test fallback behavior on load failure

**Validation Tests**
- Test empty state validation
- Test character limit validation
- Test whitespace-only validation
- Test valid state detection

### Property-Based Tests

We will use **fast-check** (for TypeScript/JavaScript) as our property-based testing library.

Each property-based test should run a minimum of 100 iterations to ensure thorough coverage.

Property-based tests will be tagged with comments in the following format:
`// Feature: seleccion-lugar-votacion-mejorada, Property {number}: {property_text}`

Each correctness property listed above will be implemented as a single property-based test that validates the specified behavior across randomly generated test data.

### Integration Tests

**End-to-End Flows**
- Test complete create flow with institution selection
- Test complete create flow with custom text
- Test complete edit flow with existing institution
- Test complete edit flow with existing custom text
- Test switching between modes during editing
- Test form submission with validation

**Cross-Component Tests**
- Test integration with person modal component
- Test integration with form validation system
- Test integration with save/update API calls

### Manual Testing Checklist

**Desktop Testing**
- [ ] Verify institution list displays correctly
- [ ] Test checkbox selection and visual feedback
- [ ] Test custom text input and character counter
- [ ] Test validation error messages
- [ ] Test keyboard navigation (Tab, Space, Enter)
- [ ] Test with existing persons (edit mode)

**Mobile Testing**
- [ ] Verify responsive layout on small screens
- [ ] Test touch targets are adequate size
- [ ] Test scrolling behavior with long institution list
- [ ] Test mobile keyboard appears for custom input
- [ ] Test orientation changes (portrait/landscape)

**Accessibility Testing**
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify ARIA labels are present and correct
- [ ] Test keyboard-only navigation
- [ ] Verify color contrast meets WCAG AA standards
- [ ] Test focus indicators are visible

## Implementation Notes

### Institution Configuration

The institution list should be stored in a configuration file that can be updated without code changes:

```typescript
// config/instituciones.json
{
  "version": "1.0.0",
  "ultimaActualizacion": "2026-03-02",
  "instituciones": [
    {
      "id": "maria-auxiliadora-principal",
      "nombre": "MARIA AUXILIADORA",
      "nombreCompleto": "MARIA AUXILIADORA SEDE PRINCIPAL",
      "tipo": "colegio",
      "sedes": ["PRINCIPAL"],
      "activa": true
    },
    // ... más instituciones
  ]
}
```

### Normalization Strategy

When matching existing locations to institutions:

1. Convert both to uppercase
2. Remove extra whitespace
3. Apply common corrections (MARIAAUXILIADORA → MARIA AUXILIADORA)
4. Try exact match first
5. Try fuzzy match with Levenshtein distance < 3
6. If no match, treat as custom value

### Performance Considerations

**Optimization Strategies**
- Cache institution list in memory after first load
- Use virtual scrolling if institution list exceeds 50 items
- Debounce custom text validation (300ms)
- Memoize normalization results
- Lazy load institution details on demand

**Bundle Size**
- Institution configuration: ~5KB
- Component code: ~15KB
- Total impact: ~20KB (acceptable)

### Accessibility Requirements

**ARIA Attributes**
```html
<div role="radiogroup" aria-label="Seleccione lugar de votación">
  <div role="radio" aria-checked="true" aria-label="MARIA AUXILIADORA SEDE PRINCIPAL">
    <!-- checkbox content -->
  </div>
</div>

<input 
  type="text" 
  aria-label="Lugar de votación personalizado"
  aria-describedby="custom-help-text"
  aria-invalid="false"
/>
```

**Keyboard Navigation**
- Tab: Move between institution options and custom field
- Space: Toggle selected institution
- Enter: Submit form (if valid)
- Escape: Close modal
- Arrow keys: Navigate between institutions (optional enhancement)

### Security Considerations

**Input Sanitization**
- Sanitize custom text to prevent XSS attacks
- Validate institution IDs against known list
- Limit request rate for institution list loading
- Use HTTPS for all API calls

**Data Validation**
- Server-side validation mirrors client-side
- Reject institution IDs not in active list
- Enforce character limits on server
- Validate data types and formats

### Migration Strategy

**Existing Data Handling**
1. Analyze existing `lugarVotacion` values in database
2. Map common variations to standardized institutions
3. Create migration script to update existing records
4. Preserve original values in audit log
5. Flag unmapped values for manual review

**Rollout Plan**
1. Deploy new component with feature flag disabled
2. Test with small group of users
3. Monitor error rates and user feedback
4. Gradually enable for all users
5. Provide training documentation

### Browser Compatibility

**Supported Browsers**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android 90+

**Polyfills Required**
- None (using standard ES2020 features)

**Known Issues**
- IE11: Not supported (end of life)
- Safari < 14: May need CSS grid polyfill

## UI/UX Design Specifications

### Visual Design

**Institution List Layout**
```
┌─────────────────────────────────────┐
│ Lugar de Votación *                 │
├─────────────────────────────────────┤
│ ☐ MARIA AUXILIADORA SEDE PRINCIPAL  │
│ ☐ MARIA AUXILIADORA SEDE 2          │
│ ☐ FRANCISCO DE PAULA PRINCIPAL      │
│ ☐ PETRONITAS                        │
│ ☐ MEGACOLEGIO VILLA OLIMPICA        │
│ ☐ CARRUAGES                         │
│ ☐ Otro (escribir manualmente)      │
│   ┌───────────────────────────────┐ │
│   │ [Campo de texto]              │ │
│   └───────────────────────────────┘ │
│   0/200 caracteres                  │
└─────────────────────────────────────┘
```

**Spacing and Sizing**
- Checkbox size: 20x20px
- Touch target: 44x44px (mobile)
- Vertical spacing between options: 12px
- Horizontal padding: 16px
- Custom input height: 40px
- Font size: 14px (desktop), 16px (mobile)

**Colors (Conservative Party Theme)**
- Primary blue: #0052A5
- Checkbox checked: #0052A5
- Checkbox unchecked: #E0E0E0
- Hover state: #F5F5F5
- Error red: #D32F2F
- Text primary: #212121
- Text secondary: #757575

**Typography**
- Font family: 'Roboto', sans-serif
- Institution names: 14px, weight 500
- Labels: 14px, weight 400
- Error messages: 12px, weight 400
- Character counter: 12px, weight 400

### Interaction Design

**Selection Behavior**
1. Click anywhere on institution row to select
2. Previous selection automatically deselects
3. Visual feedback: checkmark appears, row highlights
4. Field value updates immediately

**Custom Mode Activation**
1. Click "Otro" checkbox
2. Text input field becomes enabled and focused
3. Character counter appears
4. Validation runs on blur or after 500ms of no typing

**Error Display**
1. Validation runs on form submit attempt
2. Error message appears below relevant field
3. Field border turns red
4. Error icon appears next to message
5. Focus moves to first error field

### Responsive Behavior

**Desktop (>768px)**
- Institution list: 2 columns if space allows
- Custom input: Full width
- Modal width: 600px

**Tablet (768px - 1024px)**
- Institution list: Single column
- Custom input: Full width
- Modal width: 90% of screen

**Mobile (<768px)**
- Institution list: Single column, full width
- Larger touch targets (44x44px)
- Custom input: Full width
- Modal: Full screen with close button
- Sticky header with title

## Dependencies

**Required Libraries**
- Angular 21+ (existing)
- RxJS 7+ (existing)
- TypeScript 5+ (existing)

**Optional Enhancements**
- Fuse.js: For fuzzy matching of institution names
- Lodash: For debouncing and memoization

**No New Dependencies Required**
- All functionality can be implemented with existing Angular features

## Future Enhancements

**Phase 2 Improvements**
1. Search/filter functionality for long institution lists
2. Recently used institutions at top
3. Geolocation-based institution suggestions
4. Bulk update tool for migrating old data
5. Admin panel for managing institution list
6. Institution usage analytics
7. Auto-complete for custom text based on history

**Potential Integrations**
- Integration with electoral registry API for validation
- Map view showing institution locations
- QR code generation for institution addresses
