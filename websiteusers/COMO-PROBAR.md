# 🧪 Cómo Probar la Aplicación

## ✅ Estado Actual:

- ✅ Backend en AWS Lambda (us-west-2)
- ✅ API Gateway configurado
- ✅ Frontend listo para iniciar
- ✅ URL actualizada en el código
- ✅ **Lambda actualizada con detección automática de columnas**

---

## 🌐 URL de la API:

```
https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api
```

---

## 📝 Pasos para Probar:

### 1. Espera a que compile el frontend

Verás un mensaje como:
```
✔ Browser application bundle generation complete.
✔ Built partido-conservador-dashboard

Application bundle generation complete. [X.XXXs]

Watch mode enabled. Watching for file changes...
  ➜  Local:   http://localhost:4200/
```

### 2. Abre tu navegador

Ve a: **http://localhost:4200**

### 3. Verifica el Dashboard

Deberías ver:
- ✅ Header con logo del Partido Conservador
- ✅ Navegación (Dashboard, Personas, Líderes)
- ✅ Tarjetas de estadísticas
- ✅ Sección de carga de Excel

### 4. Prueba Subir un Excel

1. Click en "Seleccionar archivo Excel"
2. Elige un archivo .xlsx con el formato correcto
3. Click en "⬆️ Subir Archivo"
4. Espera el procesamiento
5. Verás mensaje de éxito con estadísticas

### 5. Verifica en DynamoDB

Ve a AWS Console:
https://us-west-2.console.aws.amazon.com/dynamodbv2/home?region=us-west-2#tables

Busca la tabla: `PartidoConservadorPersonas`

---

## 📊 Formato del Excel:

Tu archivo Excel debe tener estas columnas (el sistema detecta automáticamente variaciones):

### Columnas Requeridas:
- **Nombre**: `NOMBRE Y APELLIDOS`, `Nombre y Apellidos`, `nombre`, `Nombre`, `NOMBRE`
- **Cédula**: `Cedula`, `Cédula`, `cedula`, `CEDULA`, `CC`, `Documento`

### Columnas Opcionales:
- **Lugar de Votación**: `LUGAR DE VOTACION`, `Lugar de Votacion`, `lugarVotacion`
- **Dirección Votación**: `DIRECCION L VOTACION`, `Direccion L Votacion`, `direccionVotacion`
- **Mesa**: `MESA`, `Mesa`, `mesa`, `Puesto`
- **Dirección**: `DIRECCION`, `Direccion`, `direccion`, `Dirección`
- **Correo**: `Correo`, `correo`, `Email`, `email`, `E-mail`
- **Celular**: `Celular`, `celular`, `Telefono`, `Teléfono`, `Movil`

### Ejemplo:

| NOMBRE Y APELLIDOS | Cedula | LUGAR DE VOTACION | DIRECCION L VOTACION | MESA | DIRECCION | Correo | Celular |
|-------------------|--------|-------------------|---------------------|------|-----------|--------|---------|
| Emanuel Camargo   | 22047777 | IE MARIA AUX    | Cl. 11 #13-74      | 4    | Calle 9   | email@example.com  | 3045664700 |

**Nota:** El sistema ahora es flexible y detecta automáticamente las columnas aunque tengan nombres ligeramente diferentes.

---

## 🔍 Verificar que Funciona:

### Test 1: Ver Estadísticas
1. Abre http://localhost:4200
2. Deberías ver las tarjetas con números (inicialmente en 0)

### Test 2: Subir Excel
1. Prepara un archivo Excel con el formato correcto
2. Súbelo desde el dashboard
3. Verifica que aparezca mensaje de éxito
4. Las estadísticas deberían actualizarse

### Test 3: Ver Personas
1. Click en "👥 Personas"
2. Deberías ver la tabla con las personas cargadas
3. Prueba el buscador

### Test 4: Gestionar Líderes
1. Click en "⭐ Líderes"
2. Click en "➕ Agregar Líder"
3. Llena el formulario
4. Guarda
5. Verifica que aparezca en la lista

---

## 🐛 Si algo no funciona:

### Error de CORS:
Abre la consola del navegador (F12) y verifica si hay errores de CORS.

**Solución:** El CORS ya está configurado en API Gateway.

### Error 403 o 401:
Verifica que las funciones Lambda tengan permisos para invocar.

**Solución:** Los permisos ya están configurados.

### Error 500:
Revisa los logs de Lambda:
```bash
aws logs tail /aws/lambda/partido-conservador-uploadExcel --follow --region us-west-2
```

### No se guardan los datos:
Verifica que las tablas DynamoDB existan:
```bash
aws dynamodb list-tables --region us-west-2
```

---

## 📱 Probar desde Postman:

### Upload Excel:
```
POST https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/upload-excel
Content-Type: multipart/form-data
Body: file (selecciona tu Excel)
```

### Get Personas:
```
GET https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/personas
```

### Get Estadísticas:
```
GET https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/estadisticas
```

---

## 🎯 Checklist de Pruebas:

- [ ] Frontend abre en http://localhost:4200
- [ ] Dashboard muestra estadísticas
- [ ] Puedo subir un archivo Excel
- [ ] Se procesan los datos correctamente
- [ ] Aparece mensaje de éxito
- [ ] Puedo ver las personas en la tabla
- [ ] El buscador funciona
- [ ] Puedo crear un líder
- [ ] Puedo editar un líder
- [ ] Puedo eliminar un líder
- [ ] Los datos persisten en DynamoDB

---

## 🎉 Si Todo Funciona:

¡Felicidades! Tu aplicación está completamente funcional en AWS Lambda.

Ahora puedes:
1. Compartir la URL con tu equipo
2. Configurar un dominio personalizado
3. Agregar más funcionalidades
4. Escalar según necesites

---

## 📞 Comandos Útiles:

### Ver logs en tiempo real:
```bash
aws logs tail /aws/lambda/partido-conservador-uploadExcel --follow --region us-west-2
```

### Listar funciones Lambda:
```bash
aws lambda list-functions --region us-west-2 --query "Functions[?contains(FunctionName, 'partido')].FunctionName"
```

### Ver tablas DynamoDB:
```bash
aws dynamodb list-tables --region us-west-2
```

### Escanear tabla de personas:
```bash
aws dynamodb scan --table-name PartidoConservadorPersonas --region us-west-2
```

---

**¡Éxito con tu aplicación! 🚀🇨🇴**
