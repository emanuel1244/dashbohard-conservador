# ✅ Funcionalidad: Asignación Automática de Personas a Líder

## 🎯 Funcionalidad Implementada

Cuando subes un archivo Excel, el sistema ahora:

1. **Lee el nombre del líder** de la primera fila del Excel
2. **Busca el líder** en la base de datos por nombre
3. **Crea el líder** si no existe
4. **Asigna todas las personas** del Excel a ese líder
5. **Actualiza el contador** de personas asignadas del líder
6. **Muestra la información** del líder en el mensaje de éxito

---

## 📊 Estructura del Excel

Tu Excel debe tener esta estructura:

```
Fila 1: [vacío] [vacío] [LIDER] [Emanuel Camargo Quintero] ...
Fila 2-3: [vacías]
Fila 4: [#] [NOMBRE Y APELLIDOS] [CEDULA] [LUGAR DE VOTACION] ...
Fila 5+: [datos de personas]
```

El sistema detecta automáticamente:
- **Columna "LIDER"** en la fila 1
- **Nombre del líder** en la siguiente celda
- **Headers** buscando "NOMBRE Y APELLIDOS" y "CEDULA"
- **Datos** desde la fila siguiente a los headers

---

## 🔄 Flujo de Procesamiento

### 1. Detección del Líder
```javascript
// Busca "LIDER" en la primera fila
const liderIndex = primeraFila.findIndex(cell => 
    cell && String(cell).toUpperCase().includes('LIDER')
);
// Obtiene el nombre del líder de la siguiente celda
nombreLider = String(primeraFila[liderIndex + 1]).trim();
```

### 2. Búsqueda o Creación del Líder
```javascript
// Busca el líder por nombre en DynamoDB
const lideresResult = await dynamodb.scan({
    TableName: LIDERES_TABLE,
    FilterExpression: 'contains(#nombre, :nombreLider)',
    ...
});

// Si no existe, lo crea
if (!liderEncontrado) {
    liderInfo = {
        id: `lider-${Date.now()}`,
        nombre: nombreLider,
        personasAsignadas: 0,
        ...
    };
}
```

### 3. Asignación de Personas
```javascript
// Cada persona se guarda con el ID y nombre del líder
const persona = {
    ...
    liderId: liderInfo.id,
    liderNombre: liderInfo.nombre,
    ...
};
```

### 4. Actualización del Contador
```javascript
// Actualiza el contador de personas asignadas
await dynamodb.update({
    TableName: LIDERES_TABLE,
    Key: { id: liderInfo.id },
    UpdateExpression: 'SET personasAsignadas = :contador',
    ExpressionAttributeValues: {
        ':contador': nuevoContador
    }
});
```

---

## 📝 Estructura de Datos

### Persona (con líder asignado)
```json
{
  "id": "1708718400000-0",
  "nombre": "Irina Yaneth Sobrino Diaz",
  "cedula": "1047225702",
  "lugarVotacion": "IE MARIA AUXIOLADORA PPAL",
  "mesa": "18",
  "liderId": "lider-1708718400000",
  "liderNombre": "Emanuel Camargo Quintero",
  "fechaCreacion": "2026-02-23T21:50:00.000Z"
}
```

### Líder (con contador actualizado)
```json
{
  "id": "lider-1708718400000",
  "nombre": "Emanuel Camargo Quintero",
  "cedula": "22047777",
  "celular": "3045664700",
  "correo": "ecamargo@example.com",
  "zona": "maria auxiliadora",
  "personasAsignadas": 20,
  "fechaCreacion": "2026-02-23T21:50:00.000Z"
}
```

---

## 🎨 Mensaje de Éxito en el Frontend

Después de subir el Excel, verás:

```
✓ 20 personas agregadas.
✓ Asignadas al líder: Emanuel Camargo Quintero
✓ Total de personas del líder: 20
```

Si hay duplicados o errores:
```
✓ 18 personas agregadas.
✓ Asignadas al líder: Emanuel Camargo Quintero
✓ Total de personas del líder: 38
⚠ 2 duplicados encontrados.
```

---

## 🧪 Cómo Probar

### 1. Sube tu Excel
- Ve a http://localhost:4200
- Click en "📤 Cargar Excel"
- Selecciona `LISTADO (1).xlsx`
- Click en "⬆️ Subir Archivo"

### 2. Verifica el mensaje
Deberías ver:
```
✓ 20 personas agregadas.
✓ Asignadas al líder: Emanuel Camargo Quintero
✓ Total de personas del líder: 20
```

### 3. Ve a la sección de Líderes
- Click en "⭐ Líderes"
- Busca "Emanuel Camargo Quintero"
- Verás que tiene 20 personas asignadas

### 4. Ve a la sección de Personas
- Click en "👥 Personas"
- Verás las 20 personas
- Cada una tiene asignado el líder "Emanuel Camargo Quintero"

---

## 🔍 Verificar en DynamoDB

### Tabla de Personas
```bash
aws dynamodb scan --table-name PartidoConservadorPersonas --region us-west-2 --max-items 1
```

Verás que cada persona tiene:
```json
{
  "liderId": "lider-1708718400000",
  "liderNombre": "Emanuel Camargo Quintero"
}
```

### Tabla de Líderes
```bash
aws dynamodb scan --table-name PartidoConservadorPersonasLideres --region us-west-2
```

Verás el líder con:
```json
{
  "nombre": "Emanuel Camargo Quintero",
  "personasAsignadas": 20
}
```

---

## 📋 Logs de Lambda

Para ver el procesamiento en tiempo real:

```bash
aws logs tail /aws/lambda/partido-conservador-uploadExcel --region us-west-2 --follow
```

Verás:
```
Líder detectado: Emanuel Camargo Quintero
Líder encontrado: lider-1708718400000
Guardadas 20 personas en DynamoDB
Actualizado contador del líder Emanuel Camargo Quintero: 20 personas
```

---

## ✅ Ventajas de Esta Implementación

1. **Automática**: No necesitas asignar manualmente las personas al líder
2. **Inteligente**: Busca el líder por nombre, no necesitas el ID
3. **Flexible**: Si el líder no existe, lo crea automáticamente
4. **Precisa**: Actualiza el contador exacto de personas asignadas
5. **Informativa**: Muestra toda la información en el mensaje de éxito

---

## 🎯 Casos de Uso

### Caso 1: Líder Nuevo
- Subes Excel con "LIDER: Juan Pérez"
- Sistema crea el líder "Juan Pérez"
- Asigna las 15 personas del Excel
- Contador: 15 personas

### Caso 2: Líder Existente
- Ya existe "Emanuel Camargo" con 20 personas
- Subes nuevo Excel con "LIDER: Emanuel Camargo"
- Sistema encuentra el líder existente
- Asigna las 10 nuevas personas
- Contador actualizado: 30 personas

### Caso 3: Sin Líder en Excel
- Subes Excel sin la columna "LIDER"
- Sistema procesa las personas normalmente
- No asigna líder (liderId = null)
- Puedes asignar manualmente después

---

**Fecha de implementación:** 23 de febrero de 2026, 4:55 PM
**Lambda actualizada:** partido-conservador-uploadExcel
**Frontend actualizado:** dashboard.component.ts
**Estado:** ✅ Funcionando correctamente
