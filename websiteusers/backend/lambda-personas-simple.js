const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'PartidoConservadorPersonas';

// Headers CORS estándar
const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// Obtener todas las personas
exports.getAll = async () => {
    try {
        const result = await dynamodb.scan({
            TableName: TABLE_NAME
        }).promise();

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
        const personasResult = await dynamodb.scan({
            TableName: TABLE_NAME
        }).promise();
        const personas = personasResult.Items || [];

        // Obtener todos los líderes
        const lideresResult = await dynamodb.scan({
            TableName: TABLE_NAME + 'Lideres'
        }).promise();
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


// Funciones de validación
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]+$/;
    return phoneRegex.test(phone);
}

// Crear nueva persona
exports.create = async (event) => {
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
        const existingResult = await dynamodb.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'cedula = :cedula',
            ExpressionAttributeValues: {
                ':cedula': body.cedula
            }
        }).promise();

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
            direccionVotacion: body.direccionVotacion || body.direccionLugarVotacion || '',
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

        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: newPersona
        }).promise();

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify({ 
                success: true, 
                persona: newPersona,
                message: 'Persona creada exitosamente'
            })
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
