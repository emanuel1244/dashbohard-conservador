# Design Document

## Overview

Esta solución implementa Lambda Layers para resolver el problema de dependencias faltantes en la función `partido-conservador-uploadExcel`. El diseño se centra en crear un Layer reutilizable que contenga las dependencias npm necesarias (xlsx, busboy) y asociarlo a la función Lambda existente.

## Architecture

### Componentes Principales

1. **Lambda Layer (nodejs-dependencies-layer)**
   - Contiene las dependencias npm empaquetadas
   - Compatible con Node.js 20.x runtime
   - Estructura: `nodejs/node_modules/`
   - Versionado en AWS Lambda

2. **Scripts de Automatización**
   - Script de creación del Layer
   - Script de despliegue a AWS
   - Script de asociación a la Lambda
   - Script de verificación

3. **Función Lambda Existente**
   - `partido-conservador-uploadExcel`
   - Runtime: Node.js 20.x
   - Configuración actualizada con Layer ARN

### Flujo de Despliegue

```
1. Instalar dependencias → 2. Empaquetar Layer → 3. Subir a AWS → 4. Asociar a Lambda → 5. Verificar
```

## Components and Interfaces

### 1. Lambda Layer Package

**Estructura de Directorios:**
```
layer/
└── nodejs/
    ├── node_modules/
    │   ├── xlsx/
    │   └── busboy/
    └── package.json
```

**package.json:**
```json
{
  "name": "lambda-dependencies-layer",
  "version": "1.0.0",
  "dependencies": {
    "xlsx": "^0.18.5",
    "busboy": "^1.6.0"
  }
}
```

### 2. Scripts de Automatización

**crear-layer.bat:**
- Crea la estructura de directorios
- Instala dependencias con npm
- Empaqueta en formato ZIP

**desplegar-layer.bat:**
- Sube el ZIP a AWS Lambda
- Publica nueva versión del Layer
- Retorna el ARN del Layer

**asociar-layer.bat:**
- Actualiza la configuración de la Lambda
- Asocia el Layer usando el ARN
- Verifica la asociación

**verificar-layer.bat:**
- Invoca la Lambda con un evento de prueba
- Revisa los logs de CloudWatch
- Confirma que no hay errores de módulos

### 3. Lambda Function Code Review

**Verificaciones Necesarias:**
- Confirmar que el código usa `require('xlsx')` correctamente
- Verificar que el código usa `require('busboy')` correctamente
- Asegurar que no hay referencias a rutas absolutas de módulos
- Confirmar que el handler está correctamente definido
- Verificar que el código es compatible con Node.js 20.x

**Código Lambda Actual:**
```javascript
const XLSX = require('xlsx');
const Busboy = require('busboy');
// ... resto del código
```

### 4. AWS CLI Commands

**Publicar Layer:**
```bash
aws lambda publish-layer-version \
  --layer-name nodejs-dependencies-layer \
  --description "Dependencies for Excel upload Lambda" \
  --zip-file fileb://layer.zip \
  --compatible-runtimes nodejs20.x \
  --region us-west-2
```

**Asociar Layer a Lambda:**
```bash
aws lambda update-function-configuration \
  --function-name partido-conservador-uploadExcel \
  --layers <LAYER_ARN> \
  --region us-west-2
```

**Verificar Configuración de Lambda:**
```bash
aws lambda get-function-configuration \
  --function-name partido-conservador-uploadExcel \
  --region us-west-2
```

**Invocar Lambda para Prueba:**
```bash
aws lambda invoke \
  --function-name partido-conservador-uploadExcel \
  --payload file://test-event.json \
  --region us-west-2 \
  response.json
```

## Data Models

### Layer Configuration

```typescript
interface LayerConfig {
  layerName: string;           // "nodejs-dependencies-layer"
  description: string;          // Descripción del Layer
  compatibleRuntimes: string[]; // ["nodejs20.x"]
  zipFile: string;              // Ruta al archivo ZIP
  region: string;               // "us-west-2"
}
```

### Lambda Configuration Update

