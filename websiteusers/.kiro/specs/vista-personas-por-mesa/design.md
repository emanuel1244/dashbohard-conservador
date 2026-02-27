# Design Document - Vista de Personas por Mesa

## Overview

Esta funcionalidad permite a los usuarios visualizar todas las personas asignadas a una mesa electoral específica mediante un modal interactivo. El sistema mostrará información detallada de cada persona incluyendo nombre, cédula, lugar de votación, líder asignado y datos de contacto.

## Architecture

### Frontend Components
- **Dashboard Component**: Componente existente que se extenderá para manejar clicks en mesas
- **Modal de Personas por Mesa**: Nuevo modal que mostrará la lista de personas
- **Servicio HTTP**: Utilizará el servicio existente para llamadas API

### Backend API
- **Endpoint**: `GET /api/personas/mesa/{numeroMesa}`
- **Lambda Function**: Nueva función Lambda para consultar personas por mesa
- **DynamoDB**: Consulta a la tabla `PartidoConservadorPersonas` filtrando por mesa

### Data Flow
```
Usuario hace click en mesa
    ↓
Dashboard Component captura evento
    ↓
Llama a API GET /api/personas/mesa/{numeroMesa}
    ↓
Lambda consulta DynamoDB
    ↓
Retorna lista de personas
    ↓
Modal muestra información
```

## Components and Interfaces

### Frontend Component Structure

```typescript
interface PersonaPorMesa {
  id: string;
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  mesa: string;
  lugarVotacion: string;
  direccionVotacion: string;
  liderId: string;
  liderNombre: string;
  estado: string;
  nivelCompromiso: string;
}

interface ModalState {
  isOpen: boolean;
  numeroMesa: string;
  personas: PersonaPorMesa[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
}
```

### API Response Format

```json
{
  "mesa": "001",
  "totalPersonas": 15,
  "lugarVotacion": "Escuela Central",
  "personas": [
    {
      "id": "persona-123",
      "nombre": "Juan Pérez",
      "cedula": "1234567890",
      "celular": "3001234567",
      "correo": "juan@example.com",
      "mesa": "001",
      "lugarVotacion": "Escuela Central",
      "direccionVotacion": "Calle 10 #20-30",
      "liderId": "lider-456",
      "liderNombre": "María García",
      "estado": "Activo",
      "nivelCompromiso": "Alto"
    }
  ]
}
```

## Data Models

### DynamoDB Query

```javascript
{
  TableName: 'PartidoConservadorPersonas',
  FilterExpression: 'mesa = :mesa',
  ExpressionAttributeValues: {
    ':mesa': numeroMesa
  }
}
```

### Frontend State Management

El componente Dashboard mantendrá el estado del modal:
- `modalPersonasMesa`: Estado del modal (abierto/cerrado)
- `personasMesaActual`: Array de personas de la mesa seleccionada
- `mesaSeleccionada`: Número de mesa actual
- `cargandoPersonasMesa`: Indicador de carga
- `errorPersonasMesa`: Mensaje de error si existe

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Mesa query returns only matching persons
*For any* mesa number, when querying persons by mesa, all returned persons should have a mesa field that matches the queried mesa number
**Validates: Requirements 1.2**

### Property 2: Empty mesa handling
*For any* mesa number with no assigned persons, the API should return an empty array and a totalPersonas count of 0
**Validates: Requirements 1.3**

### Property 3: Required fields presence
*For any* person returned in the mesa query, the response should include all required fields: id, nombre, cedula, mesa
**Validates: Requirements 2.1, 5.1**

### Property 4: Leader name consistency
*For any* person with a liderId, if the liderNombre field is present, it should not be empty
**Validates: Requirements 4.1, 4.3**

### Property 5: Search filter correctness
*For any* search term, the filtered results should only include persons whose nombre, cedula, or liderNombre contains the search term (case-insensitive)
**Validates: Requirements 10.2, 10.3**

### Property 6: Modal state consistency
*For any* modal state, if isOpen is true, then numeroMesa should not be empty
**Validates: Requirements 1.1, 8.1**

### Property 7: Loading state exclusivity
*For any* modal state, if isLoading is true, then personas array should be empty and error should be null
**Validates: Requirements 1.5**

### Property 8: Error state handling
*For any* API error response, the modal should display an error message and provide a retry option
**Validates: Requirements 9.1, 9.3**

## Error Handling

