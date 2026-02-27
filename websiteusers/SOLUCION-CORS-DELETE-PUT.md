# Solución CORS Completa para Todos los Servicios

## Problema Original
Errores CORS en TODAS las operaciones:
- GET /api/lideres - 502 Bad Gateway sin headers CORS
- POST /api/lideres - 502 Bad Gateway sin headers CORS  
- PUT /api/lideres/{id} - Sin headers CORS en preflight
- DELETE /api/lideres/{id} - Sin headers CORS en preflight

## Causa Raíz
Las funciones Lambda NO estaban manejando las peticiones OPTIONS (preflight CORS) que el navegador envía antes de cualquier petición cross-origin, especialmente para métodos como PUT, DELETE y POST.

## Solución Aplicada

### 1. Actualización de lambda-lideres.js
Se agregó manejo de preflight OPTIONS en TODAS las funciones:

#### getAll (GET):
```javascript
if (event.httpMethod === 'OPTIONS') {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: ''
    };
}
```

#### create (POST):
```javascript
if (event.httpMethod === 'OPTIONS') {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: ''
    };
}
```

#### update (PUT):
```javascript
if (event.httpMethod === 'OPTIONS') {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS'
        },
        body: ''
    };
}
```

#### delete (DELETE):
```javascript
if (event.httpMethod === 'OPTIONS') {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
        },
        body: ''
    };
}
```

### 2. Actualización de lambda-personas.js
Se agregó manejo de preflight OPTIONS en:
- getAll (GET)
- getEstadisticas (GET)

### 3. Headers CORS Completos
Todos los responses ahora incluyen:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type`
- `Access-Control-Allow-Methods: [método específico], OPTIONS`

### 4. Lambdas Actualizadas en AWS
✅ partido-conservador-getPersonas
✅ partido-conservador-getEstadisticas
✅ partido-conservador-getLideres
✅ partido-conservador-createLider
✅ partido-conservador-updateLider
✅ partido-conservador-deleteLider

## Cómo Probar

1. Abre tu aplicación en `http://localhost:4200`
2. Prueba TODAS las operaciones:
   - Ver lista de líderes (GET)
   - Crear nuevo líder (POST)
   - Editar líder existente (PUT)
   - Eliminar líder (DELETE)
3. Verifica que NO haya errores CORS en la consola del navegador

## Scripts Disponibles

### Actualizar todas las Lambdas:
```bash
cd backend
actualizar-todas-lambdas.bat
```

### Actualizar solo Lambdas de líderes:
```bash
cd backend
actualizar-lambda-lideres.bat
```

## Estado Final
✅ CORS configurado correctamente en TODAS las funciones Lambda
✅ Manejo de preflight OPTIONS implementado
✅ Headers CORS completos en todas las respuestas
✅ 6 funciones Lambda actualizadas en AWS
✅ Listo para usar desde http://localhost:4200

## Notas Técnicas
- El navegador envía una petición OPTIONS antes de PUT, DELETE y POST
- Esta petición "preflight" verifica si el servidor permite CORS
- Si la Lambda no responde correctamente al OPTIONS, el navegador bloquea la petición real
- Ahora todas las Lambdas manejan OPTIONS correctamente y devuelven los headers necesarios
