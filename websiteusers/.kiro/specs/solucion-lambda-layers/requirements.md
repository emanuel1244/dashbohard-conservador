# Requirements Document

## Introduction

La función Lambda `partido-conservador-uploadExcel` está fallando con el error "Cannot find module 'xlsx'" porque las dependencias no están disponibles en el runtime. Este documento define los requisitos para solucionar el problema mediante la implementación de Lambda Layers que contengan las dependencias necesarias.

## Glossary

- **Lambda Function**: Función serverless de AWS Lambda que ejecuta código sin necesidad de gestionar servidores
- **Lambda Layer**: Archivo ZIP que contiene bibliotecas, dependencias personalizadas o código adicional que puede ser compartido entre múltiples funciones Lambda
- **Runtime**: Entorno de ejecución de Lambda (Node.js 18.x o 20.x)
- **xlsx**: Biblioteca de Node.js para leer y escribir archivos Excel
- **busboy**: Biblioteca de Node.js para parsear datos multipart/form-data
- **DynamoDB**: Base de datos NoSQL de AWS utilizada por la aplicación

## Requirements

### Requirement 1

**User Story:** Como desarrollador, quiero crear un Lambda Layer con las dependencias necesarias, para que la función Lambda pueda importar los módulos requeridos sin errores.

#### Acceptance Criteria

1. WHEN se crea el Lambda Layer THEN el sistema SHALL incluir las dependencias xlsx y busboy en la estructura correcta de directorios (nodejs/node_modules/)
2. WHEN se empaqueta el Layer THEN el sistema SHALL crear un archivo ZIP con la estructura compatible con AWS Lambda
3. WHEN se sube el Layer a AWS THEN el sistema SHALL registrar el ARN del Layer para su uso posterior
4. WHEN se verifica el Layer THEN el sistema SHALL confirmar que contiene todas las dependencias especificadas en package.json
5. WHEN se crea el Layer THEN el sistema SHALL ser compatible con el runtime Node.js 20.x

### Requirement 2

**User Story:** Como desarrollador, quiero asociar el Lambda Layer a la función Lambda existente, para que la función pueda acceder a las dependencias del Layer.

#### Acceptance Criteria

1. WHEN se asocia el Layer a la Lambda THEN el sistema SHALL actualizar la configuración de la función con el ARN del Layer
2. WHEN la Lambda se ejecuta THEN el sistema SHALL cargar automáticamente las dependencias del Layer en el runtime
3. WHEN se verifica la configuración THEN el sistema SHALL mostrar el Layer asociado en la consola de AWS Lambda
4. WHEN se actualiza el Layer THEN el sistema SHALL permitir cambiar la versión del Layer sin modificar el código de la Lambda
5. WHEN se asocia el Layer THEN el sistema SHALL mantener la configuración existente de la Lambda (memoria, timeout, variables de entorno)

### Requirement 3

**User Story:** Como desarrollador, quiero automatizar el proceso de creación y despliegue del Layer, para poder actualizar las dependencias de forma rápida y consistente.

#### Acceptance Criteria

1. WHEN se ejecuta el script de creación THEN el sistema SHALL instalar las dependencias en la estructura correcta de directorios
2. WHEN se ejecuta el script de empaquetado THEN el sistema SHALL crear el archivo ZIP del Layer
3. WHEN se ejecuta el script de despliegue THEN el sistema SHALL subir el Layer a AWS y obtener el ARN
4. WHEN se ejecuta el script de asociación THEN el sistema SHALL vincular el Layer a la función Lambda
5. WHEN se ejecuta el proceso completo THEN el sistema SHALL completar todos los pasos sin intervención manual

### Requirement 4

**User Story:** Como desarrollador, quiero verificar que la Lambda funciona correctamente con el Layer, para asegurar que el problema de dependencias está resuelto.

#### Acceptance Criteria

1. WHEN se invoca la Lambda después de asociar el Layer THEN el sistema SHALL importar el módulo xlsx sin errores
2. WHEN se procesa un archivo Excel THEN el sistema SHALL leer y parsear el contenido correctamente
3. WHEN se revisan los logs de CloudWatch THEN el sistema SHALL mostrar la ejecución exitosa sin errores de módulos faltantes
4. WHEN se prueba con un archivo real THEN el sistema SHALL procesar las personas y guardarlas en DynamoDB
5. WHEN se verifica el resultado THEN el sistema SHALL retornar una respuesta HTTP 200 con el mensaje de éxito
