# 🧪 GUÍA RÁPIDA DE PRUEBAS - Sistema de Exportación

## 🚀 INICIO RÁPIDO

### 1. Iniciar el Sistema
```bash
cd partido-conservador-dashboard
npm start
```

### 2. Abrir en el Navegador
```
http://localhost:4200
```

---

## ✅ PRUEBAS A REALIZAR

### Prueba 1: Exportar Personas a Excel
**Ubicación:** Vista "Personas" (👥)

1. Haz clic en el botón **"📊 Exportar a Excel"**
2. **Resultado esperado:** Se descarga un archivo `.xlsx`
3. **Verificar:**
   - El archivo se descarga automáticamente
   - El nombre del archivo es descriptivo (ej: `personas-2026-02-25.xlsx`)
   - El archivo se abre correctamente en Excel
   - Tiene encabezados y datos formateados

**Estado:** [ ] ✅ Funciona | [ ] ❌ Error

---

### Prueba 2: Generar Reporte General PDF
**Ubicación:** Vista "Personas" (👥)

1. Haz clic en el botón **"📄 Reporte General PDF"**
2. **Resultado esperado:** Se descarga un archivo `.pdf`
3. **Verificar:**
   - El archivo se descarga automáticamente
   - El nombre del archivo es descriptivo (ej: `reporte-general-2026-02-25.pdf`)
   - El PDF se abre correctamente
   - Tiene logo y diseño del partido

**Estado:** [ ] ✅ Funciona | [ ] ❌ Error

---

### Prueba 3: Exportar Personas de un Líder (Excel)
**Ubicación:** Vista "Líderes" (⭐)

1. Ve a la vista "Líderes"
2. En cualquier tarjeta de líder, haz clic en **"📊 Excel"**
3. **Resultado esperado:** Se descarga un archivo `.xlsx` con las personas del líder
4. **Verificar:**
   - El archivo incluye solo las personas de ese líder
   - El nombre del archivo incluye el nombre del líder

**Estado:** [ ] ✅ Funciona | [ ] ❌ Error

---

### Prueba 4: Generar Reporte de Líder (PDF)
**Ubicación:** Vista "Líderes" (⭐)

1. Ve a la vista "Líderes"
2. En cualquier tarjeta de líder, haz clic en **"📄 PDF"**
3. **Resultado esperado:** Se descarga un archivo `.pdf` con el reporte del líder
4. **Verificar:**
   - El PDF incluye información del líder
   - Muestra estadísticas de sus personas asignadas

**Estado:** [ ] ✅ Funciona | [ ] ❌ Error

---

### Prueba 5: Generar Certificado Individual
**Ubicación:** Vista "Mesas" (🗳️) → Modal de Institución

1. Ve a la vista "Mesas"
2. Haz clic en cualquier institución
3. Se abre un modal con las personas
4. En cualquier persona, haz clic en **"📄 Certificado"**
5. **Resultado esperado:** Se descarga un certificado PDF individual
6. **Verificar:**
   - El certificado tiene el nombre de la persona
   - Tiene diseño oficial del partido

**Estado:** [ ] ✅ Funciona | [ ] ❌ Error

---

### Prueba 6: Generar Listado de Mesa (PDF)
**Ubicación:** Vista "Mesas" (🗳️) → Modal de Institución

1. Ve a la vista "Mesas"
2. Haz clic en cualquier institución
3. En el modal, haz clic en **"📄 Generar Listado PDF"**
4. **Resultado esperado:** Se descarga un listado PDF de la mesa
5. **Verificar:**
   - El listado incluye todas las personas de la institución
   - Está organizado por mesa

**Estado:** [ ] ✅ Funciona | [ ] ❌ Error

---

### Prueba 7: Generar Certificados Múltiples
**Ubicación:** Vista "Mesas" (🗳️) → Modal de Institución

