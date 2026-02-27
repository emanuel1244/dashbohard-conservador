# Requirements Document

## Introduction

Este documento define los requisitos para implementar un sistema de exportación de registros duplicados detectados durante la carga masiva de archivos Excel. Cuando el sistema identifica personas duplicadas (por cédula), el usuario podrá descargar un archivo Excel con el detalle completo de estos duplicados para su revisión, corrección y posterior re-carga. Esta funcionalidad mejora la gestión de calidad de datos y facilita la identificación y resolución de inconsistencias en la base de datos electoral.

## Glossary

- **Sistema**: Dashboard del Partido Conservador
- **Usuario**: Administrador que realiza la carga masiva de datos
- **Persona Duplicada**: Registro con una cédula que ya existe en la base de datos o en el mismo archivo cargado
- **Archivo de Duplicados**: Archivo Excel generado que contiene únicamente los registros identificados como duplicados
- **Carga Masiva**: Proceso de importación de múltiples registros desde un archivo Excel
- **Validación**: Proceso de verificación de duplicados por número de cédula
- **Exportación**: Generación y descarga de un archivo Excel con datos específicos
- **Resumen de Carga**: Panel informativo que muestra estadísticas del proceso de importación

## Requirements

### Requirement 1

**User Story:** Como administrador, quiero ver claramente cuántos duplicados fueron detectados durante la carga, para entender el alcance del problema antes de decidir si descargarlos.

#### Acceptance Criteria

1. WHEN el Sistema completa el procesamiento del archivo Excel THEN el Sistema SHALL mostrar un resumen con el número total de duplicados encontrados
2. WHEN se detectan duplicados THEN el Sistema SHALL mostrar el mensaje "Duplicados Encontrados (N)" donde N es la cantidad de registros duplicados
3. WHEN no se detectan duplicados THEN el Sistema SHALL mostrar el mensaje "0 personas agregadas. ✓ Asignadas al líder: [Nombre Líder] ✓ Total de personas del líder: [Total] ✓ 20 duplicados encontrados"
4. WHEN el resumen se muestra THEN el Sistema SHALL usar un color de advertencia (amarillo/naranja) para la sección de duplicados
5. WHEN el resumen incluye duplicados THEN el Sistema SHALL mostrar un icono de advertencia junto al contador

### Requirement 2

**User Story:** Como administrador, quiero ver una lista detallada de las personas duplicadas en pantalla, para revisar rápidamente qué registros fueron rechazados.

#### Acceptance Criteria

1. WHEN se detectan duplicados THEN el Sistema SHALL mostrar una sección expandible titulada "Duplicados Encontrados (N)"
2. WHEN el usuario hace clic en la sección de duplicados THEN el Sistema SHALL expandir y mostrar la lista completa de registros duplicados
3. WHEN la lista de duplicados se muestra THEN el Sistema SHALL incluir para cada registro: número de fila, nombre completo y número de cédula
4. WHEN la lista contiene más de 5 duplicados THEN el Sistema SHALL mostrar los primeros 5 y un enlace "+N más..." para expandir la lista completa
5. WHEN el usuario hace clic en "+N más..." THEN el Sistema SHALL mostrar todos los duplicados restantes

### Requirement 3

**User Story:** Como administrador, quiero descargar un archivo Excel con todos los duplicados detectados, para poder revisarlos offline, corregirlos y volver a cargarlos.

#### Acceptance Criteria

1. WHEN se detectan duplicados THEN el Sistema SHALL mostrar un botón "Descargar Excel con Duplicados"
2. WHEN el usuario hace clic en el botón de descarga THEN el Sistema SHALL generar un archivo Excel con todos los registros duplicados
3. WHEN el archivo Excel se genera THEN el Sistema SHALL incluir todas las columnas originales del archivo cargado
4. WHEN el archivo Excel se genera THEN el Sistema SHALL agregar una columna adicional "Motivo Rechazo" con el valor "Cédula duplicada"
5. WHEN el archivo Excel se genera THEN el Sistema SHALL agregar una columna adicional "Fila Original" indicando el número de fila en el archivo fuente
6. WHEN el archivo se descarga THEN el Sistema SHALL usar el nombre "duplicados_[fecha]_[hora].xlsx" donde fecha y hora corresponden al momento de la descarga
7. WHEN no hay duplicados detectados THEN el Sistema SHALL ocultar el botón de descarga

### Requirement 4

**User Story:** Como administrador, quiero que el archivo de duplicados mantenga el mismo formato que el archivo original, para poder corregir los datos y volver a cargarlo sin problemas de compatibilidad.

#### Acceptance Criteria

1. WHEN el archivo de duplicados se genera THEN el Sistema SHALL preservar todos los nombres de columnas del archivo original
2. WHEN el archivo de duplicados se genera THEN el Sistema SHALL preservar el orden de las columnas del archivo original
3. WHEN el archivo de duplicados se genera THEN el Sistema SHALL preservar el formato de los datos (texto, números, fechas)
4. WHEN el archivo incluye columnas adicionales (Motivo Rechazo, Fila Original) THEN el Sistema SHALL colocarlas al final del archivo
5. WHEN el archivo se genera THEN el Sistema SHALL incluir una fila de encabezados con los nombres de todas las columnas

### Requirement 5

**User Story:** Como administrador, quiero que el sistema identifique duplicados tanto contra la base de datos existente como dentro del mismo archivo cargado, para detectar todas las inconsistencias posibles.

