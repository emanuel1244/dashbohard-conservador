# Implementation Plan

- [x] 1. Create institution configuration and data models


  - Create `config/instituciones.json` with predefined institutions list
  - Create TypeScript interfaces for `Institucion`, `ConfiguracionInstituciones`, and related types
  - Create constants file with `INSTITUCIONES_PREDEFINIDAS` array
  - Add institution normalization utility functions
  - _Requirements: 1.1, 2.1, 6.1_



- [ ] 2. Create LugarVotacionSelector component structure
  - Generate new Angular component `LugarVotacionSelectorComponent`
  - Set up component inputs (valorInicial, disabled) and outputs (onChange, onValidationChange)
  - Create component template with basic structure

  - Set up component state management
  - _Requirements: 1.1, 3.1_

- [ ] 3. Implement institution list display
  - Load institutions from configuration file
  - Render institution list with checkboxes
  - Implement grouping by type if needed

  - Implement alphabetical sorting within groups
  - Add "Otro (escribir manualmente)" option at the end
  - _Requirements: 1.1, 2.1, 2.2, 2.5, 3.1_

- [ ] 4. Implement institution selection logic
  - Add click handlers for institution checkboxes
  - Implement radio button behavior (single selection)
  - Update component state when institution is selected
  - Emit onChange event with selected institution name
  - Add visual feedback (checkmark, highlight)
  - _Requirements: 1.2, 1.3, 1.4, 7.1, 7.3_

- [ ]* 4.1 Write property test for institution selection
  - **Property 1: Institution selection updates field**
  - **Validates: Requirements 1.2, 1.3**


- [ ]* 4.2 Write property test for single selection enforcement
  - **Property 2: Single selection enforcement**
  - **Validates: Requirements 1.4, 7.3**

- [ ] 5. Implement custom text input mode
  - Add click handler for "Otro" option
  - Show/hide custom text input based on selection
  - Implement character counter (0/200)
  - Add input change handler
  - Emit onChange event with custom text
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 5.1 Write property test for custom text character limit
  - **Property 6: Custom text character limit**

  - **Validates: Requirements 3.3**

- [ ]* 5.2 Write property test for custom text round-trip
  - **Property 7: Custom text round-trip**
  - **Validates: Requirements 3.4**

- [ ] 6. Implement mode switching logic
  - Handle switching from institution to custom mode
  - Handle switching from custom to institution mode
  - Clear custom text when switching to institution

  - Clear institution selection when switching to custom
  - _Requirements: 3.5_

- [ ]* 6.1 Write property test for mode switching
  - **Property 8: Mode switching clears custom text**
  - **Validates: Requirements 3.5**

- [ ] 7. Implement initial value loading for edit mode
  - Add logic to detect if initial value is an institution or custom text
  - Implement institution name matching with normalization
  - Pre-select matching institution checkbox if found

  - Pre-fill custom text field if value doesn't match any institution
  - Handle empty/null initial values
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 7.1 Write property test for edit mode pre-selection
  - **Property 9: Edit mode pre-selection**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 8. Implement validation logic
  - Create validation function for empty state
  - Create validation function for character limit
  - Create validation function for whitespace-only text
  - Emit validation state changes via onValidationChange
  - Display validation error messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 8.1 Write property test for required field validation
  - **Property 13: Required field validation**
  - **Validates: Requirements 8.1, 8.2**


- [ ]* 8.2 Write property test for whitespace validation
  - **Property 14: Whitespace validation**
  - **Validates: Requirements 8.4**

- [ ]* 8.3 Write property test for valid state allows submission
  - **Property 15: Valid state allows submission**
  - **Validates: Requirements 8.5**


- [ ] 9. Add visual feedback and styling
  - Style institution checkboxes with party colors
  - Add hover states for institution options
  - Style selected state with checkmark
  - Style custom text input field
  - Add error state styling (red border, error icon)
  - Style character counter

  - Add loading skeleton for institution list
  - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ] 10. Implement responsive design
  - Add CSS for mobile layout (single column, larger touch targets)
  - Add CSS for tablet layout
  - Add CSS for desktop layout (optional 2-column)
  - Ensure touch targets are minimum 44x44px on mobile
  - Test scrolling behavior with long lists


  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 11. Add accessibility features
  - Add ARIA role="radiogroup" to institution list
  - Add ARIA role="radio" and aria-checked to each option
  - Add ARIA labels to custom text input

  - Add aria-invalid for error states
  - Implement keyboard navigation (Tab, Space, Enter)
  - Add focus indicators
  - Test with screen reader
  - _Requirements: 10.2, 10.3_

- [ ] 12. Integrate component into person modal
  - Import LugarVotacionSelector into person modal component
  - Replace existing "lugarVotacion" text input with new selector
  - Wire up onChange handler to update form data
  - Wire up onValidationChange handler to form validation

  - Pass initial value from person data when editing
  - _Requirements: 1.1, 4.1_

- [ ] 13. Implement error handling and fallbacks
  - Add try-catch for institution list loading
  - Implement fallback to custom-only mode on load failure
  - Display warning message when institutions fail to load
  - Add retry button for failed loads
  - Log errors to console for debugging
  - _Requirements: 6.5_

- [x]* 13.1 Write unit test for load failure fallback

  - Test that component falls back to custom mode when institutions fail to load
  - _Requirements: 6.5_

- [ ] 14. Add institution name normalization
  - Create normalization utility function
  - Apply common corrections (MARIAAUXILIADORA → MARIA AUXILIADORA)
  - Remove extra whitespace
  - Convert to uppercase
  - Use normalization when matching existing values
  - Use normalization when saving institution names

  - _Requirements: 1.5, 4.2_

- [ ]* 14.1 Write property test for standardized name persistence
  - **Property 3: Standardized name persistence**
  - **Validates: Requirements 1.5**

- [x] 15. Implement backward compatibility for removed institutions

  - Add logic to display institution even if not in active list
  - Check person's current location against both active and inactive institutions
  - Show special indicator for inactive institutions
  - Allow editing to change to active institution or custom
  - _Requirements: 6.4_

- [ ]* 15.1 Write property test for removed institution compatibility
  - **Property 11: Removed institution backward compatibility**
  - **Validates: Requirements 6.4**

- [ ] 16. Add loading states and performance optimizations
  - Add skeleton loader while institutions are loading


  - Implement caching of institution list in memory
  - Add debouncing to custom text validation (300ms)
  - Memoize normalization results
  - Optimize re-renders with OnPush change detection
  - _Requirements: Performance considerations_

- [ ] 17. Create data migration script
  - Analyze existing lugarVotacion values in database
  - Create mapping of common variations to standard institutions
  - Write script to update existing records
  - Add logging for unmapped values
  - Test migration on copy of production data
  - _Requirements: Migration strategy_

- [ ]* 17.1 Write unit tests for migration script
  - Test mapping logic with various input formats
  - Test that original values are preserved in audit log
  - _Requirements: Migration strategy_

- [ ] 18. Final integration testing and refinement
  - Test complete create flow with institution selection
  - Test complete create flow with custom text
  - Test complete edit flow with existing institution
  - Test complete edit flow with existing custom text
  - Test switching between modes during form editing
  - Test form submission with validation errors
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Test on mobile devices (iOS Safari, Chrome Android)
  - Test keyboard navigation
  - Test with screen reader
  - _Requirements: All requirements_

