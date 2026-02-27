const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'PartidoConservadorPersonas';
const LIDERES_TABLE = TABLE_NAME + 'Lideres';

// Headers CORS estándar
const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// Obtener todos los líderes
exports.getAll = async () => {
    try {
        const result = await dynamodb.scan({
            TableName: LIDERES_TABLE
        }).promise();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(result.Items || [])
        };
    } catch (error) {
        console.error('Error obteniendo líderes:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Error obteniendo líderes', detalle: error.message })
        };
    }
};

// Crear líder
exports.create = async (event) => {
    try {
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

        await dynamodb.put({
            TableName: LIDERES_TABLE,
            Item: nuevoLider
        }).promise();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(nuevoLider)
        };
    } catch (error) {
        console.error('Error creando líder:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Error creando líder', detalle: error.message })
        };
    }
};

// Actualizar líder
exports.update = async (event) => {
    try {
        const id = event.pathParameters.id;
        const body = JSON.parse(event.body);

        // Obtener líder actual
        const current = await dynamodb.get({
            TableName: LIDERES_TABLE,
            Key: { id }
        }).promise();

        if (!current.Item) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Líder no encontrado' })
            };
        }

        // Actualizar
        const updated = {
            ...current.Item,
            ...body,
            id,
            fechaActualizacion: new Date().toISOString()
        };

        await dynamodb.put({
            TableName: LIDERES_TABLE,
            Item: updated
        }).promise();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(updated)
        };
    } catch (error) {
        console.error('Error actualizando líder:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Error actualizando líder', detalle: error.message })
        };
    }
};

// Eliminar líder
exports.delete = async (event) => {
    try {
        const id = event.pathParameters.id;

        await dynamodb.delete({
            TableName: LIDERES_TABLE,
            Key: { id }
        }).promise();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true, message: 'Líder eliminado' })
        };
    } catch (error) {
        console.error('Error eliminando líder:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Error eliminando líder', detalle: error.message })
        };
    }
};
