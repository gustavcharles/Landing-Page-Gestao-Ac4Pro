const fetch = require('node-fetch');

// URL do seu Google Apps Script (que você já configurou)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUtyyeypmu_aaFsnpi97Nt-EMEYUoReiOHoVSluLAnbXo5b0Am53vzfehoVWxvChzyTw/exec';

exports.handler = async function (event, context) {
    // Apenas aceita POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = event.body;

        // Envia para o Google Apps Script (sem esperar resposta final perfeita)
        // O fetch vai seguir o redirect 302 do Google automaticamente
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        });

        // Retorna 200 OK para o Asaas imediatamente
        // Independente se o Google retornou 200 ou 302
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Webhook received and forwarded" })
        };

    } catch (error) {
        console.error('Erro no proxy:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
