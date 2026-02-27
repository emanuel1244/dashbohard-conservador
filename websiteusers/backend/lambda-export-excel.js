// Lambda function for Excel export
// Handles: /api/export/excel

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const ExcelJS = require('exceljs');

const client = new DynamoDBClient({ region: 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const PERSONAS_TABLE = 'PartidoConservadorPersonas';
const LIDERES_TABLE = 'PartidoConservadorPersonasLideres';

// Colores del partido
const COLORS = {
  primary: '003DA5',    // Azul
  secondary: 'FFD700',  // Dorado
  headerBg: '003DA5',
  headerText: 'FFFFFF'
};

/**
 * Parse query parameters from API Gateway event
 */
function parseQueryParams(event) {
  const params = event.queryStringParameters || {};
  
  let filters = {};
  if (params.filters) {
    try {
      filters = JSON.parse(params.filters);
    } catch (e) {
      console.error('Error parsing filters:', e);
    }
  }
  
  return {
    type: params.type || 'personas',
    filters: filters
  };
}

/**
 * Query data from DynamoDB with filters
 */
async function queryData(type, filters) {
  const tableName = type === 'lideres' ? LIDERES_TABLE : PERSONAS_TABLE;
  
  const params = {
    TableName: tableName
  };
  
  const result = await docClient.send(new ScanCommand(params));
  let items = result.Items || [];
  
  // Apply filters
  if (type === 'personas') {
    items = applyPersonasFilters(items, filters);
  }
  
  return items;
}

/**
 * Apply filters to personas data
 */
function applyPersonasFilters(items, filters) {
  let filtered = items;
  
  // Filter by liderId (ignore empty strings)
  if (filters.liderId && filters.liderId.trim() !== '') {
    filtered = filtered.filter(p => p.liderId === filters.liderId);
  }
  
  // Filter by zona (ignore empty strings)
  if (filters.zona && filters.zona.trim() !== '') {
    filtered = filtered.filter(p => p.zona === filters.zona);
  }
  
  // Filter by mesa (ignore empty strings)
  if (filters.mesa && filters.mesa.trim() !== '') {
    filtered = filtered.filter(p => p.mesa === filters.mesa);
  }
  
  // Filter by estado (ignore empty strings)
  if (filters.estado && filters.estado.trim() !== '') {
    filtered = filtered.filter(p => p.estado === filters.estado);
  }
  
  // Filter by nivelCompromiso (ignore empty strings)
  if (filters.nivelCompromiso && filters.nivelCompromiso.trim() !== '') {
    filtered = filtered.filter(p => p.nivelCompromiso === filters.nivelCompromiso);
  }
  
  // Filter by search text (ignore empty strings)
  if (filters.busqueda && filters.busqueda.trim() !== '') {
    const searchLower = filters.busqueda.toLowerCase();
    filtered = filtered.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(searchLower)) ||
      (p.cedula && p.cedula.includes(searchLower)) ||
      (p.celular && p.celular.includes(searchLower)) ||
      (p.correo && p.correo.toLowerCase().includes(searchLower))
    );
  }
  
  return filtered;
}

/**
 * Generate filename based on type and filters
 */
function generateFilename(type, filters) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
  
  if (type === 'lideres') {
    return `lideres_${timestamp}.xlsx`;
  }
  
  // Personas export
  if (filters.liderId && filters.liderNombre) {
    const liderName = filters.liderNombre.replace(/\s+/g, '_');
    return `personas_lider_${liderName}_${timestamp}.xlsx`;
  }
  
  if (filters.zona) {
    return `personas_zona_${filters.zona}_${timestamp}.xlsx`;
  }
  
  if (filters.mesa) {
    return `personas_mesa_${filters.mesa}_${timestamp}.xlsx`;
  }
  
  return `personas_completo_${timestamp}.xlsx`;
}

/**
 * Generate Excel for personas
 */
