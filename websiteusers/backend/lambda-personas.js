// AWS SDK v3 para Node.js 18
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'PartidoConservadorPersonas';

// Headers CORS estándar
const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// Funciones de validación
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]+$/;
    return phoneRegex.test(phone);
}

function validateEstado(estado) {
    const validEstados = ['Activo', 'Inactivo', 'Potencial'];
    return validEstados.includes(estado);
}

function validateNivelCompromiso(nivel) {
    const validNiveles = ['Alto', 'Medio', 'Bajo'];
    return validNiveles.includes(nivel);
}

// Handler principal
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    // Manejar OPTIONS para CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        const method = event.httpMethod;
        const path = event.path;

        // GET /personas/{id} - Obtener una persona específica
        if (method === 'GET' && event.pathParameters?.id) {
            const id = event.pathParameters.id;
            const result = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { id }
            }));
            if (!result.Item) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Persona no encontrada' })
                };
            }
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(result.Item)
            };
        }

        // GET /personas - Obtener todas
        if (method === 'GET') {
            const result = await dynamodb.send(new ScanCommand({
                TableName: TABLE_NAME
            }));
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(result.Items || [])
            };
        }

        // POST /personas - Crear nueva persona
        if (method === 'POST') {
            const body = JSON.parse(event.body);
            
            // Validar campos requeridos
            if (!body.nombre || !body.cedula) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Campos requeridos faltantes',
                        details: {
                            nombre: !body.nombre ? 'El nombre es requerido' : null,
                            cedula: !body.cedula ? 'La cédula es requerida' : null
                        }
                    })
                };
            }

            // Validar formato de email si se proporciona
            if (body.correo && !validateEmail(body.correo)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Formato de email inválido',
                        details: { correo: 'El correo electrónico no tiene un formato válido' }
                    })
                };
            }

            // Validar formato de teléfono si se proporciona
            if (body.celular && !validatePhone(body.celular)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Formato de teléfono inválido',
                        details: { celular: 'El celular debe contener solo números' }
                    })
                };
            }

            // Validar límite de caracteres en notas
            if (body.notas && body.notas.length > 1000) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Notas demasiado largas',
                        details: { notas: 'Las notas no pueden exceder 1000 caracteres' }
                    })
                };
            }

            // Verificar duplicados por cédula
            const existingResult = await dynamodb.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: 'cedula = :cedula',
                ExpressionAttributeValues: {
                    ':cedula': body.cedula
                }
            }));

            if (existingResult.Items && existingResult.Items.length > 0) {
                return {
                    statusCode: 409,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Cédula duplicada',
                        details: { cedula: 'Esta cédula ya está registrada en el sistema' }
                    })
                };
            }

            // Crear nueva persona
            const newPersona = {
                id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                cedula: body.cedula,
                nombre: body.nombre,
                celular: body.celular || '',
                correo: body.correo || '',
                direccion: body.direccion || '',
                mesa: body.mesa || '',
                lugarVotacion: body.lugarVotacion || '',
                direccionLugarVotacion: body.direccionLugarVotacion || '',
                zona: body.zona || '',
                liderId: body.liderId || '',
                liderNombre: body.liderNombre || '',
                estado: body.estado || 'Activo',
                nivelCompromiso: body.nivelCompromiso || 'Medio',
                notas: body.notas || '',
                fechaAsignacion: body.liderId ? new Date().toISOString() : '',
                fechaActualizacion: new Date().toISOString(),
                fechaCreacion: new Date().toISOString()
            };

            await dynamodb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: newPersona
            }));

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: true, 
                    persona: newPersona,
                    message: 'Persona creada exitosamente'
                })
            };
        }

        // PUT /personas/{id} - Actualizar persona
        if (method === 'PUT' && event.pathParameters?.id) {
            const id = event.pathParameters.id;
            const body = JSON.parse(event.body);
            
            // Validar campos requeridos si se proporcionan
            if (body.nombre !== undefined && !body.nombre) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'El nombre no puede estar vacío',
                        details: { nombre: 'El nombre es requerido' }
                    })
                };
            }

            if (body.cedula !== undefined && !body.cedula) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'La cédula no puede estar vacía',
                        details: { cedula: 'La cédula es requerida' }
                    })
                };
            }

            // Validar formato de email si se proporciona
            if (body.correo && !validateEmail(body.correo)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Formato de email inválido',
                        details: { correo: 'El correo electrónico no tiene un formato válido' }
                    })
                };
            }

            // Validar formato de teléfono si se proporciona
            if (body.celular && !validatePhone(body.celular)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Formato de teléfono inválido',
                        details: { celular: 'El celular debe contener solo números' }
                    })
                };
            }

            // Validar límite de caracteres en notas
            if (body.notas && body.notas.length > 1000) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Notas demasiado largas',
                        details: { notas: 'Las notas no pueden exceder 1000 caracteres' }
                    })
                };
            }

            // Validar estado si se proporciona
            if (body.estado && !validateEstado(body.estado)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Estado inválido',
                        details: { estado: 'El estado debe ser: Activo, Inactivo o Potencial' }
                    })
                };
            }

            // Validar nivel de compromiso si se proporciona
            if (body.nivelCompromiso && !validateNivelCompromiso(body.nivelCompromiso)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Nivel de compromiso inválido',
                        details: { nivelCompromiso: 'El nivel debe ser: Alto, Medio o Bajo' }
                    })
                };
            }
            
            const current = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { id }
            }));
            
            if (!current.Item) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Persona no encontrada' })
                };
            }

            // Verificar duplicados de cédula si se está cambiando
            if (body.cedula && body.cedula !== current.Item.cedula) {
                const existingResult = await dynamodb.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: 'cedula = :cedula',
                    ExpressionAttributeValues: {
                        ':cedula': body.cedula
                    }
                }));

                if (existingResult.Items && existingResult.Items.length > 0) {
                    return {
                        statusCode: 409,
                        headers: corsHeaders,
                        body: JSON.stringify({ 
                            error: 'Cédula duplicada',
                            details: { cedula: 'Esta cédula ya está registrada en el sistema' }
                        })
                    };
                }
            }

            const updated = {
                ...current.Item,
                ...body,
                id,
                fechaActualizacion: new Date().toISOString()
            };

            // Si se está asignando un líder nuevo, actualizar fecha de asignación
            if (body.liderId && body.liderId !== current.Item.liderId) {
                updated.fechaAsignacion = new Date().toISOString();
            }

            await dynamodb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: updated
            }));

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: true, 
                    persona: updated,
                    message: 'Persona actualizada exitosamente'
                })
            };
        }

        // DELETE /personas/{id} - Eliminar persona
        if (method === 'DELETE' && event.pathParameters?.id) {
            const id = event.pathParameters.id;
            
            // Verificar que la persona existe
            const persona = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { id }
            }));

            if (!persona.Item) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Persona no encontrada' })
                };
            }

            // Si tiene líder asignado, registrar la eliminación (opcional: actualizar contador del líder)
            if (persona.Item.liderId) {
                console.log(`Eliminando persona ${id} que tenía asignado el líder ${persona.Item.liderId}`);
            }

            // Eliminar la persona
            await dynamodb.send(new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { id }
            }));

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Persona eliminada exitosamente' 
                })
            };
        }

        // PUT /personas/{id}/asignar-lider - Asignar líder a persona
        if (method === 'PUT' && path.includes('/asignar-lider')) {
            const id = event.pathParameters.id;
            const body = JSON.parse(event.body);
            const { liderId, liderNombre } = body;

            if (!liderId) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'liderId es requerido',
                        details: { liderId: 'Debe proporcionar el ID del líder' }
                    })
                };
            }

            const persona = await dynamodb.send(new GetCommand({
                TableName: TABLE_NAME,
                Key: { id }
            }));

            if (!persona.Item) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Persona no encontrada' })
                };
            }

            const updated = {
                ...persona.Item,
                liderId,
                liderNombre: liderNombre || '',
                fechaAsignacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };

            await dynamodb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: updated
            }));

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: true, 
                    persona: updated,
                    message: 'Líder asignado exitosamente'
                })
            };
        }

        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Método no soportado' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: error.message })
        };
    }
};

