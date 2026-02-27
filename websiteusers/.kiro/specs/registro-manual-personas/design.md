# Design Document - Manual Person Registration

## Overview

This feature adds manual person registration capabilities to the Dashboard del Partido Conservador. It provides a user-friendly modal-based interface for creating, editing, and deleting individual person records, complementing the existing Excel bulk upload functionality. The system includes comprehensive validation, leader assignment, status categorization, and real-time UI updates.

## Architecture

### Component Structure

```
DashboardComponent (existing)
├── PersonModalComponent (new)
│   ├── PersonFormComponent (new)
│   └── LeaderSelectorComponent (new)
├── PersonTableComponent (enhanced)
│   ├── PersonRowComponent (enhanced)
│   └── PersonActionsComponent (new)
└── ConfirmDialogComponent (new)
```

### Data Flow

1. **Create Flow**: User clicks "Add Person" → Modal opens → User fills form → Validation → API POST → Update local state → Refresh table
2. **Edit Flow**: User clicks edit icon → Load person data → Modal opens with data → User modifies → Validation → API PUT → Update local state → Refresh table
3. **Delete Flow**: User clicks delete icon → Confirmation dialog → API DELETE → Update local state → Refresh table

### State Management

The component will manage the following state:
- `personas: Persona[]` - List of all persons
- `lideres: Lider[]` - List of all leaders
- `showModal: boolean` - Modal visibility
- `editingPersona: Persona | null` - Person being edited
- `formData: PersonaForm` - Current form data
- `isSubmitting: boolean` - Form submission state
- `validationErrors: ValidationErrors` - Form validation errors

## Components and Interfaces

### Data Models

```typescript
interface Persona {
  id: string;
  cedula: string;
  nombre: string;
  celular?: string;
  correo?: string;
  direccion?: string;
  mesa?: string;
  lugarVotacion?: string;
  direccionLugarVotacion?: string;
  zona?: string;
  
  // New fields
  liderId?: string;
  liderNombre?: string;
  estado: 'Activo' | 'Inactivo' | 'Potencial';
  nivelCompromiso: 'Alto' | 'Medio' | 'Bajo';
  notas?: string;
  fechaAsignacion?: string;
  fechaActualizacion?: string;
}

interface PersonaForm {
  cedula: string;
  nombre: string;
  celular: string;
  correo: string;
  direccion: string;
  mesa: string;
  lugarVotacion: string;
  direccionLugarVotacion: string;
  zona: string;
  liderId: string;
  estado: 'Activo' | 'Inactivo' | 'Potencial';
  nivelCompromiso: 'Alto' | 'Medio' | 'Bajo';
  notas: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface Lider {
  id: string;
  nombre: string;
  cedula: string;
  celular: string;
  correo: string;
  zona: string;
}
```

### API Endpoints

```typescript
// Create person
POST /api/personas
Body: PersonaForm
Response: { success: boolean, persona: Persona, message: string }

// Update person
PUT /api/personas/:id
Body: Partial<PersonaForm>
Response: { success: boolean, persona: Persona, message: string }

// Delete person
DELETE /api/personas/:id
Response: { success: boolean, message: string }

// Get all leaders (existing)
GET /api/lideres
Response: { lideres: Lider[] }
```

### Component Methods