async function generateExcelPersonas(personas, filters, lideres) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Personas');
  
  // Define columns
  worksheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'Cédula', key: 'cedula', width: 15 },
    { header: 'Celular', key: 'celular', width: 15 },
    { header: 'Correo', key: 'correo', width: 30 },
    { header: 'Dirección', key: 'direccion', width: 35 },
    { header: 'Mesa', key: 'mesa', width: 10 },
    { header: 'Lugar de Votación', key: 'lugarVotacion', width: 30 },
    { header: 'Dirección de Votación', key: 'direccionVotacion', width: 35 },
    { header: 'Zona', key: 'zona', width: 15 },
    { header: 'Líder Asignado', key: 'liderNombre', width: 30 },
    { header: 'Estado', key: 'estado', width: 12 },
    { header: 'Nivel de Compromiso', key: 'nivelCompromiso', width: 18 },
    { header: 'Notas', key: 'notas', width: 40 }
  ];
  
  // Create lider lookup map
  const liderMap = {};
  if (lideres) {
    lideres.forEach(lider => {
      liderMap[lider.id] = lider.nombre;
    });
  }
  
  // Add data rows
  personas.forEach(persona => {
    worksheet.addRow({
      nombre: persona.nombre || '',
      cedula: persona.cedula || '',
      celular: persona.celular || '',
      correo: persona.correo || '',
      direccion: persona.direccion || '',
      mesa: persona.mesa || '',
      lugarVotacion: persona.lugarVotacion || '',
      direccionVotacion: persona.direccionVotacion || '',
      zona: persona.zona || '',
      liderNombre: persona.liderId ? liderMap[persona.liderId] || '' : '',
      estado: persona.estado || '',
      nivelCompromiso: persona.nivelCompromiso || '',
      notas: persona.notas || ''
    });
  });
  
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.headerBg }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;
  
  // Add auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: 'M1'
  };
  
  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
  
  // If filtered by lider, add statistics sheet
  if (filters.liderId) {
    await addLiderStatsSheet(workbook, personas, filters);
  }
  
  return workbook;
}

/**
 * Add statistics sheet for lider
 */
async function addLiderStatsSheet(workbook, personas, filters) {
  const statsSheet = workbook.addWorksheet('Estadísticas del Líder');
  
  // Calculate statistics
  const totalPersonas = personas.length;
  const personasActivas = personas.filter(p => p.estado === 'Activo').length;
  const personasAltoCompromiso = personas.filter(p => p.nivelCompromiso === 'Alto').length;
  
  // Add title
  statsSheet.mergeCells('A1:B1');
  const titleCell = statsSheet.getCell('A1');
  titleCell.value = 'Estadísticas del Líder';
  titleCell.font = { bold: true, size: 14, color: { argb: COLORS.primary } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add statistics
  statsSheet.getCell('A3').value = 'Total de Personas:';
  statsSheet.getCell('B3').value = totalPersonas;
  
  statsSheet.getCell('A4').value = 'Personas Activas:';
  statsSheet.getCell('B4').value = personasActivas;
  
  statsSheet.getCell('A5').value = 'Personas con Alto Compromiso:';
  statsSheet.getCell('B5').value = personasAltoCompromiso;
  
  // Style statistics
  statsSheet.getColumn('A').width = 30;
  statsSheet.getColumn('B').width = 15;
  
  ['A3', 'A4', 'A5'].forEach(cell => {
    statsSheet.getCell(cell).font = { bold: true };
  });
  
  ['B3', 'B4', 'B5'].forEach(cell => {
    statsSheet.getCell(cell).font = { size: 12 };
    statsSheet.getCell(cell).alignment = { horizontal: 'center' };
  });
}

/**
 * Generate Excel for lideres
 */
async function generateExcelLideres(lideres, personas) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Líderes');
  
  // Define columns
  worksheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'Cédula', key: 'cedula', width: 15 },
    { header: 'Celular', key: 'celular', width: 15 },
    { header: 'Correo', key: 'correo', width: 30 },
    { header: 'Zona', key: 'zona', width: 15 },
    { header: 'Total de Personas Asignadas', key: 'totalPersonas', width: 25 },
    { header: 'Personas Activas', key: 'personasActivas', width: 18 },
    { header: 'Personas con Alto Compromiso', key: 'personasAltoCompromiso', width: 28 }
  ];
  
  // Calculate statistics for each lider
  const lideresWithStats = lideres.map(lider => {
    const personasAsignadas = personas.filter(p => p.liderId === lider.id);
    const personasActivas = personasAsignadas.filter(p => p.estado === 'Activo').length;
    const personasAltoCompromiso = personasAsignadas.filter(p => p.nivelCompromiso === 'Alto').length;
    
    return {
      ...lider,
      totalPersonas: personasAsignadas.length,
      personasActivas,
      personasAltoCompromiso
    };
  });
  
  // Sort by total personas (descending)
  lideresWithStats.sort((a, b) => b.totalPersonas - a.totalPersonas);
  
  // Add data rows
  lideresWithStats.forEach(lider => {
    worksheet.addRow({
      nombre: lider.nombre || '',
      cedula: lider.cedula || '',
      celular: lider.celular || '',
      correo: lider.correo || '',
      zona: lider.zona || '',
      totalPersonas: lider.totalPersonas,
      personasActivas: lider.personasActivas,
      personasAltoCompromiso: lider.personasAltoCompromiso
    });
  });
  
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.headerBg }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;
  
  // Add auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: 'H1'
  };
  
  // Add borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
  
  // Add summary sheet
  await addLideresResumenSheet(workbook, lideresWithStats);
  
  return workbook;
}

