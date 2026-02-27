# Implementation Plan - Mejora UX CRUD

## Overview

Este plan implementa mejoras de UX para las operaciones CRUD de Personas y Líderes, incluyendo modal de confirmación, loaders, toast notifications mejorados y manejo robusto de errores.

## Tasks

- [x] 1. Crear constantes de mensajes y tipos


  - Definir constantes para todos los mensajes de toast
  - Definir interfaces TypeScript para ConfirmationModal y ErrorResponse
  - Crear enums para tipos de operación y entidades
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_



- [ ] 2. Implementar modal de confirmación
  - [ ] 2.1 Agregar estado y métodos del modal de confirmación
    - Agregar interface ConfirmationModal al componente
    - Agregar propiedad confirmationModal con valores iniciales
    - Crear método abrirModalConfirmacion()
    - Crear método cerrarModalConfirmacion()


    - Crear método ejecutarAccionConfirmada()
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 2.2 Crear template HTML del modal de confirmación
    - Agregar estructura del modal con overlay
    - Agregar icono de advertencia


    - Agregar título y mensaje dinámicos
    - Agregar botones Cancelar y Confirmar
    - Agregar event handlers para cerrar y confirmar
    - _Requirements: 1.3, 1.4, 1.5, 6.1, 6.2, 6.3_
  
  - [ ] 2.3 Agregar estilos SCSS del modal de confirmación
    - Estilos para overlay con backdrop blur


    - Estilos para contenedor del modal
    - Estilos para icono de advertencia
    - Estilos para botones (cancelar gris, confirmar rojo)
    - Animaciones de entrada y salida
    - Responsive design


    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 2.4 Agregar soporte de teclado y accesibilidad
    - Implementar cierre con tecla ESC
    - Implementar cierre al hacer clic fuera del modal
    - Agregar ARIA labels


    - Agregar focus trap
    - _Requirements: 6.7, 6.8_

- [ ] 3. Agregar estados de carga para eliminación
  - Agregar propiedades isDeletingPersona e isDeletingLider


  - Actualizar método eliminarPersona() para usar loading state
  - Actualizar método eliminarLider() para usar loading state
  - Deshabilitar botones durante eliminación
  - _Requirements: 2.3, 2.5, 2.7, 2.8_

- [x] 4. Reemplazar confirm() nativo con modal personalizado


  - [ ] 4.1 Actualizar eliminarPersona() para usar modal de confirmación
    - Reemplazar confirm() con abrirModalConfirmacion()
    - Configurar mensaje específico para personas
    - Pasar la acción de eliminación como callback


    - Mostrar loader durante la operación
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.3_
  
  - [x] 4.2 Actualizar eliminarLider() para usar modal de confirmación

    - Reemplazar confirm() con abrirModalConfirmacion()
    - Configurar mensaje específico para líderes
    - Pasar la acción de eliminación como callback
    - Mostrar loader durante la operación

    - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.5_

- [ ] 5. Mejorar mensajes de toast para operaciones exitosas
  - [ ] 5.1 Actualizar mensajes en guardarPersona()
    - Usar constante para "Usuario creado correctamente"


    - Usar constante para "Usuario actualizado correctamente"
    - Mantener duración de 3 segundos
    - _Requirements: 3.1, 3.2, 3.10_
  
  - [x] 5.2 Actualizar mensajes en guardarLider()

    - Usar constante para "Líder creado correctamente"
    - Usar constante para "Líder actualizado correctamente"
    - Mantener duración de 3 segundos
    - _Requirements: 3.4, 3.5, 3.10_
  

  - [ ] 5.3 Actualizar mensajes en eliminarPersona()
    - Usar constante para "Usuario eliminado correctamente"
    - Mantener duración de 3 segundos
    - _Requirements: 3.3, 3.10_

  
  - [ ] 5.4 Actualizar mensajes en eliminarLider()
    - Usar constante para "Líder eliminado correctamente"
    - Mantener duración de 3 segundos

    - _Requirements: 3.6, 3.10_

- [ ] 6. Implementar manejo centralizado de errores
  - [x] 6.1 Crear método handleError()

    - Detectar errores de red (status 0)
    - Mapear códigos HTTP a mensajes específicos
    - Extraer mensaje del backend si existe
    - Mostrar mensaje genérico si no hay mensaje específico
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_
  

  - [ ] 6.2 Integrar handleError() en guardarPersona()
    - Reemplazar manejarErrorAPI() con handleError()
    - Pasar contexto de operación
    - Mantener manejo de validationErrors
    - _Requirements: 3.7, 3.8, 3.9_
  
  - [x] 6.3 Integrar handleError() en guardarLider()

    - Agregar manejo de errores con handleError()
    - Pasar contexto de operación
    - _Requirements: 3.7, 3.8, 3.9_
  
  - [x] 6.4 Integrar handleError() en eliminarPersona()


    - Agregar manejo de errores con handleError()
    - Pasar contexto de operación
    - _Requirements: 3.7, 3.8, 3.9_
  
  - [ ] 6.5 Integrar handleError() en eliminarLider()
    - Agregar manejo de errores con handleError()
    - Pasar contexto de operación
    - _Requirements: 3.7, 3.8, 3.9_

- [ ] 7. Verificar recarga de datos sin perder filtros
  - Verificar que cargarDatos() se llama después de operaciones exitosas
  - Verificar que filtros activos se mantienen
  - Verificar que paginación se mantiene (si aplica)
  - Verificar que NO se usa window.location.reload()
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [ ] 8. Mejorar estilos de toast notifications
  - Verificar posición top-right
  - Verificar colores por tipo (success, error, warning, info)
  - Verificar animaciones de entrada y salida
  - Verificar botón de cierre manual
  - Verificar apilamiento vertical
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [ ] 9. Agregar indicadores de carga en botones
  - Mostrar spinner en botón "Guardar" durante isSubmitting
  - Deshabilitar botón durante operación
  - Cambiar texto a "Guardando..." durante operación
  - _Requirements: 2.1, 2.2, 2.4, 2.7, 2.8_

