# Design Document - Mejora UX CRUD

## Overview

Este diseño implementa mejoras de experiencia de usuario (UX) para las operaciones CRUD de Personas y Líderes en el Sistema de Gestión Electoral. El enfoque principal es proporcionar feedback visual claro, prevenir errores del usuario y manejar estados de error de manera profesional.

El sistema ya cuenta con:
- Modal de éxito animado con checkmark
- Sistema de toast notifications
- Operaciones CRUD funcionales para Personas y Líderes

Este diseño extiende la funcionalidad existente agregando:
- Modal de confirmación antes de eliminaciones
- Estados de carga (loaders) durante operaciones
- Mensajes de toast específicos por operación
- Manejo robusto de errores con mensajes claros
- Recarga automática de datos sin perder filtros

## Architecture

### Component Structure

```
DashboardComponent
├── Confirmation Modal (nuevo)
│   ├── Modal Overlay
│   ├── Modal Content
│   │   ├── Warning Icon
│   │   ├── Message Text
│   │   └── Action Buttons
│   │       ├── Cancel Button
│   │       └── Confirm Button
│   └── Modal State Management
│
├── Loading States (mejorado)
│   ├── isSubmitting (existente)
│   ├── isDeletingPersona (nuevo)
│   └── isDeletingLider (nuevo)
│
├── Toast System (existente - mejorado)
│   ├── Success Toasts
│   ├── Error Toasts
│   ├── Warning Toasts
│   └── Info Toasts
│
└── Success Modal (existente)
    └── Animated Checkmark
```

### Data Flow

```
User Action → Confirmation (if delete) → Loading State → API Call → Response Handler → Toast/Success Modal → Data Refresh
```

## Components and Interfaces

### 1. Confirmation Modal Interface

```typescript
interface ConfirmationModal {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmAction: () => void;
  type: 'danger' | 'warning' | 'info';
}
```

### 2. Loading State Management

```typescript
interface LoadingStates {
  isSubmitting: boolean;        // Para crear/editar (existente)
  isDeletingPersona: boolean;   // Para eliminar persona
  isDeletingLider: boolean;     // Para eliminar líder
}
```

### 3. Error Response Interface

```typescript
interface ErrorResponse {
  status: number;
  message?: string;
  error?: string;
  details?: { [key: string]: string };
}
```

### 4. Toast Configuration

```typescript
interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number; // 3000ms por defecto
}
```

## Data Models

### Confirmation Modal State

```typescript
confirmationModal: ConfirmationModal = {
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmAction: () => {},
  type: 'danger'
};
```

### Loading States

```typescript
loadingStates = {
  isSubmitting: false,
  isDeletingPersona: false,
  isDeletingLider: false
};
```

### Toast Messages Constants

