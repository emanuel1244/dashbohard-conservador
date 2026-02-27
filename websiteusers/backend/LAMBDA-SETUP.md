# 🚀 Configuración de AWS Lambda para Upload Excel

## 📋 Requisitos

- Cuenta de AWS
- AWS CLI configurado
- Node.js 18.x o superior

## 🔧 Configuración Paso a Paso

### 1. Crear Tabla DynamoDB (Opcional)

```bash
aws dynamodb create-table \
    --table-name PartidoConservadorPersonas \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=cedula,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "[{\"IndexName\": \"CedulaIndex\",\"KeySchema\":[{\"AttributeName\":\"cedula\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5
```

### 2. Preparar el Código Lambda

```bash
cd backend

# Copiar el package.json para Lambda
cp lambda-package.json package.json

# Instalar dependencias
npm install

# Crear el ZIP para Lambda
zip -r lambda-upload-excel.zip lambda-upload-excel-multipart.js node_modules/
```

### 3. Crear Rol IAM para Lambda

Crear archivo `lambda-role-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/PartidoConservadorPersonas"
    }
  ]
}
```

Crear el rol:

```bash
aws iam create-role \
    --role-name PartidoConservadorLambdaRole \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "lambda.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }]
    }'

aws iam put-role-policy \
    --role-name PartidoConservadorLambdaRole \
    --policy-name PartidoConservadorLambdaPolicy \
    --policy-document file://lambda-role-policy.json
```

### 4. Crear la Función Lambda

```bash
aws lambda create-function \
    --function-name upload-excel \
    --runtime nodejs18.x \
    --role arn:aws:iam::TU-ACCOUNT-ID:role/PartidoConservadorLambdaRole \
    --handler lambda-upload-excel-multipart.handler \
    --zip-file fileb://lambda-upload-excel.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment Variables={TABLE_NAME=PartidoConservadorPersonas}
```

### 5. Configurar API Gateway

#### Opción A: Usando la Consola de AWS

1. Ir a API Gateway en AWS Console
2. Crear nueva API REST
3. Crear recurso `/upload-excel`
4. Crear método POST
5. Integrar con Lambda `upload-excel`
6. Habilitar CORS
7. Configurar Binary Media Types: `multipart/form-data`
8. Deploy a stage (ej: `prod`)

#### Opción B: Usando AWS CLI

```bash
# Crear API
API_ID=$(aws apigateway create-rest-api \
    --name "PartidoConservadorAPI" \
    --description "API para Dashboard Partido Conservador" \
    --query 'id' \
    --output text)

# Obtener root resource
ROOT_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --query 'items[0].id' \
    --output text)

# Crear recurso /upload-excel
RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part upload-excel \
    --query 'id' \
    --output text)

# Crear método POST
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE

# Integrar con Lambda
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:TU-ACCOUNT-ID:function:upload-excel/invocations

# Dar permiso a API Gateway para invocar Lambda
aws lambda add-permission \
    --function-name upload-excel \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:TU-ACCOUNT-ID:$API_ID/*/*"

# Deploy
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod
```

### 6. Configurar Binary Media Types

```bash
aws apigateway update-rest-api \
    --rest-api-id $API_ID \
    --patch-operations \
        op=add,path=/binaryMediaTypes/multipart~1form-data
```

### 7. Habilitar CORS

```bash
# Método OPTIONS para CORS
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE

aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}'

aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters \
        method.response.header.Access-Control-Allow-Headers=true,\
        method.response.header.Access-Control-Allow-Methods=true,\
        method.response.header.Access-Control-Allow-Origin=true

aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters \
        method.response.header.Access-Control-Allow-Headers="'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",\
        method.response.header.Access-Control-Allow-Methods="'POST,OPTIONS'",\
        method.response.header.Access-Control-Allow-Origin="'*'"
```

## 🔗 Obtener URL de la API

```bash
echo "https://$API_ID.execute-api.us-east-1.amazonaws.com/prod/upload-excel"
```

## 📝 Actualizar Frontend

Modificar `partido-conservador-dashboard/src/app/components/dashboard/dashboard.component.ts`:

```typescript
private apiUrl = 'https://TU-API-ID.execute-api.us-east-1.amazonaws.com/prod';
```

## 🧪 Probar la Lambda

### Desde AWS Console

1. Ir a Lambda > Functions > upload-excel
2. Click en "Test"
3. Crear evento de prueba con este JSON:

```json
{
  "httpMethod": "POST",
  "headers": {
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
  },
  "body": "BASE64_ENCODED_MULTIPART_DATA",
  "isBase64Encoded": true
}
```

### Desde curl

```bash
curl -X POST \
  https://TU-API-ID.execute-api.us-east-1.amazonaws.com/prod/upload-excel \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@tu-archivo.xlsx'
```

## 🔄 Actualizar Lambda

```bash
# Hacer cambios en el código
# Crear nuevo ZIP
zip -r lambda-upload-excel.zip lambda-upload-excel-multipart.js node_modules/

# Actualizar función
aws lambda update-function-code \
    --function-name upload-excel \
    --zip-file fileb://lambda-upload-excel.zip
```

## 📊 Monitoreo

### Ver Logs

```bash
aws logs tail /aws/lambda/upload-excel --follow
```

### CloudWatch Metrics

```bash
aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Invocations \
    --dimensions Name=FunctionName,Value=upload-excel \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-12-31T23:59:59Z \
    --period 3600 \
    --statistics Sum
```

## 💰 Costos Estimados

- Lambda: $0.20 por 1M requests + $0.0000166667 por GB-segundo
- API Gateway: $3.50 por millón de requests
- DynamoDB: $0.25 por GB almacenado + $1.25 por millón de writes

**Ejemplo:** 10,000 uploads/mes = ~$0.50/mes

## 🔒 Seguridad

### Agregar API Key

```bash
# Crear API Key
API_KEY=$(aws apigateway create-api-key \
    --name PartidoConservadorAPIKey \
    --enabled \
    --query 'id' \
    --output text)

# Crear Usage Plan
PLAN_ID=$(aws apigateway create-usage-plan \
    --name PartidoConservadorPlan \
    --throttle burstLimit=100,rateLimit=50 \
    --quota limit=10000,period=MONTH \
    --query 'id' \
    --output text)

# Asociar API Key con Usage Plan
aws apigateway create-usage-plan-key \
    --usage-plan-id $PLAN_ID \
    --key-id $API_KEY \
    --key-type API_KEY
```

### Usar en Frontend

```typescript
this.http.post<any>(`${this.apiUrl}/upload-excel`, formData, {
  headers: {
    'x-api-key': 'TU-API-KEY'
  }
}).subscribe(...);
```

## 🐛 Troubleshooting

### Error: "Execution failed due to configuration error: Malformed Lambda proxy response"

Asegúrate de que la Lambda retorne el formato correcto:
```javascript
return {
    statusCode: 200,
    headers: { ... },
    body: JSON.stringify({ ... })
};
```

### Error: "Missing Authentication Token"

Verifica que la URL sea correcta y que el método esté configurado.

### Error: "CORS policy"

Asegúrate de haber configurado CORS correctamente en API Gateway.

### Error: "Request Entity Too Large"

Aumenta el límite de payload en API Gateway (máximo 10MB).

---

**¡Lambda configurado y listo! 🚀**