```typescript
class DashboardComponent {
  // Modal management
  openCreateModal(): void
  openEditModal(persona: Persona): void
  closeModal(): void
  
  // CRUD operations
  createPersona(formData: PersonaForm): Promise<void>
  updatePersona(id: string, formData: Partial<PersonaForm>): Promise<void>
  deletePersona(id: string): Promise<void>
  
  // Validation
  validateForm(formData: PersonaForm): ValidationErrors
  validateCedula(cedula: string): boolean
  validateEmail(email: string): boolean
  validatePhone(phone: string): boolean
  checkDuplicateCedula(cedula: string, excludeId?: string): boolean
  
  // UI updates
  refreshPersonasList(): void
  updateStatistics(): void
  showSuccessMessage(message: string): void
  showErrorMessage(message: string): void
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Form validation runs before save
*For any* form submission with person data, validation must complete and pass before any API call is made
**Validates: Requirements 1.2, 2.2**

Property 2: Valid data creates person record
*For any* valid person form data, submitting the form should result in a new person record in the database with matching data
**Validates: Requirements 1.3**

Property 3: Successful creation updates UI
*For any* successful person creation, the modal should close and the person should appear in the persons list
**Validates: Requirements 1.4, 9.1**

Property 4: Cancel discards data
*For any* form data entered, closing the modal without saving should not create or modify any person records
**Validates: Requirements 1.5, 2.5**

Property 5: Edit loads existing data
*For any* existing person, opening the edit modal should pre-fill all form fields with that person's current data
**Validates: Requirements 2.1**

Property 6: Update modifies record
*For any* valid update to a person, the person record should reflect all modified fields after save
**Validates: Requirements 2.3**

Property 7: Successful update refreshes UI
*For any* successful person update, the modal should close and the person's row should display the updated data
**Validates: Requirements 2.4, 9.2**

Property 8: Delete removes record
*For any* person, confirming deletion should remove that person from the database
**Validates: Requirements 3.2**

Property 9: Successful deletion updates UI
*For any* successful deletion, the person should no longer appear in the persons list
**Validates: Requirements 3.3, 9.3**

Property 10: Cancel deletion preserves record
*For any* person, canceling the delete confirmation should leave the person record unchanged
**Validates: Requirements 3.4**

Property 11: Leader assignment stores both ID and name
*For any* person saved with a selected leader, both liderId and liderNombre fields should be populated
**Validates: Requirements 4.3**

Property 12: Leader assignment records timestamp
*For any* person assigned to a leader, the fechaAsignacion field should contain the current timestamp
**Validates: Requirements 4.5**

Property 13: Status accepts only valid values
*For any* status value submitted, it must be one of: Activo, Inactivo, or Potencial
**Validates: Requirements 5.2**

Property 14: Commitment accepts only valid values
*For any* commitment level submitted, it must be one of: Alto, Medio, or Bajo
**Validates: Requirements 5.3**

Property 15: Updates trigger timestamp
*For any* person update, the fechaActualizacion field should be set to the current timestamp
**Validates: Requirements 5.5**

Property 16: Notes respect character limit
*For any* notes text, the system should accept text up to 1000 characters and reject longer text
**Validates: Requirements 6.2**

Property 17: Notes persist with person
*For any* person saved with notes, retrieving that person should return the same notes text
**Validates: Requirements 6.4**

Property 18: Required fields validated
*For any* form submission, if nombre or cedula are empty, validation should fail with appropriate error messages
**Validates: Requirements 7.1, 7.2**

Property 19: Duplicate cedula rejected
*For any* cedula that already exists in the database, attempting to create a new person with that cedula should fail with a duplicate error
**Validates: Requirements 7.3**

Property 20: Email format validated
*For any* email provided, it must match a valid email pattern or validation should fail
**Validates: Requirements 7.4**

Property 21: Phone format validated
*For any* phone number provided, it must contain only numeric characters or validation should fail
**Validates: Requirements 7.5**

Property 22: Submit button disabled during save
*For any* form submission in progress, the submit button should be disabled to prevent duplicate submissions
**Validates: Requirements 8.2**

Property 23: Error preserves form data
*For any* form submission that fails, the modal should remain open with all entered data preserved
**Validates: Requirements 8.5**

Property 24: Updates maintain filters
*For any* list update operation, the current sort order and active filters should be preserved
**Validates: Requirements 9.4**

Property 25: Statistics stay synchronized
*For any* create, update, or delete operation, the statistics counters should reflect the current database state
**Validates: Requirements 9.5**

## Error Handling

### Validation Errors
- Display inline error messages below each invalid field
- Highlight invalid fields with red border
- Prevent form submission until all errors are resolved
- Show summary of errors at top of form

### API Errors
- Network errors: Display "Connection error. Please try again."
- Server errors (500): Display "Server error. Please contact support."
- Duplicate cedula (409): Display "This cedula is already registered."
- Validation errors (400): Display specific field errors from server
- Timeout: Display "Request timed out. Please try again."

### User Feedback
- Success: Green toast notification with success message
- Error: Red toast notification with error details
- Loading: Spinner overlay on modal during API calls
- Confirmation: Modal dialog for destructive actions (delete)

## Testing Strategy

### Unit Tests
- Test validation functions with various inputs
- Test form state management
- Test API service methods
- Test error handling logic
- Test UI state transitions

### Property-Based Tests
We will use **fast-check** (for TypeScript/JavaScript) as our property-based testing library.

Each property-based test should run a minimum of 100 iterations to ensure thorough coverage.

Property-based tests will be tagged with comments in the following format:
`// Feature: registro-manual-personas, Property {number}: {property_text}`

Each correctness property listed above will be implemented as a single property-based test that validates the specified behavior across randomly generated test data.

### Integration Tests
- Test complete create flow from button click to list update
- Test complete edit flow with data persistence
- Test complete delete flow with confirmation
- Test leader assignment end-to-end
- Test validation with API integration

### Manual Testing
- Test responsive behavior on mobile devices
- Test keyboard navigation and accessibility
- Test visual feedback and animations
- Test error message clarity
- Test user experience flow

## Implementation Notes

### Form Validation
- Validate on blur for individual fields
- Validate on submit for entire form
- Show errors immediately after first submit attempt
- Clear errors when field becomes valid

### Performance Considerations
- Debounce duplicate cedula check (300ms)
- Cache leaders list to avoid repeated API calls
- Use virtual scrolling for large person lists
- Optimize re-renders with React.memo or Angular OnPush

### Accessibility
- Use semantic HTML elements
- Add ARIA labels to form fields
- Support keyboard navigation (Tab, Enter, Escape)
- Ensure sufficient color contrast
- Provide screen reader announcements for dynamic content

### Security
- Sanitize all user inputs before sending to API
- Validate data types on both client and server
- Implement CSRF protection
- Use HTTPS for all API calls
- Limit request rate to prevent abuse