```typescript
const TOAST_MESSAGES = {
  PERSONA: {
    CREATE_SUCCESS: 'Usuario creado correctamente',
    UPDATE_SUCCESS: 'Usuario actualizado correctamente',
    DELETE_SUCCESS: 'Usuario eliminado correctamente'
  },
  LIDER: {
    CREATE_SUCCESS: 'Líder creado correctamente',
    UPDATE_SUCCESS: 'Líder actualizado correctamente',
    DELETE_SUCCESS: 'Líder eliminado correctamente'
  },
  ERROR: {
    GENERIC: 'Ocurrió un error al procesar la solicitud. Intenta nuevamente.',
    NETWORK: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    UNAUTHORIZED: 'No tienes autorización para realizar esta acción',
    FORBIDDEN: 'Acceso denegado a este recurso',
    NOT_FOUND: 'El recurso solicitado no fue encontrado',
    SERVER_ERROR: 'Error interno del servidor. Por favor contacta al administrador'
  }
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Loader visibility during operations
*For any* CRUD operation (create, update, delete) on any entity (persona, líder), when the operation starts, a loader should be visible, and when the operation completes (success or error), the loader should be hidden.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8**

### Property 2: Button disablement during operations
*For any* CRUD operation in progress, all action buttons should be disabled to prevent multiple submissions.
**Validates: Requirements 2.7**

### Property 3: Toast auto-hide timing
*For any* toast notification displayed, it should automatically disappear after exactly 3 seconds (3000ms).
**Validates: Requirements 3.10**

### Property 4: Data refresh after successful operations
*For any* successful CRUD operation (create, update, delete), the system should trigger a data refresh by calling the API again.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

### Property 5: Filter preservation after refresh
*For any* data refresh operation, if filters were active before the refresh, they should remain active after the refresh with the same values.
**Validates: Requirements 4.7**

### Property 6: Pagination preservation after refresh
*For any* data refresh operation, if pagination was active, the current page number should be maintained after the refresh.
**Validates: Requirements 4.8**

### Property 7: No full page reload on refresh
*For any* data refresh operation, the browser should not perform a full page reload (window.location.reload should not be called).
**Validates: Requirements 4.9**

### Property 8: Error message extraction from API
*For any* API error response with status code != 200, if the response contains a "message" or "error" field, that exact message should be displayed to the user.
**Validates: Requirements 5.1, 5.2**

## Error Handling

### Error Classification

1. **Network Errors**
   - Connection timeout
   - Connection refused
   - No internet connection
   - DNS resolution failure
   - Message: "No se pudo conectar con el servidor. Verifica tu conexión a internet."

2. **HTTP Status Errors**
   - 400 Bad Request: Show validation details from backend
   - 401 Unauthorized: "No tienes autorización para realizar esta acción"
   - 403 Forbidden: "Acceso denegado a este recurso"
   - 404 Not Found: "El recurso solicitado no fue encontrado"
   - 500 Internal Server Error: "Error interno del servidor. Por favor contacta al administrador"
   - Other: "Ocurrió un error al procesar la solicitud. Intenta nuevamente."

3. **Validation Errors**
   - Extract from backend response
   - Display field-specific errors in form
   - Show general error toast if no field-specific errors

### Error Handling Flow

```typescript
handleError(error: any, operation: string) {
  let message: string;
  
  // Network errors
  if (error.status === 0 || error.name === 'HttpErrorResponse') {
    message = TOAST_MESSAGES.ERROR.NETWORK;
  }
  // HTTP status errors
  else if (error.status) {
    switch (error.status) {
      case 400:
        message = error.error?.message || error.error?.error || TOAST_MESSAGES.ERROR.GENERIC;
        if (error.error?.details) {
          this.validationErrors = error.error.details;
        }
        break;
      case 401:
        message = TOAST_MESSAGES.ERROR.UNAUTHORIZED;
        break;
      case 403:
        message = TOAST_MESSAGES.ERROR.FORBIDDEN;
        break;
      case 404:
        message = TOAST_MESSAGES.ERROR.NOT_FOUND;
        break;
      case 500:
        message = TOAST_MESSAGES.ERROR.SERVER_ERROR;
        break;
      default:
        message = error.error?.message || error.error?.error || TOAST_MESSAGES.ERROR.GENERIC;
    }
  }
  // Unknown errors
  else {
    message = TOAST_MESSAGES.ERROR.GENERIC;
  }
  
  this.mostrarMensajeError(message);
}
```

## Testing Strategy

### Unit Tests

1. **Confirmation Modal Tests**
   - Test modal opens when delete button is clicked
   - Test modal closes when cancel is clicked
   - Test delete is not called when cancel is clicked
   - Test delete is called when confirm is clicked
   - Test modal closes when clicking outside (if implemented)
   - Test modal closes on ESC key (if implemented)

2. **Loading State Tests**
   - Test loader shows when operation starts
   - Test loader hides when operation completes
   - Test buttons are disabled during operation
   - Test buttons are enabled after operation

3. **Toast Notification Tests**
   - Test correct message for each operation type
   - Test toast appears with correct styling
   - Test toast auto-hides after 3 seconds
   - Test manual close button works

4. **Error Handling Tests**
   - Test network error shows correct message
   - Test each HTTP status code shows correct message
   - Test backend error message is extracted and displayed
   - Test generic error message for unknown errors

5. **Data Refresh Tests**
   - Test API is called after successful operation
   - Test filters are preserved after refresh
   - Test pagination is preserved after refresh
   - Test no full page reload occurs

### Property-Based Tests

The testing framework will be **fast-check** for TypeScript/Angular, configured to run a minimum of 100 iterations per property.

1. **Property Test: Loader State Consistency**
   - Generate random CRUD operations
   - Verify loader is shown during operation
   - Verify loader is hidden after completion
   - Tag: **Feature: mejora-ux-crud, Property 1: Loader visibility during operations**

2. **Property Test: Button State During Operations**
   - Generate random CRUD operations
   - Verify all buttons are disabled during operation
   - Verify buttons are re-enabled after completion
   - Tag: **Feature: mejora-ux-crud, Property 2: Button disablement during operations**

3. **Property Test: Toast Auto-Hide Timing**
   - Generate random toast notifications
   - Verify each disappears after exactly 3000ms
   - Tag: **Feature: mejora-ux-crud, Property 3: Toast auto-hide timing**

4. **Property Test: Data Refresh Trigger**
   - Generate random successful CRUD operations
   - Verify API is called for data refresh after each
   - Tag: **Feature: mejora-ux-crud, Property 4: Data refresh after successful operations**

5. **Property Test: Filter Preservation**
   - Generate random filter combinations
   - Perform random CRUD operation
   - Verify filters remain unchanged after refresh
   - Tag: **Feature: mejora-ux-crud, Property 5: Filter preservation after refresh**

6. **Property Test: Pagination Preservation**
   - Generate random page numbers
   - Perform random CRUD operation
   - Verify page number remains unchanged after refresh
   - Tag: **Feature: mejora-ux-crud, Property 6: Pagination preservation after refresh**

7. **Property Test: No Page Reload**
   - Generate random CRUD operations
   - Verify window.location.reload is never called
   - Tag: **Feature: mejora-ux-crud, Property 7: No full page reload on refresh**

8. **Property Test: Error Message Extraction**
   - Generate random error responses with messages
   - Verify exact message is extracted and displayed
   - Tag: **Feature: mejora-ux-crud, Property 8: Error message extraction from API**

## Implementation Notes

### Existing Code to Preserve

The system already has:
- `successModal` with animated checkmark (keep for successful operations)
- `toasts` array and toast methods (extend with new messages)
- `isSubmitting` flag (keep for create/edit operations)
- `mostrarMensajeError()`, `mostrarMensajeExito()` methods (use these)

### New Code to Add

1. **Confirmation Modal Component**
   - New modal state and methods
   - HTML template for confirmation modal
   - SCSS styling for confirmation modal

2. **Enhanced Delete Methods**
   - Replace `confirm()` with custom modal
   - Add loading states for delete operations
   - Add specific toast messages

3. **Enhanced Error Handling**
   - Centralized error handler method
   - HTTP status code mapping
   - Network error detection

4. **Toast Message Constants**
   - Define all messages as constants
   - Use constants throughout the code

### Integration Points

1. **Replace existing `confirm()` calls**
   - `eliminarPersona()` method
   - `eliminarLider()` method

2. **Enhance existing CRUD methods**
   - `guardarPersona()` - add specific success message
   - `guardarLider()` - add specific success message
   - All methods - add centralized error handling

3. **Update existing toast calls**
   - Replace generic messages with specific constants
   - Ensure 3-second duration

## UI/UX Specifications

### Confirmation Modal Design

- **Overlay**: rgba(0, 0, 0, 0.6) with backdrop blur
- **Modal**: White background, rounded corners (16px), centered
- **Icon**: Warning triangle, orange/yellow color, 48px
- **Title**: Bold, 1.5rem, dark color
- **Message**: Regular, 1rem, gray color
- **Buttons**:
  - Cancel: Gray background, hover effect
  - Confirm: Red background (#dc3545), white text, hover effect
- **Animation**: Fade in overlay, scale in modal

### Toast Notification Design (Existing - Ensure Compliance)

- **Position**: Fixed, top-right, 20px from edges
- **Size**: Min-width 360px, auto height
- **Colors**:
  - Success: Green (#4caf50)
  - Error: Red (#f44336)
  - Warning: Orange (#ff9800)
  - Info: Blue (#2196f3)
- **Animation**: Slide in from right, fade out
- **Duration**: 3000ms (3 seconds)
- **Stacking**: Vertical, 12px gap between toasts

### Loading Indicators

- **Spinner**: Use existing spinner design
- **Position**: Center of modal or button
- **Size**: 24px for buttons, 48px for full-screen
- **Color**: Match primary color (#003DA5)

## Accessibility Considerations

1. **Confirmation Modal**
   - Focus trap within modal
   - ESC key to close
   - ARIA labels for screen readers
   - Keyboard navigation support

2. **Toast Notifications**
   - ARIA live regions for screen reader announcements
   - Sufficient color contrast
   - Manual close option

3. **Loading States**
   - ARIA busy attribute
   - Screen reader announcements
   - Visual indicators for all users

## Performance Considerations

1. **Debouncing**: Not needed for CRUD operations (single actions)
2. **Memory**: Clean up toast timers on component destroy
3. **API Calls**: Avoid redundant calls, use existing data when possible
4. **Animations**: Use CSS transforms for better performance

## Security Considerations

1. **XSS Prevention**: Sanitize all error messages from backend
2. **CSRF**: Use existing CSRF tokens in API calls
3. **Authorization**: Verify user permissions before showing delete options
4. **Input Validation**: Maintain existing validation, add visual feedback
