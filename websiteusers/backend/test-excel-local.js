const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Leer el archivo Excel
const excelPath = path.join(__dirname, '../partido-conservador-dashboard/LISTADO (1).xlsx');
const fileBuffer = fs.readFileSync(excelPath);

// Procesar el Excel
const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

console.log('=== ANÁLISIS COMPLETO DEL EXCEL ===\n');

// Leer TODO sin procesar
const allData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log(`Total de filas en el Excel: ${allData.length}\n`);

// Mostrar las primeras 5 filas completas
console.log('=== PRIMERAS 5 FILAS COMPLETAS ===');
allData.slice(0, 5).forEach((row, index) => {
    console.log(`\nFila ${index + 1}:`, row);
});

// Intentar detectar dónde empiezan los headers reales
console.log('\n=== BUSCANDO FILA DE HEADERS ===');
let headerRowIndex = -1;
for (let i = 0; i < Math.min(5, allData.length); i++) {
    const row = allData[i];
    const hasNombreApellidos = row.some(cell => 
        cell && String(cell).toUpperCase().includes('NOMBRE') && String(cell).toUpperCase().includes('APELLIDOS')
    );
    const hasCedula = row.some(cell => 
        cell && String(cell).toUpperCase().includes('CEDULA')
    );
    
    if (hasNombreApellidos && hasCedula) {
        headerRowIndex = i;
        console.log(`✅ Headers encontrados en fila ${i + 1}:`, row);
        break;
    }
}

if (headerRowIndex === -1) {
    console.log('❌ No se encontraron headers');
    process.exit(1);
}

// Usar los headers encontrados
const headers = allData[headerRowIndex];
const dataRows = allData.slice(headerRowIndex + 1);

console.log(`\n=== PROCESANDO ${dataRows.length} FILAS DE DATOS ===`);

// Función helper para buscar valor en diferentes variaciones de nombre de columna
const getColumnValue = (row, ...possibleNames) => {
    for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
            return row[name];
        }
    }
    return '';
};

// Convertir a objetos
const data = dataRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
        if (header) {
            obj[header] = row[index] || '';
        }
    });
    return obj;
});

console.log('\n=== PRIMERA PERSONA ===');
console.log(JSON.stringify(data[0], null, 2));

// Procesar las primeras 5 filas como ejemplo
console.log('\n=== PROCESAMIENTO DE DATOS ===');
let procesadas = 0;
let errores = 0;

data.slice(0, 5).forEach((row, index) => {
    const persona = {
        nombre: getColumnValue(row, 'NOMBRE Y APELLIDOS', 'Nombre y Apellidos', 'nombre', 'Nombre', 'NOMBRE'),
        cedula: String(getColumnValue(row, 'Cedula', 'Cédula', 'cedula', 'CEDULA', 'CC', 'Documento')),
        lugarVotacion: getColumnValue(row, 'LUGAR DE VOTACION', 'Lugar de Votacion', 'lugarVotacion', 'Lugar Votacion', 'LUGAR DE VOTACION '),
        mesa: String(getColumnValue(row, 'MESA', 'Mesa', 'mesa', 'Puesto')),
    };
    
    console.log(`\nFila ${index + 1}:`);
    console.log(`  Nombre: "${persona.nombre}"`);
    console.log(`  Cédula: "${persona.cedula}"`);
    console.log(`  Lugar: "${persona.lugarVotacion}"`);
    console.log(`  Mesa: "${persona.mesa}"`);
    
    if (persona.nombre && persona.cedula) {
        procesadas++;
        console.log(`  ✅ VÁLIDA`);
    } else {
        errores++;
        console.log(`  ❌ ERROR: Datos incompletos`);
    }
});

console.log(`\n=== RESUMEN ===`);
console.log(`Total en Excel: ${data.length}`);
console.log(`Procesadas (primeras 5): ${procesadas}`);
console.log(`Errores (primeras 5): ${errores}`);