#### Acceptance Criteria

1. WHEN el Sistema procesa un archivo Excel THEN el Sistema SHALL verificar cada cédula contra la base de datos existente
2. WHEN el Sistema procesa un archivo Excel THEN el Sistema SHALL verificar cada cédula contra los registros ya procesados del mismo archivo
3. WHEN una cédula existe en la base de datos THEN el Sistema SHALL marcar el registro como duplicado con motivo "Cédula ya existe en el sistema"
4. WHEN una cédula aparece múltiples veces en el mismo archivo THEN el Sistema SHALL marcar las ocurrencias posteriores como duplicadas con motivo "Cédula duplicada en el archivo"
5. WHEN se detecta un duplicado THEN el Sistema SHALL incluir en el registro la información de cuándo fue detectado (contra BD o dentro del archivo)

### Requirement 6

**User Story:** Como administrador, quiero que el proceso de exportación de duplicados sea rápido y no bloquee la interfaz, para poder continuar trabajando mientras se genera el archivo.

#### Acceptance Criteria

1. WHEN el usuario hace clic en "Descargar Excel con Duplicados" THEN el Sistema SHALL mostrar un indicador de carga
2. WHEN el archivo se está generando THEN el Sistema SHALL deshabilitar el botón de descarga para prevenir múltiples clics
3. WHEN la generación del archivo se completa THEN el Sistema SHALL iniciar la descarga automáticamente
4. WHEN la descarga inicia THEN el Sistema SHALL ocultar el indicador de carga y rehabilitar el botón
5. WHEN la generación del archivo toma más de 2 segundos THEN el Sistema SHALL mostrar un mensaje "Generando archivo..."

### Requirement 7

**User Story:** Como administrador, quiero recibir notificaciones claras sobre el resultado de la exportación, para confirmar que el archivo se generó correctamente o identificar errores.

#### Acceptance Criteria

1. WHEN el archivo de duplicados se genera exitosamente THEN el Sistema SHALL mostrar un toast notification con el mensaje "Archivo de duplicados descargado correctamente"
2. WHEN la generación del archivo falla THEN el Sistema SHALL mostrar un toast notification con el mensaje "Error al generar el archivo de duplicados. Intenta nuevamente."
3. WHEN no hay duplicados para exportar THEN el Sistema SHALL mostrar un toast notification con el mensaje "No hay duplicados para exportar"
4. WHEN el navegador bloquea la descarga THEN el Sistema SHALL mostrar un toast notification con el mensaje "Descarga bloqueada. Permite las descargas en tu navegador."
5. WHEN la notificación se muestra THEN el Sistema SHALL ocultarla automáticamente después de 3 segundos

### Requirement 8

**User Story:** Como administrador, quiero que el archivo de duplicados incluya información contextual adicional, para facilitar la identificación y corrección de los problemas.

#### Acceptance Criteria

1. WHEN el archivo de duplicados se genera THEN el Sistema SHALL incluir una columna "Fecha Detección" con la fecha y hora en que se detectó el duplicado
2. WHEN el archivo de duplicados se genera THEN el Sistema SHALL incluir una columna "Líder Asignado" si el archivo original incluía asignación de líder
3. WHEN un duplicado existe en la base de datos THEN el Sistema SHALL incluir una columna "Fecha Registro Original" con la fecha del registro existente
4. WHEN el archivo se genera THEN el Sistema SHALL ordenar los duplicados por número de fila original (ascendente)
5. WHEN el archivo incluye múltiples duplicados de la misma cédula THEN el Sistema SHALL agruparlos consecutivamente

### Requirement 9

**User Story:** Como administrador, quiero que el sistema valide la integridad de los datos antes de generar el archivo de duplicados, para asegurar que la exportación sea confiable.

#### Acceptance Criteria

1. WHEN el Sistema prepara los datos para exportación THEN el Sistema SHALL verificar que cada registro duplicado tenga al menos nombre y cédula
2. WHEN un registro duplicado tiene datos incompletos THEN el Sistema SHALL incluirlo en el archivo con los campos vacíos claramente marcados
3. WHEN el Sistema genera el archivo THEN el Sistema SHALL validar que el número de registros en el archivo coincida con el contador de duplicados
4. WHEN la validación falla THEN el Sistema SHALL mostrar un error y no generar el archivo
5. WHEN todos los registros son válidos THEN el Sistema SHALL proceder con la generación del archivo

### Requirement 10

**User Story:** Como administrador, quiero que el botón de descarga de duplicados sea visualmente claro y accesible, para encontrarlo fácilmente cuando necesite revisar los registros rechazados.

#### Acceptance Criteria

1. WHEN se detectan duplicados THEN el Sistema SHALL mostrar el botón de descarga con un icono de Excel reconocible
2. WHEN el botón se muestra THEN el Sistema SHALL usar un color distintivo que indique acción secundaria (no el color primario de acciones principales)
3. WHEN el usuario pasa el cursor sobre el botón THEN el Sistema SHALL mostrar un tooltip con el texto "Descargar archivo Excel con los registros duplicados"
4. WHEN el botón está deshabilitado durante la generación THEN el Sistema SHALL mostrar un estado visual de deshabilitado con opacidad reducida
5. WHEN el botón se muestra en dispositivos móviles THEN el Sistema SHALL mantener un tamaño táctil adecuado (mínimo 44x44 píxeles)
