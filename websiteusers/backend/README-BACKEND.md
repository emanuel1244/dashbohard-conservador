# 🔧 Backend - Partido Conservador Dashboard

## 📁 Archivos Principales

### Funciones Lambda:
- `lambda-upload-excel-multipart.js` - Procesa archivos Excel
- `lambda-personas.js` - CRUD de personas
- `lambda-lideres.js` - CRUD de líderes

### Configuración:
- `serverless.yml` - Configuración de Serverless Framework
- `package.json` - Dependencias del proyecto

### Scripts:
- `deploy-lambda.bat` - Deploy automático a AWS
- `test-local.bat` - Probar localmente con serverless-offline
- `verificar-aws.bat` - Verificar configuración de AWS

### Express (Desarrollo Local):
- `server.js` - Servidor Express para desarrollo local

---

## 🚀 Opciones de Deployment

### Opción 1: AWS Lambda (Producción)

#### Requisitos:
- AWS CLI configurado
- Serverless Framework instalado
- Credenciales de AWS

#### Deploy:
```bash
# Opción A: Script automático
deploy-lambda.bat

# Opción B: Manual
npm install
serverless deploy
```

#### Resultado:
```
endpoints:
  POST - https://xxx.execute-api.us-east-1.amazonaws.com/dev/api/upload-excel
  GET - https://xxx.execute-api.us-east-1.amazonaws.com/dev/api/personas
  ...
```

### Opción 2: Express Local (Desarrollo)

```bash
npm install
npm start
```

Servidor corriendo en: http://localhost:3000

---

## 🧪 Probar Localmente

### Con Serverless Offline:
```bash
test-local.bat
```

Esto inicia un servidor local que simula Lambda en:
http://localhost:3000

### Con Express:
```bash
npm start
```

---

## 📊 Estructura de Datos

### Persona (DynamoDB):
```json
{
  "id": "1234567890-0",
  "nombre": "Emanuel Camargo Quintero",
  "cedula": "22047777",
  "lugarVotacion": "IE MARIA AUXILIADORA SEDE 2",
  "direccionVotacion": "Cl. 11 #13-74",
  "mesa": "4",
  "direccion": "Calle 9 #14-96",
  "correo": "emanuel@mail.com",
  "celular": "3045664700",
  "fechaCreacion": "2024-01-01T00:00:00.000Z"
}
```

### Líder (DynamoDB):
```json
{
  "id": "lider-1234567890",
  "nombre": "Juan Pérez",
  "cedula": "12345678",
  "celular": "3001234567",
  "correo": "juan@mail.com",
  "zona": "Centro",
  "personasAsignadas": 0,
  "fechaCreacion": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔧 Configuración

### Variables de Entorno:

En `serverless.yml`:
```yaml
environment:
  TABLE_NAME: ${self:custom.tableName}
```

En desarrollo local (Express):
```javascript
const PORT = process.env.PORT || 3000;
```

---

## 📝 Endpoints

### Upload Excel
```
POST /api/upload-excel
Content-Type: multipart/form-data
Body: file (Excel file)
```

### Personas
```
GET /api/personas - Obtener todas
GET /api/personas/buscar?q=texto - Buscar
```

### Estadísticas
```
GET /api/estadisticas
```

### Líderes
```
GET /api/lideres - Obtener todos
POST /api/lideres - Crear
PUT /api/lideres/:id - Actualizar
DELETE /api/lideres/:id - Eliminar
```

---

## 🔄 Actualizar Lambda

```bash
# Deploy completo
serverless deploy

# Solo una función
serverless deploy function -f uploadExcel
```

---

## 📊 Monitoreo

### Ver logs:
```bash
serverless logs -f uploadExcel -t
```

### Ver métricas:
```bash
serverless metrics
```

### CloudWatch:
https://console.aws.amazon.com/cloudwatch/

---

## 🗑️ Eliminar Recursos

```bash
serverless remove
```

Esto eliminará:
- Todas las funciones Lambda
- API Gateway
- Tablas DynamoDB
- Roles IAM
- CloudWatch Logs

---

## 💰 Costos

### Tier Gratuito:
- Lambda: 1M requests/mes
- API Gateway: 1M requests/mes
- DynamoDB: 25 GB

### Después:
- Lambda: $0.20 por 1M requests
- API Gateway: $3.50 por 1M requests
- DynamoDB: $0.25 por GB/mes

**Estimado:** $0.50 - $5/mes para uso moderado

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'xlsx'"
```bash
npm install
```

### Error: "AWS credentials not found"
```bash
aws configure
```

### Error: "Table already exists"
```bash
serverless remove
serverless deploy
```

### Error: "Rate exceeded"
Espera unos minutos y vuelve a intentar.

---

## 📚 Documentación

- [Serverless Framework](https://www.serverless.com/framework/docs/)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)

---

**¿Necesitas ayuda? Revisa GUIA-RAPIDA-LAMBDA.md**
