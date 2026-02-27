# 🚀 Guía de Deployment - Dashboard Partido Conservador

## 📋 Opciones de Deployment

### 1. Heroku (Recomendado para empezar)
### 2. DigitalOcean
### 3. AWS (Amazon Web Services)
### 4. Azure
### 5. Servidor Propio (VPS)

---

## 🌐 Opción 1: Heroku (Gratis/Fácil)

### Requisitos:
- Cuenta en Heroku (gratis)
- Git instalado
- Heroku CLI instalado

### Pasos:

#### 1. Instalar Heroku CLI
```bash
# Descargar de: https://devcenter.heroku.com/articles/heroku-cli
```

#### 2. Login en Heroku
```bash
heroku login
```

#### 3. Preparar Backend para Heroku

Crear `backend/Procfile`:
```
web: node server.js
```

Modificar `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

#### 4. Crear app en Heroku (Backend)
```bash
cd backend
git init
heroku create partido-conservador-api
git add .
git commit -m "Initial commit"
git push heroku main
```

#### 5. Preparar Frontend

Modificar `partido-conservador-dashboard/src/app/components/dashboard/dashboard.component.ts`:
```typescript
private apiUrl = 'https://partido-conservador-api.herokuapp.com/api';
```

#### 6. Build del Frontend
```bash
cd partido-conservador-dashboard
npm run build
```

#### 7. Deploy Frontend en Netlify/Vercel

**Netlify:**
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
cd partido-conservador-dashboard
netlify deploy --prod --dir=dist/partido-conservador-dashboard/browser
```

**Vercel:**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd partido-conservador-dashboard
vercel --prod
```

---

## 💧 Opción 2: DigitalOcean (Recomendado)

### Costo: $5-10 USD/mes

### Pasos:

#### 1. Crear Droplet
- Ir a DigitalOcean
- Crear nuevo Droplet
- Seleccionar Ubuntu 22.04
- Plan básico ($5/mes)

#### 2. Conectar por SSH
```bash
ssh root@tu-ip-del-droplet
```

#### 3. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 4. Instalar Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### 5. Subir Proyecto
```bash
# En tu computadora
scp -r backend root@tu-ip:/var/www/
scp -r partido-conservador-dashboard/dist root@tu-ip:/var/www/
```

#### 6. Configurar Nginx

Crear `/etc/nginx/sites-available/partido-conservador`:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /var/www/dist/partido-conservador-dashboard/browser;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 7. Activar sitio
```bash
sudo ln -s /etc/nginx/sites-available/partido-conservador /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Instalar PM2 (Process Manager)
```bash
sudo npm install -g pm2
cd /var/www/backend
pm2 start server.js --name partido-conservador-api
pm2 startup
pm2 save
```

#### 9. Configurar SSL (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## ☁️ Opción 3: AWS (Profesional)

### Servicios a usar:
- EC2 (Servidor)
- RDS (Base de datos)
- S3 (Archivos estáticos)
- CloudFront (CDN)

### Pasos Básicos:

#### 1. Crear instancia EC2
- Tipo: t2.micro (gratis primer año)
- OS: Ubuntu 22.04
- Configurar Security Groups (puertos 80, 443, 22)

#### 2. Conectar y configurar
```bash
ssh -i tu-key.pem ubuntu@tu-ip-ec2
```

#### 3. Instalar dependencias
```bash
sudo apt update
sudo apt install nodejs npm nginx
```

#### 4. Configurar igual que DigitalOcean
(Ver pasos 5-9 de DigitalOcean)

#### 5. Configurar RDS (Opcional)
- Crear instancia PostgreSQL/MySQL
- Conectar desde backend

---

## 🔧 Opción 4: Servidor Propio (VPS)

### Requisitos:
- Servidor con Ubuntu/Debian
- Acceso root
- IP pública
- Dominio (opcional)

### Pasos:

#### 1. Preparar servidor
```bash
sudo apt update
sudo apt upgrade
```

#### 2. Instalar Node.js 22
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. Instalar Nginx
```bash
sudo apt install nginx
```

#### 4. Configurar firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### 5. Subir archivos
```bash
# Usar FileZilla, WinSCP o SCP
scp -r backend usuario@servidor:/var/www/
scp -r partido-conservador-dashboard/dist usuario@servidor:/var/www/
```