- [ ] 10. Checkpoint - Verificar funcionalidad básica
  - Probar crear persona con modal de éxito y toast
  - Probar editar persona con modal de éxito y toast
  - Probar eliminar persona con modal de confirmación y toast
  - Probar crear líder con modal de éxito y toast
  - Probar editar líder con modal de éxito y toast
  - Probar eliminar líder con modal de confirmación y toast
  - Verificar que no hay errores en consola

- [ ]* 11. Escribir tests unitarios
  - [ ]* 11.1 Tests para modal de confirmación
    - Test: modal se abre al hacer clic en eliminar
    - Test: modal se cierra al hacer clic en cancelar
    - Test: eliminación no se ejecuta al cancelar
    - Test: eliminación se ejecuta al confirmar
    - Test: modal se cierra al hacer clic fuera
    - Test: modal se cierra con tecla ESC
  
  - [ ]* 11.2 Tests para estados de carga
    - Test: loader se muestra al iniciar operación
    - Test: loader se oculta al completar operación
    - Test: botones se deshabilitan durante operación
    - Test: botones se habilitan después de operación
  
  - [ ]* 11.3 Tests para toast notifications
    - Test: mensaje correcto para cada operación
    - Test: toast se oculta después de 3 segundos
    - Test: botón de cierre manual funciona
    - Test: múltiples toasts se apilan correctamente
  
  - [ ]* 11.4 Tests para manejo de errores
    - Test: error de red muestra mensaje correcto
    - Test: error 400 muestra mensaje del backend
    - Test: error 401 muestra mensaje de autorización
    - Test: error 404 muestra mensaje de no encontrado
    - Test: error 500 muestra mensaje de servidor
    - Test: error sin mensaje muestra mensaje genérico
  
  - [ ]* 11.5 Tests para recarga de datos
    - Test: API se llama después de operación exitosa
    - Test: filtros se mantienen después de recarga
    - Test: paginación se mantiene después de recarga
    - Test: no se llama window.location.reload()

- [ ]* 12. Escribir property-based tests
  - [ ]* 12.1 Property test: Loader visibility during operations
    - **Feature: mejora-ux-crud, Property 1: Loader visibility during operations**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8**
    - Generar operaciones CRUD aleatorias
    - Verificar loader visible durante operación
    - Verificar loader oculto después de completar
  
  - [ ]* 12.2 Property test: Button disablement during operations
    - **Feature: mejora-ux-crud, Property 2: Button disablement during operations**
    - **Validates: Requirements 2.7**
    - Generar operaciones CRUD aleatorias
    - Verificar botones deshabilitados durante operación
    - Verificar botones habilitados después de completar
  
  - [ ]* 12.3 Property test: Toast auto-hide timing
    - **Feature: mejora-ux-crud, Property 3: Toast auto-hide timing**
    - **Validates: Requirements 3.10**
    - Generar toast notifications aleatorios
    - Verificar cada uno desaparece después de 3000ms
  
  - [ ]* 12.4 Property test: Data refresh trigger
    - **Feature: mejora-ux-crud, Property 4: Data refresh after successful operations**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
    - Generar operaciones CRUD exitosas aleatorias
    - Verificar API llamada para refrescar datos
  
  - [ ]* 12.5 Property test: Filter preservation
    - **Feature: mejora-ux-crud, Property 5: Filter preservation after refresh**
    - **Validates: Requirements 4.7**
    - Generar combinaciones de filtros aleatorias
    - Ejecutar operación CRUD
    - Verificar filtros sin cambios después de refresh
  
  - [ ]* 12.6 Property test: Pagination preservation
    - **Feature: mejora-ux-crud, Property 6: Pagination preservation after refresh**
    - **Validates: Requirements 4.8**
    - Generar números de página aleatorios
    - Ejecutar operación CRUD
    - Verificar página sin cambios después de refresh
  
  - [ ]* 12.7 Property test: No page reload
    - **Feature: mejora-ux-crud, Property 7: No full page reload on refresh**
    - **Validates: Requirements 4.9**
    - Generar operaciones CRUD aleatorias
    - Verificar window.location.reload nunca llamado
  
  - [ ]* 12.8 Property test: Error message extraction
    - **Feature: mejora-ux-crud, Property 8: Error message extraction from API**
    - **Validates: Requirements 5.1, 5.2**
    - Generar respuestas de error aleatorias con mensajes
    - Verificar mensaje exacto extraído y mostrado

- [ ] 13. Checkpoint final - Pruebas de integración
  - Probar todos los flujos de usuario completos
  - Verificar accesibilidad con lector de pantalla
  - Verificar responsive design en móvil
  - Verificar performance (no lag en animaciones)
  - Verificar que todos los tests pasan
  - Documentar cualquier issue encontrado

## Notes

- El sistema ya tiene implementado el modal de éxito con checkmark animado, mantenerlo para operaciones exitosas
- El sistema ya tiene el sistema de toasts, solo necesitamos mejorar los mensajes y asegurar consistencia
- Los tests marcados con * son opcionales pero recomendados para asegurar calidad
- Usar fast-check para property-based testing con mínimo 100 iteraciones
- Mantener el código existente que funciona bien, solo agregar/mejorar lo necesario
