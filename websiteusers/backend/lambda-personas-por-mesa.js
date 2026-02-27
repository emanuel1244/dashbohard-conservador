// AWS SDK v3 para Node.js 18
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const dynamodb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'PartidoConservadorPersonas';

const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
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
        // Obtener número de mesa de los path parameters
        const numeroMesa = event.pathParameters?.numeroMesa;

        // Validar que se proporcionó el número de mesa
        if (!numeroMesa) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Número de mesa requerido',
                    message: 'Debe proporcionar un número de mesa válido'
                })
            };
        }

        // Validar formato del número de mesa (solo números y letras)
        if (!/^[a-zA-Z0-9]+$/.test(numeroMesa)) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Formato de mesa inválido',
                    message: 'El número de mesa solo puede contener letras y números'
                })
            };
        }

        console.log('Consultando personas para mesa:', numeroMesa);

        // Consultar personas de la mesa en DynamoDB
        const result = await dynamodb.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'mesa = :mesa',
            ExpressionAttributeValues: {
                ':mesa': numeroMesa
            }
        }));

        const personas = result.Items || [];
        
        // Determinar lugar de votación común (si todos tienen el mismo)
        let lugarVotacionComun = null;
        if (personas.length > 0) {
            const primerLugar = personas[0].lugarVotacion;
            const todosIguales = personas.every(p => p.lugarVotacion === primerLugar);
            if (todosIguales && primerLugar) {
                lugarVotacionComun = primerLugar;
            }
        }

        // Construir respuesta
        const response = {
            mesa: numeroMesa,
            totalPersonas: personas.length,
            lugarVotacion: lugarVotacionComun,
            personas: personas.map(p => ({
                id: p.id || '',
                nombre: p.nombre || '',
                cedula: p.cedula || '',
                celular: p.celular || '',
                correo: p.correo || '',
                mesa: p.mesa || '',
                lugarVotacion: p.lugarVotacion || '',
                direccionVotacion: p.direccionVotacion || '',
                liderId: p.liderId || '',
                liderNombre: p.liderNombre || '',
                estado: p.estado || '',
                nivelCompromiso: p.nivelCompromiso || ''
            }))
        };

        console.log(`Encontradas ${personas.length} personas para mesa ${numeroMesa}`);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('Error consultando personas por mesa:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                message: 'No se pudo consultar las personas de la mesa',
                detalle: error.message
            })
        };
    }
};