### API Errors
- **404 Not Found**: Mesa no existe o no tiene personas asignadas
- **500 Internal Server Error**: Error en DynamoDB o Lambda
- **Network Timeout**: Timeout después de 30 segundos

### Frontend Error Handling
```typescript
try {
  const response = await this.http.get(`/api/personas/mesa/${numeroMesa}`);
  this.personasMesaActual = response.personas;
} catch (error) {
  if (error.status === 404) {
    this.errorPersonasMesa = 'No se encontraron personas para esta mesa';
  } else if (error.status === 0) {
    this.errorPersonasMesa = 'Error de conexión. Por favor, intenta nuevamente';
  } else {
    this.errorPersonasMesa = 'Error al cargar las personas. Por favor, intenta nuevamente';
  }
}
```

### User-Friendly Messages
- Loading: "Cargando personas de la mesa..."
- Empty: "No hay personas asignadas a esta mesa"
- Error: "Error al cargar la información. Haz clic para reintentar"
- Network: "Sin conexión. Verifica tu conexión a internet"

## Testing Strategy

### Unit Tests
- Test modal open/close functionality
- Test search filter logic
- Test error message display
- Test empty state rendering
- Test data formatting (cedula, phone, email)

### Property-Based Tests
- **Property 1 Test**: Generate random mesa numbers and verify all returned persons have matching mesa field
- **Property 2 Test**: Generate random non-existent mesa numbers and verify empty array response
- **Property 3 Test**: Generate random person data and verify all required fields are present
- **Property 5 Test**: Generate random search terms and person lists, verify filter correctness
- **Property 6 Test**: Generate random modal states and verify consistency rules

### Integration Tests
- Test complete flow: click mesa → API call → display data
- Test error recovery: simulate API failure → show error → retry → success
- Test search functionality: open modal → enter search → verify filtered results

### Manual Testing
- Test on different screen sizes (desktop, tablet, mobile)
- Test with large datasets (100+ persons per mesa)
- Test with special characters in names
- Test keyboard navigation (Tab, Escape)
- Test accessibility with screen readers

## UI/UX Design

### Modal Layout

```
┌─────────────────────────────────────────────┐
│  Mesa 001 - Escuela Central          [X]    │
│  15 personas asignadas                      │
├─────────────────────────────────────────────┤
│  🔍 Buscar persona...                       │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐ │
│  │ 👤 Juan Pérez                         │ │
│  │ 📋 Cédula: 1234567890                 │ │
│  │ 📍 Escuela Central - Calle 10 #20-30  │ │
│  │ 👔 Líder: María García                │ │
│  │ 📞 3001234567 | ✉ juan@example.com    │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 👤 Ana López                          │ │
│  │ ...                                   │ │
│  └───────────────────────────────────────┘ │
│  [Scrollable area]                         │
└─────────────────────────────────────────────┘
```

### Responsive Design
- **Desktop**: Modal width 800px, 2-column card layout
- **Tablet**: Modal width 90%, single column
- **Mobile**: Full screen modal, stacked information

### Color Scheme
- Header: Primary blue (#1976d2)
- Cards: White background with subtle shadow
- Hover: Light gray (#f5f5f5)
- Icons: Gray (#666)
- Error: Red (#d32f2f)
- Success: Green (#388e3c)

## Performance Considerations

### Optimization Strategies
- Lazy load modal component
- Cache mesa data for 5 minutes
- Debounce search input (300ms)
- Virtual scrolling for lists > 50 items
- Compress API responses

### Expected Performance
- Modal open time: < 500ms
- API response time: < 2s
- Search filter response: < 100ms
- Smooth scrolling: 60fps

## Security Considerations

- Validate mesa number format on backend
- Sanitize search input to prevent XSS
- Rate limit API calls (max 10 per minute per user)
- Only return data for authenticated users
- No sensitive data in URL parameters

## Implementation Notes

### Existing Code to Extend
- `dashboard.component.ts`: Add modal state and methods
- `dashboard.component.html`: Add modal template
- `dashboard.component.scss`: Add modal styles

### New Files to Create
- `backend/lambda-personas-por-mesa.js`: Lambda function
- `backend/desplegar-personas-por-mesa.bat`: Deployment script

### API Gateway Configuration
- Resource: `/api/personas/mesa/{numeroMesa}`
- Method: GET
- Integration: AWS_PROXY to Lambda
- CORS: Enabled

### Dependencies
- No new npm packages required
- Uses existing Angular HttpClient
- Uses existing AWS SDK v3 in Lambda
