// AWS SDK v3 para Node.js 18
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, BatchWriteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const xlsx = require('xlsx');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'PartidoConservadorPersonas';
const LIDERES_TABLE = TABLE_NAME + 'Lideres';

const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

// Parser simple de multipart/form-data
function parseMultipartFormData(body, boundary) {
    const parts = body.split(boundary);
    const files = {};
    
    for (const part of parts) {
        if (part.includes('Content-Disposition')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            const filenameMatch = part.match(/filename="([^"]+)"/);
            
            if (nameMatch && filenameMatch) {
                const name = nameMatch[1];
                const filename = filenameMatch[1];
                
                // Extraer el contenido del archivo
                const contentStart = part.indexOf('\r\n\r\n') + 4;
                const contentEnd = part.lastIndexOf('\r\n');
                const content = part.substring(contentStart, contentEnd);
                
                files[name] = {
                    filename: filename,
                    content: content
                };
            }
        }
    }
    
    return files;
}

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Manejar preflight CORS
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }

        // Obtener el boundary del Content-Type
        const contentType = event.headers['content-type'] || event.headers['Content-Type'];
        const boundaryMatch = contentType.match(/boundary=(.+)$/);
        
        if (!boundaryMatch) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Content-Type inválido' })
            };
        }

        const boundary = '--' + boundaryMatch[1];
        
        // Decodificar el body si viene en base64
        let bodyContent = event.body;
        if (event.isBase64Encoded) {
            bodyContent = Buffer.from(event.body, 'base64').toString('binary');
        }

        // Parsear el multipart form data
        const files = parseMultipartFormData(bodyContent, boundary);
        
        if (!files.file) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'No se ha enviado ningún archivo' })
            };
        }

        // Convertir el contenido a buffer
        const fileBuffer = Buffer.from(files.file.content, 'binary');
        
        // Leer el archivo Excel
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Leer TODO el Excel sin procesar para detectar headers
        const allData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        
        console.log(`Total de filas en el Excel: ${allData.length}`);
        
        // PASO 1: Extraer el nombre del líder de la primera fila
        let nombreLider = '';
        if (allData.length > 0) {
            const primeraFila = allData[0];
            // Buscar "LIDER" en la primera fila
            const liderIndex = primeraFila.findIndex(cell => 
                cell && String(cell).toUpperCase().includes('LIDER')
            );
            if (liderIndex !== -1 && primeraFila[liderIndex + 1]) {
                nombreLider = String(primeraFila[liderIndex + 1]).trim();
                console.log(`Líder detectado: ${nombreLider}`);
            }
        }
        
        // Buscar la fila que contiene los headers reales
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(10, allData.length); i++) {
            const row = allData[i];
            const hasNombreApellidos = row.some(cell => 
                cell && String(cell).toUpperCase().includes('NOMBRE') && String(cell).toUpperCase().includes('APELLIDOS')
            );
            const hasCedula = row.some(cell => 
                cell && String(cell).toUpperCase().includes('CEDULA')
            );
            
            if (hasNombreApellidos && hasCedula) {
                headerRowIndex = i;
                console.log(`Headers encontrados en fila ${i + 1}`);
                break;
            }
        }
        
        if (headerRowIndex === -1) {
            throw new Error('No se encontraron las columnas NOMBRE Y APELLIDOS y CEDULA en el Excel');
        }
        
        // Usar los headers encontrados
        const headers = allData[headerRowIndex];
        const dataRows = allData.slice(headerRowIndex + 1);
        
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

        console.log(`Procesando ${data.length} filas del Excel`);
        
        // Log de las primeras columnas para debug
        if (data.length > 0) {
            console.log('Columnas detectadas:', Object.keys(data[0]));
            console.log('Primera fila de datos:', JSON.stringify(data[0]));
        }

        // Obtener personas existentes de DynamoDB (opcional)
        let personasExistentes = [];
        try {
            const result = await dynamodb.send(new ScanCommand({
                TableName: TABLE_NAME
            }));
            personasExistentes = result.Items || [];
        } catch (err) {
            console.log('No se pudo obtener personas existentes:', err.message);
        }

        // PASO 2: Buscar o crear el líder en DynamoDB
        let liderInfo = null;
        
        if (nombreLider) {
            try {
                // Buscar líder por nombre
                const lideresResult = await dynamodb.send(new ScanCommand({
                    TableName: LIDERES_TABLE,
                    FilterExpression: 'contains(#nombre, :nombreLider)',
                    ExpressionAttributeNames: {
                        '#nombre': 'nombre'
                    },
                    ExpressionAttributeValues: {
                        ':nombreLider': nombreLider
                    }
                }));
                
                if (lideresResult.Items && lideresResult.Items.length > 0) {
                    liderInfo = lideresResult.Items[0];
                    console.log(`Líder encontrado: ${liderInfo.id}`);
                } else {
                    // Crear nuevo líder si no existe
                    liderInfo = {
                        id: `lider-${Date.now()}`,
                        nombre: nombreLider,
                        cedula: '',
                        celular: '',
                        correo: '',
                        zona: '',
                        personasAsignadas: 0,
                        fechaCreacion: new Date().toISOString()
                    };
                    
                    await dynamodb.send(new PutCommand({
                        TableName: LIDERES_TABLE,
                        Item: liderInfo
                    }));
                    
                    console.log(`Líder creado: ${liderInfo.id}`);
                }
            } catch (err) {
                console.error('Error buscando/creando líder:', err);
            }
        }

        // Validar y procesar datos
        const nuevasPersonas = [];
        const duplicados = [];
        const errores = [];

        data.forEach((row, index) => {
            // Función helper para buscar valor en diferentes variaciones de nombre de columna
            const getColumnValue = (row, ...possibleNames) => {
                for (const name of possibleNames) {
                    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                        return row[name];
                    }
                }
                return '';
            };

            const persona = {
                id: `${Date.now()}-${index}`,
                nombre: getColumnValue(row, 'NOMBRE Y APELLIDOS', 'Nombre y Apellidos', 'nombre', 'Nombre', 'NOMBRE'),
                cedula: String(getColumnValue(row, 'Cedula', 'Cédula', 'cedula', 'CEDULA', 'CC', 'Documento')),
                lugarVotacion: getColumnValue(row, 'LUGAR DE VOTACION', 'Lugar de Votacion', 'lugarVotacion', 'Lugar Votacion', 'LUGAR DE VOTACION '),
                direccionVotacion: getColumnValue(row, 'DIRECCION L VOTACION', 'Direccion L Votacion', 'direccionVotacion', 'Direccion Votacion'),
                mesa: String(getColumnValue(row, 'MESA', 'Mesa', 'mesa', 'Puesto')),
                direccion: getColumnValue(row, 'DIRECCION', 'Direccion', 'direccion', 'Dirección'),
                correo: getColumnValue(row, 'Correo', 'correo', 'Email', 'email', 'E-mail'),
                celular: String(getColumnValue(row, 'Celular', 'celular', 'Telefono', 'Teléfono', 'Movil')),
                liderId: liderInfo ? liderInfo.id : null,
                liderNombre: liderInfo ? liderInfo.nombre : null,
                fechaCreacion: new Date().toISOString()
            };

            // Log para debug
            console.log(`Fila ${index + 2}: nombre="${persona.nombre}", cedula="${persona.cedula}"`);

            // Validar duplicados por cédula
            const existeDuplicado = personasExistentes.find(p => p.cedula === persona.cedula) || 
                                    nuevasPersonas.find(p => p.cedula === persona.cedula);
            
            if (existeDuplicado && persona.cedula) {
                duplicados.push({ fila: index + 2, persona });
            } else if (persona.cedula && persona.nombre) {
                nuevasPersonas.push(persona);
            } else {
                errores.push({ fila: index + 2, mensaje: 'Datos incompletos (falta nombre o cédula)' });
            }
        });

        // Guardar en DynamoDB
        if (nuevasPersonas.length > 0) {
            try {
                // Guardar en lotes de 25 (límite de DynamoDB)
                for (let i = 0; i < nuevasPersonas.length; i += 25) {
                    const batch = nuevasPersonas.slice(i, i + 25);
                    const putRequests = batch.map(persona => ({
                        PutRequest: {
                            Item: persona
                        }
                    }));

                    await dynamodb.send(new BatchWriteCommand({
                        RequestItems: {
                            [TABLE_NAME]: putRequests
                        }
                    }));
                }
                console.log(`Guardadas ${nuevasPersonas.length} personas en DynamoDB`);
                
                // PASO 3: Actualizar el contador de personas asignadas del líder
                if (liderInfo) {
                    try {
                        const nuevoContador = (liderInfo.personasAsignadas || 0) + nuevasPersonas.length;
                        
                        await dynamodb.send(new UpdateCommand({
                            TableName: LIDERES_TABLE,
                            Key: { id: liderInfo.id },
                            UpdateExpression: 'SET personasAsignadas = :contador',
                            ExpressionAttributeValues: {
                                ':contador': nuevoContador
                            }
                        }));
                        
                        console.log(`Actualizado contador del líder ${liderInfo.nombre}: ${nuevoContador} personas`);
                    } catch (err) {
                        console.error('Error actualizando contador del líder:', err);
                    }
                }
            } catch (err) {
                console.error('Error guardando en DynamoDB:', err);
                // Continuar aunque falle el guardado
            }
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                mensaje: 'Archivo procesado correctamente',
                lider: liderInfo ? {
                    id: liderInfo.id,
                    nombre: liderInfo.nombre,
                    personasAsignadas: (liderInfo.personasAsignadas || 0) + nuevasPersonas.length
                } : null,
                estadisticas: {
                    totalProcesadas: data.length,
                    agregadas: nuevasPersonas.length,
                    duplicados: duplicados.length,
                    errores: errores.length
                },
                duplicados: duplicados, // Enviar todos los duplicados
                errores: errores.slice(0, 10), // Solo primeros 10 errores
                personas: nuevasPersonas.slice(0, 5) // Solo primeras 5 como muestra
            })
        };

    } catch (error) {
        console.error('Error procesando archivo:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Error procesando el archivo Excel',
                detalle: error.message,
                stack: error.stack
            })
        };
    }
};
