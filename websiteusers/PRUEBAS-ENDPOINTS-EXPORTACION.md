# Pruebas de Endpoints de Exportación

## Endpoints Desplegados

### 1. Exportación a Excel
**URL:** `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel`

### 2. Exportación a PDF
**URL:** `https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf`

## Pruebas con Postman/cURL

### Exportar Personas a Excel

```bash
# Lista completa de personas
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas" -o personas.xlsx

# Personas filtradas por líder
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas&filters={\"liderId\":\"LIDER_ID\"}" -o personas_lider.xlsx

# Personas filtradas por zona
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas&filters={\"zona\":\"ZONA_1\"}" -o personas_zona.xlsx

# Personas filtradas por mesa
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=personas&filters={\"mesa\":\"001\"}" -o personas_mesa.xlsx
```

### Exportar Líderes a Excel

```bash
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/excel?type=lideres" -o lideres.xlsx
```

### Generar Reporte General PDF

```bash
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-general" -o reporte_general.pdf
```

### Generar Reporte de Líder PDF

```bash
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=reporte-lider&filters={\"liderId\":\"LIDER_ID\",\"liderNombre\":\"Juan Perez\"}" -o reporte_lider.pdf
```

### Generar Certificados PDF

```bash
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=certificado&ids=[\"PERSONA_ID_1\",\"PERSONA_ID_2\"]" -o certificados.pdf
```

### Generar Listado de Mesa PDF

```bash
curl "https://t6km5ha4e3.execute-api.us-west-2.amazonaws.com/prod/api/export/pdf?type=listado-mesa&filters={\"mesa\":\"001\"}" -o listado_mesa_001.pdf
```

## Verificaciones

### ✅ Checklist de Pruebas

- [ ] Exportación de personas completa funciona
- [ ] Exportación de personas con filtro por líder funciona
- [ ] Exportación de personas con filtro por zona funciona
- [ ] Exportación de personas con filtro por mesa funciona
- [ ] Exportación de líderes funciona
- [ ] Reporte general PDF funciona
- [ ] Reporte de líder PDF funciona
- [ ] Generación de certificados funciona
- [ ] Listado de mesa PDF funciona
- [ ] CORS está configurado correctamente
- [ ] Binary media types están configurados
- [ ] Los archivos se descargan correctamente
- [ ] Los archivos tienen el formato correcto

## Notas

- Los endpoints están configurados con CORS habilitado
- Los binary media types están configurados para:
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (Excel)
  - `application/pdf` (PDF)
- Timeout configurado: 30 segundos
- Memoria configurada: 512MB

## Próximos Pasos

Una vez verificados los endpoints:
1. Continuar con la tarea 7: Implementar estilos para botones de exportación
2. Continuar con la tarea 8: Checkpoint - Probar exportaciones básicas

## Estado Actual

✅ Lambdas desplegadas exitosamente
✅ Endpoints configurados en API Gateway
✅ CORS configurado
✅ Binary media types configurados
⏳ Pendiente: Pruebas manuales de los endpoints
