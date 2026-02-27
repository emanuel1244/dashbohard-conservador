# 🚀 Setup Rápido con Serverless Framework

## ⚡ Opción Más Fácil y Rápida

### 1. Instalar Serverless Framework

```bash
npm install -g serverless
```

### 2. Configurar AWS Credentials

```bash
serverless config credentials \
  --provider aws \
  --key TU_ACCESS_KEY \
  --secret TU_SECRET_KEY
```

O configurar con AWS CLI:
```bash
aws configure
```

### 3. Instalar Dependencias

```bash
cd backend
npm install
npm install --save-dev serverless-offline
```

### 4. Deploy a AWS

```bash
serverless deploy
```

¡Eso es todo! 🎉

El comando te dará la URL de tu API:
```
endpoints:
  POST - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/upload-excel
  GET - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/personas
  GET - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/estadisticas
  ...
```

### 5. Actualizar Frontend

Copia la URL base y actualiza en `dashboard.component.ts`:

```typescript
private apiUrl = 'https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api';
```

## 🧪 Probar Localmente

```bash
serverless offline start
```

Esto iniciará un servidor local en `http://localhost:3000`

## 🔄 Actualizar Lambda

```bash
serverless deploy function -f uploadExcel
```

O deploy completo:
```bash
serverless deploy
```

## 📊 Ver Logs

```bash
serverless logs -f uploadExcel -t
```

## 🗑️ Eliminar Todo

```bash
serverless remove
```

## 💰 Costos

Con el tier gratuito de AWS:
- 1M requests gratis/mes
- 400,000 GB-segundos gratis/mes
- DynamoDB: 25 GB gratis

**Costo real: $0 - $5/mes** para uso moderado

## 🎯 Comandos Útiles

```bash
# Ver info del stack
serverless info

# Ver métricas
serverless metrics

# Invocar función
serverless invoke -f uploadExcel --path test-event.json

# Ver logs en tiempo real
serverless logs -f uploadExcel --tail
```

---

**¡Mucho más fácil que configurar todo manualmente! 🚀**
