// AWS SDK v3 para Node.js 18
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'PartidoConservadorPersonas';
const LIDERES_TABLE = TABLE_NAME + 'Lideres';

const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

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

        // GET /lideres/{id}/personas - Obtener personas del líder
        if (method === 'GET' && event.pathParameters?.id && path.includes('/personas')) {
            const liderId = event.pathParameters.id;
            const result = await dynamodb.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: 'liderId = :liderId',
                ExpressionAttributeValues: {
                    ':liderId': liderId
                }
            }));
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(result.Items || [])
            };
        }

        // GET /lideres/{id} - Obtener un líder específico
        if (method === 'GET' && event.pathParameters?.id) {
            const id = event.pathParameters.id;
            const result = await dynamodb.send(new GetCommand({
                TableName: LIDERES_TABLE,
                Key: { id }
            }));
            if (!result.Item) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Líder no encontrado' })
                };
            }
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(result.Item)
            };
        }

        // GET /lideres - Obtener todos
        if (method === 'GET') {
            const result = await dynamodb.send(new ScanCommand({
                TableName: LIDERES_TABLE
            }));
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(result.Items || [])
            };
        }

        // POST /lideres - Crear
        if (method === 'POST') {
            const body = JSON.parse(event.body);
            const nuevoLider = {
                id: `lider-${Date.now()}`,
                nombre: body.nombre,
                cedula: body.cedula,
                celular: body.celular,
                correo: body.correo,
                zona: body.zona,
                personasAsignadas: 0,
                fechaCreacion: new Date().toISOString()
            };
            await dynamodb.send(new PutCommand({
                TableName: LIDERES_TABLE,
                Item: nuevoLider
            }));
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(nuevoLider)
            };
        }

        // PUT /lideres/{id} - Actualizar
        if (method === 'PUT' && event.pathParameters?.id) {
            const id = event.pathParameters.id;
            const body = JSON.parse(event.body);
            const current = await dynamodb.send(new GetCommand({
                TableName: LIDERES_TABLE,
                Key: { id }
            }));
            if (!current.Item) {
                return {
                    statusCode: 404,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Líder no encontrado' })
                };
            }
            const updated = {
                ...current.Item,
                ...body,
                id,
                fechaActualizacion: new Date().toISOString()
            };
            await dynamodb.send(new PutCommand({
                TableName: LIDERES_TABLE,
                Item: updated
            }));
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(updated)
            };
        }

        // DELETE /lideres/{id} - Eliminar
        if (method === 'DELETE' && event.pathParameters?.id) {
            const id = event.pathParameters.id;
            await dynamodb.send(new DeleteCommand({
                TableName: LIDERES_TABLE,
                Key: { id }
            }));
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ success: true, message: 'Líder eliminado' })
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

// Obtener personas asignadas a un líder
exports.getPersonas = async (event) => {
    try {
        const liderId = event.pathParameters.id;

        // Buscar todas las personas que tienen este líder asignado
        const result = await dynamodb.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'liderId = :liderId',
            ExpressionAttributeValues: {
                ':liderId': liderId
            }
        }));

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result.Items || [])
        };
    } catch (error) {
        console.error('Error obteniendo personas del líder:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Error obteniendo personas del líder', detalle: error.message })
        };
    }
};