1. Ve a la vista "Mesas"
2. Haz clic en cualquier institución
3. En el modal, haz clic en **"📄 Certificados Múltiples"**
4. **Resultado esperado:** Se descarga un PDF con múltiples certificados
5. **Verificar:**
   - El PDF tiene múltiples páginas (una por persona)
   - Cada página es un certificado individual

**Estado:** [ ] ✅ Funciona | [ ] ❌ Error

---

## 🔍 VERIFICACIONES ADICIONALES

### Notificaciones Toast
- [ ] Aparece un toast de éxito cuando se genera un archivo
- [ ] Aparece un toast de error si algo falla
- [ ] Los toasts se cierran automáticamente después de 3 segundos

### Botones
- [ ] Los botones tienen los iconos correctos (📊 para Excel, 📄 para PDF)
- [ ] Los botones tienen estilos visuales atractivos
- [ ] Los botones muestran estado de carga mientras se genera el archivo

### Consola del Navegador
- [ ] No hay errores en rojo en la consola (F12 → Console)
- [ ] Las peticiones HTTP son exitosas (F12 → Network)

---

## 🐛 SI ALGO FALLA

### 1. Abre la Consola del Navegador
- Presiona **F12**
- Ve a la pestaña **"Console"**
- Busca mensajes de error en rojo

### 2. Verifica las Peticiones HTTP
- En la consola (F12), ve a la pestaña **"Network"**
- Haz clic en el botón que falla
- Busca la petición HTTP
- Verifica:
  - **URL llamada:** ¿Es correcta?
  - **Status Code:** ¿Es 200 o hay error?
  - **Response:** ¿Qué mensaje devuelve?

### 3. Copia el Error Exacto
- Copia el mensaje de error completo
- Copia la URL que se está llamando
- Toma una captura de pantalla

### 4. Verifica los Logs de Lambda (si es necesario)
```bash
# Ver logs de Lambda Excel
aws logs tail /aws/lambda/partido-conservador-export-excel --region us-west-2 --follow

# Ver logs de Lambda PDF
aws logs tail /aws/lambda/partido-conservador-export-pdf --region us-west-2 --follow
```

---

## 📊 RESUMEN DE PRUEBAS

| # | Funcionalidad | Estado | Notas |
|---|---------------|--------|-------|
| 1 | Exportar Personas Excel | [ ] | |
| 2 | Reporte General PDF | [ ] | |
| 3 | Exportar Líder Excel | [ ] | |
| 4 | Reporte Líder PDF | [ ] | |
| 5 | Certificado Individual | [ ] | |
| 6 | Listado Mesa PDF | [ ] | |
| 7 | Certificados Múltiples | [ ] | |

---

## ✅ CHECKLIST ANTES DE PROBAR

- [x] Frontend compilado sin errores
- [x] Dependencia file-saver instalada
- [x] Lambdas desplegadas en AWS
- [x] Endpoints configurados en API Gateway
- [x] CORS configurado
- [ ] Frontend iniciado (`npm start`)
- [ ] Navegador abierto en `http://localhost:4200`
- [ ] Hay datos cargados en el sistema

---

## 🎯 RESULTADO ESPERADO

**Si todas las pruebas pasan:**
✅ El sistema de exportación está funcionando correctamente
✅ Puedes usar todas las funcionalidades de exportación
✅ Los archivos se generan con el formato correcto

**Si alguna prueba falla:**
❌ Reporta el error específico
❌ Incluye capturas de pantalla
❌ Copia los mensajes de error de la consola

---

## 📞 INFORMACIÓN ÚTIL

### URLs de los Endpoints
- **Excel:** `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel`
- **PDF:** `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf`

### Lambdas en AWS
- **Excel:** `partido-conservador-export-excel`
- **PDF:** `partido-conservador-export-pdf`

### Región AWS
- **us-west-2**

---

## 🚀 ¡COMIENZA LAS PRUEBAS!

1. Inicia el frontend: `npm start`
2. Abre el navegador: `http://localhost:4200`
3. Sigue las pruebas en orden
4. Marca cada prueba como ✅ o ❌
5. Reporta los resultados

**¡Buena suerte!** 🎉