```typescript
interface LambdaLayerUpdate {
  functionName: string;  // "partido-conservador-uploadExcel"
  layers: string[];      // [ARN del Layer]
  region: string;        // "us-west-2"
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Layer Structure Validity
*For any* Lambda Layer package created, the directory structure SHALL contain a `nodejs/node_modules/` path with all specified dependencies installed.
**Validates: Requirements 1.1, 1.2**

### Property 2: Dependency Availability
*For any* Lambda function with the Layer attached, importing the `xlsx` or `busboy` modules SHALL succeed without throwing "Cannot find module" errors.
**Validates: Requirements 2.2, 4.1**

### Property 3: Layer Association Persistence
*For any* Lambda function configuration update, the Layer ARN SHALL remain associated with the function until explicitly removed or updated.
**Validates: Requirements 2.3, 2.5**

### Property 4: Deployment Idempotency
*For any* deployment script execution, running the script multiple times with the same inputs SHALL produce the same final state (Layer published and associated).
**Validates: Requirements 3.5**

### Property 5: Runtime Compatibility
*For any* Lambda Layer created, it SHALL be compatible with the Node.js 20.x runtime as specified in the configuration.
**Validates: Requirements 1.5**

## Error Handling

### Layer Creation Errors

1. **Dependency Installation Failure**
   - Error: npm install fails
   - Handling: Retry with --force flag, check network connectivity
   - Logging: Log npm error output to console

2. **ZIP Creation Failure**
   - Error: Insufficient disk space or permissions
   - Handling: Check available space, verify write permissions
   - Logging: Log file system error details

### AWS Deployment Errors

1. **Layer Upload Failure**
   - Error: AWS CLI authentication or network issues
   - Handling: Verify AWS credentials, check region configuration
   - Logging: Log AWS CLI error response

2. **Layer Association Failure**
   - Error: Lambda function not found or insufficient permissions
   - Handling: Verify function name, check IAM permissions
   - Logging: Log AWS error code and message

3. **Layer Size Limit Exceeded**
   - Error: Layer ZIP exceeds 50MB uncompressed limit
   - Handling: Remove unnecessary dependencies, optimize package
   - Logging: Log current size and limit

### Runtime Errors

1. **Module Import Failure**
   - Error: Module still not found after Layer association
   - Handling: Verify Layer structure, check runtime compatibility
   - Logging: Log import error and Layer ARN

2. **Version Mismatch**
   - Error: Dependency version incompatibility
   - Handling: Update package.json, rebuild Layer
   - Logging: Log version conflict details

## Testing Strategy

### Unit Testing

1. **Layer Structure Tests**
   - Verify directory structure is correct
   - Confirm package.json exists and is valid
   - Check that node_modules contains expected packages

2. **Script Execution Tests**
   - Test each script independently
   - Verify exit codes for success/failure
   - Check that output files are created

### Property-Based Testing

The testing approach will use property-based testing to verify universal properties across all inputs. We will use `fast-check` as the property-based testing library for Node.js.

**Configuration:**
- Each property-based test will run a minimum of 100 iterations
- Tests will be tagged with comments referencing the design document properties
- Tag format: `**Feature: solucion-lambda-layers, Property {number}: {property_text}**`

**Property Tests:**

1. **Test Layer Structure Validity (Property 1)**
   - Generate random dependency lists
   - Create Layer for each list
   - Verify structure is always correct

2. **Test Dependency Availability (Property 2)**
   - Generate random module import attempts
   - Verify all specified modules can be imported
   - Confirm no "Cannot find module" errors

3. **Test Layer Association Persistence (Property 3)**
   - Associate Layer to function
   - Retrieve function configuration
   - Verify Layer ARN is present

4. **Test Deployment Idempotency (Property 4)**
   - Run deployment script multiple times
   - Verify final state is identical
   - Check Layer version is consistent

5. **Test Runtime Compatibility (Property 5)**
   - Create Layer with different runtime specifications
   - Verify only compatible runtimes are accepted
   - Confirm Node.js 20.x is supported

### Integration Testing

1. **End-to-End Layer Deployment**
   - Run complete deployment process
   - Verify Layer is created in AWS
   - Confirm Lambda can use the Layer

2. **Lambda Code Review Test**
   - Review lambda-upload-excel-multipart.js
   - Verify require statements are correct
   - Confirm handler function is properly exported
   - Check for any hardcoded paths or incompatibilities

3. **Lambda Execution Test**
   - Invoke Lambda with test Excel file
   - Verify successful execution
   - Check CloudWatch logs for errors
   - Confirm no "Cannot find module" errors

4. **Dependency Usage Test**
   - Test xlsx module functionality
   - Test busboy module functionality
   - Verify both work correctly in Lambda context

5. **Real File Processing Test**
   - Upload actual Excel file via API Gateway
   - Verify file is parsed correctly
   - Confirm data is saved to DynamoDB
   - Check response is HTTP 200 with success message

### Manual Testing

1. **AWS Console Verification**
   - Check Layer appears in Lambda console
   - Verify Layer is associated with function
   - Review Layer configuration details

2. **CloudWatch Logs Review**
   - Monitor logs during Lambda execution
   - Confirm no module errors
   - Verify successful Excel processing

3. **Functional Testing**
   - Upload real Excel file through API
   - Verify data is processed correctly
   - Confirm records are saved to DynamoDB
