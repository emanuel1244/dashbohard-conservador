# Requirements Document

## Introduction

El sistema de exportación de archivos (Excel y PDF) actualmente descarga archivos que no pueden ser abiertos por las aplicaciones correspondientes. Los archivos se descargan pero muestran errores de formato o archivo corrupto. Esto se debe a que las funciones Lambda de AWS devuelven los archivos codificados en base64 a través de API Gateway, pero el servicio frontend de Angular no está decodificando correctamente estos archivos antes de descargarlos.

## Glossary

- **Lambda Function**: Función serverless de AWS que genera archivos Excel o PDF
- **API Gateway**: Servicio de AWS que expone las funciones Lambda como endpoints HTTP
- **Base64 Encoding**: Codificación que convierte datos binarios a texto ASCII
- **Blob**: Objeto binario grande (Binary Large Object) usado en navegadores para representar archivos
- **ExportService**: Servicio Angular que maneja las solicitudes de exportación
- **HttpClient**: Cliente HTTP de Angular para realizar peticiones

## Requirements

### Requirement 1

**User Story:** Como usuario del sistema, quiero exportar datos a Excel, para que pueda abrir y visualizar correctamente el archivo descargado en Microsoft Excel.

#### Acceptance Criteria

1. WHEN el usuario solicita exportar datos a Excel THEN el sistema SHALL descargar un archivo .xlsx válido que puede ser abierto por Microsoft Excel
2. WHEN el archivo Excel se descarga THEN el sistema SHALL decodificar correctamente el contenido base64 recibido del backend
3. WHEN el archivo Excel se abre THEN el sistema SHALL mostrar todos los datos formateados correctamente sin errores de formato
4. WHEN la descarga falla THEN el sistema SHALL mostrar un mensaje de error descriptivo al usuario

### Requirement 2

**User Story:** Como usuario del sistema, quiero exportar reportes a PDF, para que pueda abrir y visualizar correctamente el archivo descargado en Adobe Acrobat Reader.

#### Acceptance Criteria

1. WHEN el usuario solicita exportar un reporte a PDF THEN el sistema SHALL descargar un archivo .pdf válido que puede ser abierto por Adobe Acrobat Reader
2. WHEN el archivo PDF se descarga THEN el sistema SHALL decodificar correctamente el contenido base64 recibido del backend
3. WHEN el archivo PDF se abre THEN el sistema SHALL mostrar todo el contenido del reporte sin errores de codificación
4. WHEN la descarga falla THEN el sistema SHALL mostrar un mensaje de error descriptivo al usuario

### Requirement 3

**User Story:** Como desarrollador del sistema, quiero que el servicio de exportación maneje correctamente las respuestas de API Gateway, para que los archivos binarios se procesen correctamente independientemente del formato.

#### Acceptance Criteria

1. WHEN API Gateway devuelve una respuesta con isBase64Encoded=true THEN el ExportService SHALL detectar y decodificar el contenido base64
2. WHEN se recibe un archivo codificado en base64 THEN el sistema SHALL convertirlo a un Blob binario válido
3. WHEN se crea el Blob THEN el sistema SHALL usar el tipo MIME correcto según el formato del archivo
4. WHEN el Blob está listo THEN el sistema SHALL iniciar la descarga automática con el nombre de archivo correcto

### Requirement 4

**User Story:** Como usuario del sistema, quiero que las exportaciones funcionen de manera consistente, para que todos los tipos de exportación (personas, líderes, reportes, certificados) descarguen archivos válidos.

#### Acceptance Criteria

1. WHEN se exportan personas a Excel THEN el sistema SHALL generar un archivo válido con todas las columnas y datos
2. WHEN se exportan líderes a Excel THEN el sistema SHALL generar un archivo válido con estadísticas y datos
3. WHEN se genera un reporte general en PDF THEN el sistema SHALL generar un archivo válido con todas las secciones
4. WHEN se generan certificados en PDF THEN el sistema SHALL generar un archivo válido con el formato correcto
5. WHEN se genera un listado de mesa en PDF THEN el sistema SHALL generar un archivo válido con la lista completa
