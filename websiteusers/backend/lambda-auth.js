// AWS SDK v3 para Node.js 18
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'PartidoConservadorPersonas';
const LIDERES_TABLE = TABLE_NAME + 'Lideres';

const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

// Función simple para generar token (en producción usar JWT real)
function generarToken(lider) {
    const payload = {
        id: lider.id,
        cedula: lider.cedula,
        nombre: lider.nombre,
        timestamp: Date.now()
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verificarToken(token) {
    try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        // Verificar que el token no tenga más de 24 horas
        const horasTranscurridas = (Date.now() - payload.timestamp) / (1000 * 60 * 60);
        if (horasTranscurridas > 24) {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}

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
        const path = event.path;
        const method = event.httpMethod;

        // POST /auth/login - Login de líder
        if (method === 'POST' && path.includes('/login')) {
            const body = JSON.parse(event.body);
            const { cedula, password } = body;

            if (!cedula || !password) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Cédula y contraseña son requeridos' })
                };
            }

            // Buscar líder por cédula
            const result = await dynamodb.send(new ScanCommand({
                TableName: LIDERES_TABLE,
                FilterExpression: 'cedula = :cedula',
                ExpressionAttributeValues: {
                    ':cedula': cedula
                }
            }));

            if (!result.Items || result.Items.length === 0) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Cédula no encontrada' })
                };
            }

            const lider = result.Items[0];

            // Validar password (últimos 4 dígitos de la cédula)
            const ultimos4 = cedula.slice(-4);
            if (password !== ultimos4) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Contraseña incorrecta' })
                };
            }

            // Generar token
            const token = generarToken(lider);

            // Obtener personas asignadas
            const personasResult = await dynamodb.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: 'liderId = :liderId',
                ExpressionAttributeValues: {
                    ':liderId': lider.id
                }
            }));

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    success: true,
                    token,
                    lider: {
                        id: lider.id,
                        nombre: lider.nombre,
                        cedula: lider.cedula,
                        celular: lider.celular,
                        correo: lider.correo,
                        zona: lider.zona,
                        personasAsignadas: personasResult.Items?.length || 0
                    }
                })
            };
        }

        // GET /auth/verify - Verificar token
        if (method === 'GET' && path.includes('/verify')) {
            const authHeader = event.headers.Authorization || event.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Token no proporcionado' })
                };
            }

            const token = authHeader.substring(7);
            const payload = verificarToken(token);

            if (!payload) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Token inválido o expirado' })
                };
            }

            // Obtener datos actualizados del líder
            const result = await dynamodb.send(new ScanCommand({
                TableName: LIDERES_TABLE,
                FilterExpression: 'id = :id',
                ExpressionAttributeValues: {
                    ':id': payload.id
                }
            }));

            if (!result.Items || result.Items.length === 0) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Líder no encontrado' })
                };
            }

            const lider = result.Items[0];

            // Obtener personas asignadas
            const personasResult = await dynamodb.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: 'liderId = :liderId',
                ExpressionAttributeValues: {
                    ':liderId': lider.id
                }
            }));

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({
                    valid: true,
                    lider: {
                        id: lider.id,
                        nombre: lider.nombre,
                        cedula: lider.cedula,
                        celular: lider.celular,
                        correo: lider.correo,
                        zona: lider.zona,
                        personasAsignadas: personasResult.Items?.length || 0
                    }
                })
            };
        }

        // GET /auth/mis-personas - Obtener personas del líder autenticado
        if (method === 'GET' && path.includes('/mis-personas')) {
            const authHeader = event.headers.Authorization || event.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Token no proporcionado' })
                };
            }

            const token = authHeader.substring(7);
            const payload = verificarToken(token);

            if (!payload) {
                return {
                    statusCode: 401,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Token inválido o expirado' })
                };
            }

            // Obtener personas asignadas
            const result = await dynamodb.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: 'liderId = :liderId',
                ExpressionAttributeValues: {
                    ':liderId': payload.id
                }
            }));

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(result.Items || [])
            };
        }

        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Ruta no encontrada' })
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