// Obtener todas las personas
exports.getAll = async () => {
    try {
        const result = await dynamodb.send(new ScanCommand({
            TableName: TABLE_NAME
        }));

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result.Items || [])
        };
    } catch (error) {
        console.error('Error obteniendo personas:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Error obteniendo personas', detalle: error.message })
        };
    }
};

// Obtener estadísticas
exports.getEstadisticas = async () => {
    try {
        // Obtener todas las personas
        const personasResult = await dynamodb.send(new ScanCommand({
            TableName: TABLE_NAME
        }));
        const personas = personasResult.Items || [];

        // Obtener todos los líderes
        const lideresResult = await dynamodb.send(new ScanCommand({
            TableName: TABLE_NAME + 'Lideres'
        }));
        const lideres = lideresResult.Items || [];

        // Calcular estadísticas
        const stats = {
            totalPersonas: personas.length,
            totalLideres: lideres.length,
            porMesa: {},
            porLugarVotacion: {}
        };

        personas.forEach(p => {
            if (p.mesa) {
                stats.porMesa[p.mesa] = (stats.porMesa[p.mesa] || 0) + 1;
            }
            if (p.lugarVotacion) {
                stats.porLugarVotacion[p.lugarVotacion] = (stats.porLugarVotacion[p.lugarVotacion] || 0) + 1;
            }
        });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(stats)
        };
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Error obteniendo estadísticas', detalle: error.message })
        };
    }
};
