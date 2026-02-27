# Implementation Plan

- [x] 1. Update backend API to support person CRUD operations




  - Add POST endpoint to create new person
  - Add PUT endpoint to update existing person  
  - Add DELETE endpoint to remove person
  - Implement validation logic for all fields
  - Add duplicate cedula detection
  - _Requirements: 1.2, 1.3, 2.2, 2.3, 3.2, 7.1, 7.3, 7.4, 7.5_

- [x] 2. Create person form modal component


  - Create modal component with overlay
  - Build form with all person fields
  - Add leader dropdown selector
  - Add status and commitment level dropdowns
  - Add notes textarea with character counter
  - Implement modal open/close logic
  - Add keyboard support (Escape to close)
  - _Requirements: 1.1, 1.5, 4.1, 5.1, 6.1, 10.3_


- [ ] 3. Implement form validation
  - Add required field validation (nombre, cedula)
  - Add email format validation
  - Add phone number format validation
  - Add notes character limit validation (1000 chars)
  - Add duplicate cedula check
  - Display inline error messages
  - Prevent submission with invalid data
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 6.2, 6.3_


- [ ] 4. Implement create person functionality
  - Wire up "Add Person" button to open modal
  - Implement form submission handler
  - Call API to create person
  - Handle success response
  - Close modal and refresh list
  - Show success notification
  - Handle errors and keep modal open

  - _Requirements: 1.1, 1.3, 1.4, 8.3, 8.4, 8.5_

- [ ] 5. Implement edit person functionality
  - Add edit button to person table rows
  - Load person data into form when editing
  - Pre-fill all form fields with existing data
  - Implement update submission handler
  - Call API to update person

  - Handle success and refresh UI
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 6. Implement delete person functionality
  - Add delete button to person table rows
  - Create confirmation dialog component
  - Show confirmation before deletion
  - Call API to delete person

  - Remove person from list on success
  - Handle leader assignment cleanup
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 7. Implement leader assignment
  - Fetch and populate leaders dropdown
  - Handle leader selection

  - Store both liderId and liderNombre
  - Record assignment timestamp automatically
  - Allow saving without leader (optional)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Implement status and commitment categorization
  - Add status dropdown with options (Activo, Inactivo, Potencial)

  - Add commitment dropdown with options (Alto, Medio, Bajo)
  - Set default values (Activo, Medio)
  - Validate enum values
  - Update modification timestamp on changes
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 9. Add loading states and visual feedback


  - Show loading spinner during API calls
  - Disable submit button while saving
  - Display success toast notifications
  - Display error toast notifications
  - Add loading overlay to modal
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Update persons list and statistics
  - Refresh list after create operation
  - Refresh list after update operation
  - Refresh list after delete operation
  - Maintain current sort order and filters
  - Update statistics counters automatically
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11. Add responsive design and accessibility
  - Make modal responsive for mobile devices
  - Add keyboard navigation support
  - Implement focus management
  - Add ARIA labels for screen readers
  - Ensure color contrast meets standards
  - Prevent background scroll when modal open
  - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [ ] 12. Style the components
  - Style modal with party colors
  - Style form fields and labels
  - Style buttons and actions
  - Add hover and focus states
  - Style error messages
  - Style success/error notifications
  - Add animations for modal open/close
  - _Requirements: All UI-related requirements_

- [ ] 13. Final testing and refinement
  - Test all CRUD operations end-to-end
  - Test validation with various inputs
  - Test error handling scenarios
  - Test on different screen sizes
  - Test keyboard navigation
  - Verify statistics update correctly
  - Test with existing Excel upload functionality
  - _Requirements: All requirements_
