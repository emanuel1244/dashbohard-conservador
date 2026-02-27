// Lambda function for PDF export
// Handles: /api/export/pdf

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const PDFDocument = require('pdfkit');

const client = new DynamoDBClient({ region: 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const PERSONAS_TABLE = 'PartidoConservadorPersonas';
const LIDERES_TABLE = 'PartidoConservadorPersonasLideres';

// Colores del partido
const COLORS = {
  primary: '#003DA5',    // Azul
  secondary: '#FFD700',  // Dorado
  text: '#333333',
  lightGray: '#F5F5F5'
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
  
  if (filters.liderId && filters.liderId.trim() !== '') {
    filtered = filtered.filter(p => p.liderId === filters.liderId);
  }
  
  if (filters.zona && filters.zona.trim() !== '') {
    filtered = filtered.filter(p => p.zona === filters.zona);
  }
  
  if (filters.mesa && filters.mesa.trim() !== '') {
    filtered = filtered.filter(p => p.mesa === filters.mesa);
  }
  
  if (filters.estado && filters.estado.trim() !== '') {
    filtered = filtered.filter(p => p.estado === filters.estado);
  }
  
  if (filters.nivelCompromiso && filters.nivelCompromiso.trim() !== '') {
    filtered = filtered.filter(p => p.nivelCompromiso === filters.nivelCompromiso);
  }
  
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
    return `lideres_${timestamp}.pdf`;
  }
  
  if (filters.liderId && filters.liderNombre) {
    const liderName = filters.liderNombre.replace(/\s+/g, '_');
    return `personas_lider_${liderName}_${timestamp}.pdf`;
  }
  
  if (filters.zona) {
    return `personas_zona_${filters.zona}_${timestamp}.pdf`;
  }
  
  if (filters.mesa) {
    return `personas_mesa_${filters.mesa}_${timestamp}.pdf`;
  }
  
  return `personas_completo_${timestamp}.pdf`;
}

/**
 * Generate PDF for personas
 */
async function generatePDFPersonas(personas, filters, lideres) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'LETTER' });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    // Create lider lookup map
    const liderMap = {};
    if (lideres) {
      lideres.forEach(lider => {
        liderMap[lider.id] = lider.nombre;
      });
    }
    
    // Header
    doc.fontSize(20).fillColor(COLORS.primary).text('Partido Conservador Colombiano', { align: 'center' });
    doc.fontSize(16).text('Reporte de Personas', { align: 'center' });
    doc.moveDown();
    
    // Filters info
    if (filters.liderId && filters.liderNombre) {
      doc.fontSize(12).fillColor(COLORS.text).text(`Líder: ${filters.liderNombre}`, { align: 'center' });
    }
    if (filters.zona) {
      doc.fontSize(12).text(`Zona: ${filters.zona}`, { align: 'center' });
    }
    if (filters.mesa) {
      doc.fontSize(12).text(`Mesa: ${filters.mesa}`, { align: 'center' });
    }
    
    doc.fontSize(10).fillColor('#666').text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'center' });
    doc.fontSize(10).text(`Total de registros: ${personas.length}`, { align: 'center' });
    doc.moveDown(2);
    
    // Statistics
    const stats = {
      activos: personas.filter(p => p.estado === 'Activo').length,
      altoCompromiso: personas.filter(p => p.nivelCompromiso === 'Alto').length
    };
    
    doc.fontSize(12).fillColor(COLORS.primary).text('Estadísticas:', { underline: true });
    doc.fontSize(10).fillColor(COLORS.text);
    doc.text(`• Personas Activas: ${stats.activos}`);
    doc.text(`• Alto Compromiso: ${stats.altoCompromiso}`);
    doc.moveDown(2);
    
    // Table header
    doc.fontSize(10).fillColor(COLORS.primary).text('Listado de Personas:', { underline: true });
    doc.moveDown();
    
    // Personas list
    personas.forEach((persona, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      
      doc.fontSize(9).fillColor(COLORS.text);
      doc.text(`${index + 1}. ${persona.nombre || 'N/A'}`, { continued: false });
      doc.fontSize(8).fillColor('#666');
      doc.text(`   Cédula: ${persona.cedula || 'N/A'} | Celular: ${persona.celular || 'N/A'}`);
      doc.text(`   Mesa: ${persona.mesa || 'N/A'} | Zona: ${persona.zona || 'N/A'}`);
      if (persona.liderId) {
        doc.text(`   Líder: ${liderMap[persona.liderId] || 'N/A'}`);
      }
      doc.text(`   Estado: ${persona.estado || 'N/A'} | Compromiso: ${persona.nivelCompromiso || 'N/A'}`);
      doc.moveDown(0.5);
    });
    
    // Footer
    doc.fontSize(8).fillColor('#999').text(
      'Partido Conservador Colombiano - Documento Confidencial',
      30,
      doc.page.height - 50,
      { align: 'center' }
    );
    
    doc.end();
  });
}

