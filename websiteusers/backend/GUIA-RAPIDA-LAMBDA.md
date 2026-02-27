# 🚀 Guía Rápida: Deploy a AWS Lambda

## ✅ Checklist Pre-Deploy

- [x] Serverless Framework instalado
- [ ] AWS CLI configurado
- [ ] Credenciales de AWS obtenidas
- [ ] Dependencias instaladas

---

## 📝 Paso 1: Obtener Credenciales AWS

### Opción A: Crear Usuario IAM (Recomendado)

1. Ve a https://console.aws.amazon.com/iam/
2. Click en "Users" → "Create user"
3. Nombre: `serverless-deploy`
4. Permisos: Adjunta estas políticas:
   - `AdministratorAccess` (para desarrollo)
   - O políticas específicas: `AWSLambdaFullAccess`, `AmazonAPIGatewayAdministrator`, `AmazonDynamoDBFullAccess`
5. Click en "Security credentials"
6. Click en "Create access key"
7. Selecciona "Command Line Interface (CLI)"
8. Guarda el **Access Key ID** y **Secret Access Key**

### Opción B: Usar Root Account (No recomendado para producción)

1. Ve a https://console.aws.amazon.com/
2. Click en tu nombre → "Security credentials"
3. Scroll a "Access keys"
4. Click "Create access key"
5. Guarda las credenciales

---

## 🔧 Paso 2: Configurar AWS CLI

Abre PowerShell o CMD y ejecuta:

```bash
aws configure
```

Ingresa:
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

### Verificar configuración:

```bash
aws sts get-caller-identity
```

Deberías ver algo como:
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/serverless-deploy"
}
```

---

## 📦 Paso 3: Preparar el Proyecto

```bash
cd backend

# Instalar dependencias
npm install

# Verificar que serverless.yml existe
dir serverless.yml
```

---

## 🚀 Paso 4: Deploy a AWS

### Opción A: Usar el script (Fácil)

```bash
deploy-lambda.bat
```

### Opción B: Manual

```bash
serverless deploy
```

### Salida esperada:

```
Deploying partido-conservador-api to stage dev (us-east-1)

✔ Service deployed to stack partido-conservador-api-dev (112s)

endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/upload-excel
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/personas
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/estadisticas
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/lideres
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/lideres
  PUT - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/lideres/{id}
  DELETE - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/lideres/{id}

functions:
  uploadExcel: partido-conservador-api-dev-uploadExcel (2.1 MB)
  getPersonas: partido-conservador-api-dev-getPersonas (2.1 MB)
  ...
```

---

## 📝 Paso 5: Actualizar Frontend

Copia la URL base (sin el path específico):
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api
```

Actualiza en `partido-conservador-dashboard/src/app/components/dashboard/dashboard.component.ts`:

```typescript
private apiUrl = 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api';
```

---

## 🧪 Paso 6: Probar

### Desde Postman o curl:

```bash
curl -X POST \
  https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/api/upload-excel \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@tu-archivo.xlsx'
```

### Desde el Frontend:

1. Inicia el frontend: `npm start`
2. Ve a http://localhost:4200
3. Sube un archivo Excel
4. Verifica que funcione

---

## 📊 Paso 7: Monitorear

### Ver logs en tiempo real:

```bash
serverless logs -f uploadExcel -t
```

### Ver en AWS Console:

1. Ve a https://console.aws.amazon.com/lambda/
2. Busca `partido-conservador-api-dev-uploadExcel`
3. Click en "Monitor" → "View logs in CloudWatch"

---

## 🔄 Actualizar Lambda

Después de hacer cambios en el código:

```bash
# Deploy completo
serverless deploy

# O solo una función específica (más rápido)
serverless deploy function -f uploadExcel
```

---

## 🗑️ Eliminar Todo (Cleanup)

Si quieres eliminar todos los recursos de AWS:

```bash
serverless remove
```

Esto eliminará:
- Lambda functions
- API Gateway
- DynamoDB tables
- CloudWatch logs
- IAM roles

---

## 💰 Costos Estimados

### Tier Gratuito (12 meses):
- Lambda: 1M requests/mes gratis
- API Gateway: 1M requests/mes gratis
- DynamoDB: 25 GB gratis

### Después del tier gratuito:
- Lambda: $0.20 por 1M requests
- API Gateway: $3.50 por 1M requests
- DynamoDB: $0.25 por GB/mes

**Ejemplo:** 10,000 uploads/mes = ~$0.50/mes

---

## 🐛 Troubleshooting

### Error: "AWS credentials not found"

```bash
aws configure
# Ingresa tus credenciales nuevamente
```

### Error: "User is not authorized to perform: lambda:CreateFunction"

Tu usuario IAM necesita más permisos. Adjunta la política `AdministratorAccess` o las políticas específicas mencionadas arriba.

### Error: "Rate exceeded"

Espera unos minutos y vuelve a intentar. AWS tiene límites de rate.

### Error: "Stack already exists"

```bash
serverless remove
serverless deploy
```

### Error: "Cannot find module 'xlsx'"

```bash
cd backend
npm install
serverless deploy
```

---

## 📞 Comandos Útiles

```bash
# Ver información del stack
serverless info

# Ver logs
serverless logs -f uploadExcel -t

# Invocar función localmente
serverless invoke local -f uploadExcel -p test-event.json

# Ver métricas
serverless metrics

# Listar funciones
serverless deploy list

# Rollback a versión anterior
serverless rollback -t TIMESTAMP
```

---

## ✅ Checklist Post-Deploy

- [ ] Lambda desplegada correctamente
- [ ] URL de API Gateway obtenida
- [ ] Frontend actualizado con nueva URL
- [ ] Probado upload de Excel
- [ ] Verificado en DynamoDB que se guardan datos
- [ ] Logs funcionando
- [ ] CORS configurado correctamente

---

## 🎉 ¡Listo!

Tu aplicación ahora está corriendo en AWS Lambda con:
- ✅ Auto-escalado
- ✅ Alta disponibilidad
- ✅ Pago por uso
- ✅ Datos persistentes en DynamoDB
- ✅ Monitoreo con CloudWatch

---

## 📚 Recursos Adicionales

- [Documentación Serverless](https://www.serverless.com/framework/docs/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Docs](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway Docs](https://docs.aws.amazon.com/apigateway/)

---

**¿Necesitas ayuda? Revisa los logs con `serverless logs -f uploadExcel -t`**