/**
 * Add summary sheet for lideres
 */
async function addLideresResumenSheet(workbook, lideresWithStats) {
  const resumenSheet = workbook.addWorksheet('Resumen');
  
  // Calculate totals
  const totalLideres = lideresWithStats.length;
  const totalPersonasAsignadas = lideresWithStats.reduce((sum, l) => sum + l.totalPersonas, 0);
  const totalPersonasActivas = lideresWithStats.reduce((sum, l) => sum + l.personasActivas, 0);
  const totalPersonasAltoCompromiso = lideresWithStats.reduce((sum, l) => sum + l.personasAltoCompromiso, 0);
  const promedioPersonasPorLider = totalLideres > 0 ? (totalPersonasAsignadas / totalLideres).toFixed(1) : 0;
  
  // Add title
  resumenSheet.mergeCells('A1:B1');
  const titleCell = resumenSheet.getCell('A1');
  titleCell.value = 'Resumen General de Líderes';
  titleCell.font = { bold: true, size: 14, color: { argb: COLORS.primary } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Add statistics
  resumenSheet.getCell('A3').value = 'Total de Líderes:';
  resumenSheet.getCell('B3').value = totalLideres;
  
  resumenSheet.getCell('A4').value = 'Total de Personas Asignadas:';
  resumenSheet.getCell('B4').value = totalPersonasAsignadas;
  
  resumenSheet.getCell('A5').value = 'Total de Personas Activas:';
  resumenSheet.getCell('B5').value = totalPersonasActivas;
  
  resumenSheet.getCell('A6').value = 'Total con Alto Compromiso:';
  resumenSheet.getCell('B6').value = totalPersonasAltoCompromiso;
  
  resumenSheet.getCell('A7').value = 'Promedio de Personas por Líder:';
  resumenSheet.getCell('B7').value = promedioPersonasPorLider;
  
  // Style
  resumenSheet.getColumn('A').width = 35;
  resumenSheet.getColumn('B').width = 20;
  
  ['A3', 'A4', 'A5', 'A6', 'A7'].forEach(cell => {
    resumenSheet.getCell(cell).font = { bold: true };
  });
  
  ['B3', 'B4', 'B5', 'B6', 'B7'].forEach(cell => {
    resumenSheet.getCell(cell).font = { size: 12 };
    resumenSheet.getCell(cell).alignment = { horizontal: 'center' };
  });
}

/**
 * Generate Excel for duplicados
 */
async function generateExcelDuplicados(duplicados) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Duplicados');
  
  // Validar que cada duplicado tenga al menos nombre y cédula
  const duplicadosValidos = duplicados.filter(dup => {
    return dup.persona && dup.persona.nombre && dup.persona.cedula;
  });
  
  console.log(`Duplicados válidos: ${duplicadosValidos.length} de ${duplicados.length}`);
  
  // Define columns (todas las originales + adicionales)
  worksheet.columns = [
    { header: 'Fila Original', key: 'fila', width: 15 },
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'Cédula', key: 'cedula', width: 15 },
    { header: 'Celular', key: 'celular', width: 15 },
    { header: 'Correo', key: 'correo', width: 30 },
    { header: 'Dirección', key: 'direccion', width: 35 },
    { header: 'Mesa', key: 'mesa', width: 10 },
    { header: 'Lugar de Votación', key: 'lugarVotacion', width: 30 },
    { header: 'Dirección de Votación', key: 'direccionVotacion', width: 35 },
    { header: 'Zona', key: 'zona', width: 15 },
    { header: 'Líder Asignado', key: 'liderNombre', width: 30 },
    { header: 'Motivo Rechazo', key: 'motivoRechazo', width: 35 },
    { header: 'Fecha Detección', key: 'fechaDeteccion', width: 20 }
  ];
  
  // Sort by fila (row number)
  const sortedDuplicados = [...duplicadosValidos].sort((a, b) => a.fila - b.fila);
  
  // Add data rows
  sortedDuplicados.forEach(dup => {
    worksheet.addRow({
      fila: dup.fila,
      nombre: dup.persona.nombre || '',
      cedula: dup.persona.cedula || '',
      celular: dup.persona.celular || '',
      correo: dup.persona.correo || '',
      direccion: dup.persona.direccion || '',
      mesa: dup.persona.mesa || '',
      lugarVotacion: dup.persona.lugarVotacion || '',
      direccionVotacion: dup.persona.direccionVotacion || '',
      zona: dup.persona.zona || '',
      liderNombre: dup.persona.liderNombre || '',
      motivoRechazo: dup.motivoRechazo || 'Cédula duplicada',
      fechaDeteccion: dup.fechaDeteccion ? new Date(dup.fechaDeteccion) : new Date()
    });
  });
  
  // Style header row (reutilizar estilos existentes)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: COLORS.headerText }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.headerBg }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;
  
  // Add auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: 'M1'
  };
  
  // Add borders (reutilizar lógica existente)
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
  
  return workbook;
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: ''
      };
    }
    
    // Parse parameters based on method
    let type, filters;
    
    if (event.httpMethod === 'POST') {
      // Parse POST body
      const body = JSON.parse(event.body || '{}');
      type = body.type || 'personas';
      filters = body.duplicados ? { duplicados: body.duplicados } : (body.filters || {});
      console.log('POST request - Type:', type, 'Duplicados count:', body.duplicados?.length);
    } else {
      // Parse GET query parameters
      const params = parseQueryParams(event);
      type = params.type;
      filters = params.filters;
      console.log('GET request - Type:', type, 'Filters:', filters);
    }
    
    console.log('Export type:', type, 'Filters keys:', Object.keys(filters));
    
    // Query data (skip for duplicados since data comes in filters)
    const data = type === 'duplicados' ? [] : await queryData(type, filters);
    console.log(`Found ${data.length} records`);
    
    // Check if data is empty (skip for duplicados)
    if (type !== 'duplicados' && data.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'No hay datos para exportar con los filtros seleccionados'
        })
      };
    }
    
    // Generate Excel based on type
    let workbook;
    if (type === 'lideres') {
      // Get personas for statistics
      const personas = await queryData('personas', {});
      workbook = await generateExcelLideres(data, personas);
    } else if (type === 'duplicados') {
      // Nuevo: generar Excel de duplicados
      const duplicados = filters.duplicados || [];
      console.log('=== GENERANDO EXCEL DE DUPLICADOS ===');
      console.log('Duplicados recibidos:', duplicados.length);
      console.log('Primeros 3 duplicados:', JSON.stringify(duplicados.slice(0, 3), null, 2));
      workbook = await generateExcelDuplicados(duplicados);
    } else {
      // Get lideres for lookup
      const lideres = await queryData('lideres', {});
      workbook = await generateExcelPersonas(data, filters, lideres);
    }
    
    // Generate filename
    const filename = type === 'duplicados' 
      ? `duplicados_${new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_')}.xlsx`
      : generateFilename(type, filters);
    console.log('Generated filename:', filename);
    
    // Convert workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Return Excel file
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Error al generar el archivo Excel',
        message: error.message
      })
    };
  }
};
