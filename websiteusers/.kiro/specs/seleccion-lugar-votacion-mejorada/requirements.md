# Requirements Document

## Introduction

Este documento define los requisitos para mejorar el campo "Lugar de Votación" en el formulario de registro de personas del Dashboard del Partido Conservador. La mejora permitirá a los administradores seleccionar lugares de votación de una lista predefinida de instituciones mediante checkboxes, además de mantener la opción de ingresar manualmente un lugar personalizado. Esta funcionalidad mejorará la consistencia de los datos y facilitará el análisis por institución, mientras mantiene la flexibilidad para casos especiales.

## Glossary

- **Sistema**: Dashboard del Partido Conservador
- **Administrador**: Usuario con permisos para gestionar personas en el sistema
- **Lugar de Votación**: Institución o ubicación física donde una persona está registrada para votar
- **Institución**: Lugar de votación predefinido en el sistema (ej: MARIA AUXILIADORA, FRANCISCO DE PAULA)
- **Checkbox**: Control de interfaz que permite seleccionar una opción de una lista
- **Campo Personalizado**: Campo de texto libre para ingresar un lugar de votación no listado
- **Modal**: Ventana emergente que contiene el formulario de registro/edición de personas
- **Normalización**: Proceso de estandarizar nombres de instituciones para consistencia de datos

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to select a voting location from a predefined list of institutions, so that I can ensure data consistency across the system.

#### Acceptance Criteria

1. WHEN the administrator opens the person registration or edit modal THEN the System SHALL display a list of available institutions as selectable options
2. WHEN the administrator clicks on an institution checkbox THEN the System SHALL select that institution as the voting location
3. WHEN an institution is selected THEN the System SHALL populate the "Lugar de Votación" field with the institution name
4. WHEN the administrator selects a different institution THEN the System SHALL replace the previous selection with the new one
5. WHEN the form is submitted with a selected institution THEN the System SHALL save the standardized institution name

### Requirement 2

**User Story:** As an administrator, I want to see all available voting institutions organized by location, so that I can quickly find the correct institution.

#### Acceptance Criteria

1. WHEN the institution list is displayed THEN the System SHALL show institutions grouped by their location or type
2. WHEN multiple institutions exist THEN the System SHALL display them in alphabetical order within each group
3. WHEN an institution has multiple locations THEN the System SHALL display each location as a separate option with clear identification
4. WHEN the list contains more than 10 institutions THEN the System SHALL implement scrolling to show all options
5. WHEN institutions are displayed THEN the System SHALL show the full institution name and any relevant identifiers

### Requirement 3

**User Story:** As an administrator, I want to enter a custom voting location when it's not in the predefined list, so that I can register persons who vote at unlisted locations.

#### Acceptance Criteria

1. WHEN the institution list is displayed THEN the System SHALL show an option labeled "Otro (escribir manualmente)"
2. WHEN the administrator selects "Otro" THEN the System SHALL display a text input field for manual entry
3. WHEN the administrator types in the custom field THEN the System SHALL accept any text up to 200 characters
4. WHEN a custom location is entered THEN the System SHALL save it exactly as typed
5. WHEN the administrator switches from custom to a predefined institution THEN the System SHALL clear the custom text and use the selected institution

### Requirement 4

**User Story:** As an administrator, I want the system to remember previously selected institutions when editing a person, so that I can see the current voting location.

#### Acceptance Criteria

1. WHEN the administrator opens the edit modal for a person THEN the System SHALL pre-select the checkbox for that person's current voting location
2. WHEN the person's voting location matches a predefined institution THEN the System SHALL check the corresponding checkbox
3. WHEN the person's voting location is a custom value THEN the System SHALL select "Otro" and display the custom text in the input field
4. WHEN no voting location is set THEN the System SHALL leave all checkboxes unchecked
5. WHEN the administrator changes the selection THEN the System SHALL update the voting location field accordingly

### Requirement 5

**User Story:** As an administrator, I want the institution selection to work seamlessly on both desktop and mobile devices, so that I can register persons from any device.

#### Acceptance Criteria

1. WHEN the modal is displayed on a mobile device THEN the System SHALL adapt the checkbox layout for touch interaction
2. WHEN the administrator taps a checkbox on mobile THEN the System SHALL provide adequate touch target size (minimum 44x44 pixels)
3. WHEN the institution list is scrollable THEN the System SHALL maintain smooth scrolling on all devices
4. WHEN the custom text field is focused on mobile THEN the System SHALL display the appropriate keyboard
5. WHEN the modal is displayed on different screen sizes THEN the System SHALL maintain readability and usability

### Requirement 6

**User Story:** As a system administrator, I want to maintain a centralized list of voting institutions, so that I can ensure all users see the same standardized options.

#### Acceptance Criteria

1. WHEN institutions are loaded THEN the System SHALL retrieve them from a centralized configuration or database
2. WHEN a new institution needs to be added THEN the System SHALL allow updates to the institution list without code changes
3. WHEN institutions are updated THEN the System SHALL reflect changes immediately for all users
4. WHEN an institution is removed from the list THEN the System SHALL continue to display it for persons already assigned to it
5. WHEN the institution list fails to load THEN the System SHALL fall back to the custom text input option

### Requirement 7

**User Story:** As an administrator, I want clear visual feedback when selecting institutions, so that I know which option is currently selected.

#### Acceptance Criteria

1. WHEN an institution checkbox is selected THEN the System SHALL display a visual indicator (checkmark or highlight)
2. WHEN the administrator hovers over an institution option THEN the System SHALL show a hover state
3. WHEN only one institution can be selected at a time THEN the System SHALL use radio button behavior with checkbox styling
4. WHEN the custom field is active THEN the System SHALL visually indicate that custom mode is enabled
5. WHEN validation errors occur THEN the System SHALL highlight the voting location section with an error state

### Requirement 8

**User Story:** As an administrator, I want the voting location field to be validated before saving, so that I can ensure data quality.

#### Acceptance Criteria

1. WHEN the administrator submits the form THEN the System SHALL validate that either an institution is selected or custom text is provided
2. WHEN neither an institution nor custom text is provided THEN the System SHALL display a validation error message
3. WHEN custom text exceeds 200 characters THEN the System SHALL display a character limit error
4. WHEN custom text contains only whitespace THEN the System SHALL treat it as empty and show a validation error
5. WHEN validation passes THEN the System SHALL allow the form to be submitted