/**
 * Generate PDF for lideres
 */
async function generatePDFLideres(lideres, personas) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'LETTER' });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
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
    
    // Sort by total personas
    lideresWithStats.sort((a, b) => b.totalPersonas - a.totalPersonas);
    
    // Header
    doc.fontSize(20).fillColor(COLORS.primary).text('Partido Conservador Colombiano', { align: 'center' });
    doc.fontSize(16).text('Reporte de Líderes', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(10).fillColor('#666').text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'center' });
    doc.fontSize(10).text(`Total de líderes: ${lideres.length}`, { align: 'center' });
    doc.moveDown(2);
    
    // General statistics
    const totalPersonasAsignadas = lideresWithStats.reduce((sum, l) => sum + l.totalPersonas, 0);
    const totalPersonasActivas = lideresWithStats.reduce((sum, l) => sum + l.personasActivas, 0);
    const promedioPersonasPorLider = lideres.length > 0 ? (totalPersonasAsignadas / lideres.length).toFixed(1) : 0;
    
    doc.fontSize(12).fillColor(COLORS.primary).text('Resumen General:', { underline: true });
    doc.fontSize(10).fillColor(COLORS.text);
    doc.text(`• Total de Personas Asignadas: ${totalPersonasAsignadas}`);
    doc.text(`• Total de Personas Activas: ${totalPersonasActivas}`);
    doc.text(`• Promedio de Personas por Líder: ${promedioPersonasPorLider}`);
    doc.moveDown(2);
    
    // Lideres list
    doc.fontSize(12).fillColor(COLORS.primary).text('Listado de Líderes:', { underline: true });
    doc.moveDown();
    
    lideresWithStats.forEach((lider, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      
      doc.fontSize(10).fillColor(COLORS.text);
      doc.text(`${index + 1}. ${lider.nombre || 'N/A'}`, { continued: false });
      doc.fontSize(8).fillColor('#666');
      doc.text(`   Cédula: ${lider.cedula || 'N/A'} | Celular: ${lider.celular || 'N/A'}`);
      doc.text(`   Zona: ${lider.zona || 'N/A'}`);
      doc.fontSize(9).fillColor(COLORS.primary);
      doc.text(`   Personas Asignadas: ${lider.totalPersonas} | Activas: ${lider.personasActivas} | Alto Compromiso: ${lider.personasAltoCompromiso}`);
      doc.moveDown(0.5);
    });
    
    // Footer
    doc.fontSize(8).fillColor('#999').text(
      'Partido Conservador Colombiano - Documento Confidencial',
      30,
      doc.page.height - 50,
      { align: 'center' }
    );
    
    doc.end();
  });
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
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: ''
      };
    }
    
    // Parse parameters
    const { type, filters } = parseQueryParams(event);
    console.log('Export type:', type, 'Filters:', filters);
    
    // Query data
    const data = await queryData(type, filters);
    console.log(`Found ${data.length} records`);
    
    // Check if data is empty
    if (data.length === 0) {
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
    
    // Generate PDF based on type
    let pdfBuffer;
    if (type === 'lideres') {
      const personas = await queryData('personas', {});
      pdfBuffer = await generatePDFLideres(data, personas);
    } else {
      const lideres = await queryData('lideres', {});
      pdfBuffer = await generatePDFPersonas(data, filters, lideres);
    }
    
    // Generate filename
    const filename = generateFilename(type, filters);
    console.log('Generated filename:', filename);
    
    // Return PDF file
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: pdfBuffer.toString('base64'),
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
        error: 'Error al generar el archivo PDF',
        message: error.message
      })
    };
  }
};