#### 6. Configurar Nginx
(Ver configuración en Opción 2, paso 6)

#### 7. Instalar PM2
```bash
sudo npm install -g pm2
cd /var/www/backend
pm2 start server.js
pm2 startup
pm2 save
```

---

## 🗄️ Base de Datos en Producción

### MongoDB Atlas (Recomendado)

#### 1. Crear cuenta en MongoDB Atlas
- Ir a mongodb.com/cloud/atlas
- Crear cluster gratuito

#### 2. Obtener connection string
```
mongodb+srv://usuario:password@cluster.mongodb.net/partido-conservador
```

#### 3. Instalar Mongoose en backend
```bash
cd backend
npm install mongoose
```

#### 4. Modificar server.js
```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'tu-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Crear modelos
const PersonaSchema = new mongoose.Schema({
  nombre: String,
  cedula: String,
  // ... otros campos
});

const Persona = mongoose.model('Persona', PersonaSchema);
```

### PostgreSQL

#### 1. Instalar en servidor
```bash
sudo apt install postgresql postgresql-contrib
```

#### 2. Crear base de datos
```bash
sudo -u postgres psql
CREATE DATABASE partido_conservador;
CREATE USER admin WITH PASSWORD 'tu-password';
GRANT ALL PRIVILEGES ON DATABASE partido_conservador TO admin;
```

#### 3. Instalar pg en backend
```bash
cd backend
npm install pg sequelize
```

---

## 🔒 Seguridad en Producción

### 1. Variables de Entorno

Crear `backend/.env`:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=tu-url-de-base-de-datos
JWT_SECRET=tu-secreto-super-seguro
```

Instalar dotenv:
```bash
npm install dotenv
```

Usar en server.js:
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

### 2. CORS en Producción

Modificar backend/server.js:
```javascript
const cors = require('cors');

const corsOptions = {
  origin: 'https://tu-dominio.com',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 3. Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests
});

app.use('/api/', limiter);
```

### 4. Helmet (Seguridad HTTP)

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 📊 Monitoreo

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 status
```

### Logs de Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 Actualizar Aplicación

### Backend
```bash
cd /var/www/backend
git pull origin main
npm install
pm2 restart partido-conservador-api
```

### Frontend
```bash
# En tu computadora
cd partido-conservador-dashboard
npm run build

# Subir al servidor
scp -r dist/* usuario@servidor:/var/www/dist/
```

---

## 💰 Costos Estimados

### Opción Económica (Heroku + Netlify)
- Backend: $0 - $7/mes
- Frontend: $0
- Base de datos: $0 (MongoDB Atlas free)
- **Total: $0 - $7/mes**

### Opción Recomendada (DigitalOcean)
- Droplet: $5/mes
- Dominio: $10-15/año
- SSL: Gratis (Let's Encrypt)
- **Total: ~$6/mes**

### Opción Profesional (AWS)
- EC2: $10-20/mes
- RDS: $15-30/mes
- S3: $1-5/mes
- CloudFront: $5-10/mes
- **Total: $30-65/mes**

---

## 🎯 Checklist de Deployment

- [ ] Backend funcionando en producción
- [ ] Frontend funcionando en producción
- [ ] Base de datos configurada
- [ ] SSL/HTTPS configurado
- [ ] Dominio apuntando correctamente
- [ ] Variables de entorno configuradas
- [ ] CORS configurado
- [ ] Rate limiting activado
- [ ] PM2 configurado
- [ ] Backups automáticos
- [ ] Monitoreo activo
- [ ] Logs configurados

---

## 📞 Soporte de Deployment

Si necesitas ayuda con el deployment:
- 📧 Email: soporte@partidoconservador.com
- 📱 WhatsApp: +57 300 123 4567

---

## 🎉 ¡Listo para Producción!

Una vez completados estos pasos, tu aplicación estará:
- ✅ Accesible desde internet
- ✅ Segura con HTTPS
- ✅ Escalable
- ✅ Monitoreada
- ✅ Lista para usuarios reales

**¡Éxito con tu deployment! 🚀🇨🇴**
