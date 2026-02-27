// AWS SDK v3 para Node.js 18
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
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

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        // Verificar que viene un archivo
        if (!event.body || !event.isBase64Encoded) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'No se ha enviado ningún archivo' })
            };
        }

        // Decodificar el archivo base64
        const fileBuffer = Buffer.from(event.body, 'base64');
        
        // Leer el archivo Excel
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`Procesando ${data.length} filas del Excel`);

        // Obtener todos los líderes existentes
        const lideresResult = await dynamodb.send(new ScanCommand({
            TableName: LIDERES_TABLE
        }));
        const lideres = lideresResult.Items || [];
        console.log(`Líderes encontrados: ${lideres.length}`);

        // Crear mapa de líderes por cédula y por nombre para búsqueda rápida
        const lideresPorCedula = {};
        const lideresPorNombre = {};
        lideres.forEach(lider => {
            if (lider.cedula) {
                lideresPorCedula[lider.cedula.trim()] = lider;
            }
            if (lider.nombre) {
                const nombreNormalizado = lider.nombre.trim().toLowerCase();
                lideresPorNombre[nombreNormalizado] = lider;
            }
        });

        // Obtener personas existentes para detectar duplicados
        const personasResult = await dynamodb.send(new ScanCommand({
            TableName: TABLE_NAME
        }));
        const personasExistentes = personasResult.Items || [];
        const cedulasExistentes = new Set(personasExistentes.map(p => p.cedula));

        // Procesar datos
        const nuevasPersonas = [];
        const duplicados = [];
        const errores = [];
        const lideresNoEncontrados = new Set();

        data.forEach((row, index) => {
            try {
                // Extraer datos de la fila
                const cedula = (row['Cedula'] || row['CEDULA'] || row['cedula'] || '').toString().trim();
                const nombre = (row['NOMBRE Y APELLIDOS'] || row['Nombre'] || row['nombre'] || '').toString().trim();
                const liderInfo = (row['Lider'] || row['LIDER'] || row['lider'] || '').toString().trim();

                // Validar datos mínimos
                if (!cedula || !nombre) {
                    errores.push({
                        fila: index + 2,
                        mensaje: 'Cédula y nombre son obligatorios',
                        datos: { cedula, nombre }
                    });
                    return;
                }

                // Verificar duplicados
                if (cedulasExistentes.has(cedula)) {
                    const fechaDeteccion = new Date().toISOString();
                    duplicados.push({
                        fila: index + 2,
                        persona: {
                            cedula,
                            nombre,
                            celular: (row['Celular'] || row['CELULAR'] || row['celular'] || '').toString().trim(),
                            correo: (row['Correo'] || row['CORREO'] || row['correo'] || '').toString().trim(),
                            direccion: (row['DIRECCION'] || row['Direccion'] || row['direccion'] || '').toString().trim(),
                            mesa: (row['MESA'] || row['Mesa'] || row['mesa'] || '').toString().trim(),
                            lugarVotacion: (row['LUGAR DE VOTACION'] || row['Lugar Votacion'] || row['lugarVotacion'] || '').toString().trim(),
                            direccionVotacion: (row['DIRECCION L VOTACION'] || row['Direccion Votacion'] || row['direccionVotacion'] || '').toString().trim(),
                            zona: (row['Zona'] || row['ZONA'] || row['zona'] || '').toString().trim(),
                            liderNombre: liderInfo
                        },
                        motivoRechazo: 'Cédula ya existe en el sistema',
                        fechaDeteccion: fechaDeteccion,
                        existeEnBD: true
                    });
                    return;
                }

                // Buscar líder
                let liderAsignado = null;
                if (liderInfo) {
                    // Intentar buscar por cédula primero
                    liderAsignado = lideresPorCedula[liderInfo];
                    
                    // Si no se encuentra, buscar por nombre
                    if (!liderAsignado) {
                        const nombreLiderNormalizado = liderInfo.toLowerCase();
                        liderAsignado = lideresPorNombre[nombreLiderNormalizado];
                    }

                    if (!liderAsignado) {
                        lideresNoEncontrados.add(liderInfo);
                    }
                }

                // Crear objeto persona
                const persona = {
                    id: `persona-${Date.now()}-${index}`,
                    cedula,
                    nombre,
                    celular: (row['Celular'] || row['CELULAR'] || row['celular'] || '').toString().trim(),
                    correo: (row['Correo'] || row['CORREO'] || row['correo'] || '').toString().trim(),
                    direccion: (row['DIRECCION'] || row['Direccion'] || row['direccion'] || '').toString().trim(),
                    mesa: (row['MESA'] || row['Mesa'] || row['mesa'] || '').toString().trim(),
                    lugarVotacion: (row['LUGAR DE VOTACION'] || row['Lugar Votacion'] || row['lugarVotacion'] || '').toString().trim(),
                    zona: (row['Zona'] || row['ZONA'] || row['zona'] || '').toString().trim(),
                    estado: 'Activo',
                    nivelCompromiso: 'Medio',
                    fechaCreacion: new Date().toISOString()
                };

                // Asignar líder si se encontró
                if (liderAsignado) {
                    persona.liderId = liderAsignado.id;
                    persona.liderNombre = liderAsignado.nombre;
                    persona.fechaAsignacion = new Date().toISOString();
                }

                nuevasPersonas.push(persona);
                cedulasExistentes.add(cedula); // Agregar para evitar duplicados en el mismo archivo

            } catch (error) {
                errores.push({
                    fila: index + 2,
                    mensaje: `Error procesando fila: ${error.message}`,
                    datos: row
                });
            }
        });

        console.log(`Personas válidas: ${nuevasPersonas.length}`);
        console.log(`Duplicados: ${duplicados.length}`);
        console.log(`Errores: ${errores.length}`);

        // Guardar personas en DynamoDB (en lotes de 25)
        if (nuevasPersonas.length > 0) {
            const batchSize = 25;
            for (let i = 0; i < nuevasPersonas.length; i += batchSize) {
                const batch = nuevasPersonas.slice(i, i + batchSize);
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
        }

        // Actualizar contador de personas asignadas por líder
        const lideresActualizados = {};
        nuevasPersonas.forEach(persona => {
            if (persona.liderId) {
                lideresActualizados[persona.liderId] = (lideresActualizados[persona.liderId] || 0) + 1;
            }
        });

        // Actualizar cada líder con su nuevo contador
        for (const [liderId, cantidad] of Object.entries(lideresActualizados)) {
            const lider = lideres.find(l => l.id === liderId);
            if (lider) {
                const personasDelLider = await dynamodb.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: 'liderId = :liderId',
                    ExpressionAttributeValues: {
                        ':liderId': liderId
                    }
                }));

                await dynamodb.send(new PutCommand({
                    TableName: LIDERES_TABLE,
                    Item: {
                        ...lider,
                        personasAsignadas: personasDelLider.Items?.length || 0,
                        fechaActualizacion: new Date().toISOString()
                    }
                }));
            }
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                mensaje: 'Archivo procesado correctamente',
                estadisticas: {
                    totalProcesadas: data.length,
                    agregadas: nuevasPersonas.length,
                    duplicados: duplicados.length,
                    errores: errores.length,
                    conLiderAsignado: nuevasPersonas.filter(p => p.liderId).length,
                    sinLider: nuevasPersonas.filter(p => !p.liderId).length
                },
                lideresActualizados: Object.keys(lideresActualizados).length,
                lideresNoEncontrados: Array.from(lideresNoEncontrados),
                duplicados: duplicados, // Enviar todos los duplicados
                errores: errores.slice(0, 10) // Solo primeros 10 errores
            })
        };

    } catch (error) {
        console.error('Error procesando archivo:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Error procesando el archivo Excel',
                detalle: error.message
            })
        };
    }
};
