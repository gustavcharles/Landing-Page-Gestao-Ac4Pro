const https = require('https');

exports.handler = async function (event, context) {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
        const PROMOTIONAL_LINK_ID = process.env.PROMOTIONAL_LINK_ID;
        const MAX_VACANCIES = parseInt(process.env.MAX_PROMOTIONAL_VACANCIES || '50');

        if (!ASAAS_API_KEY || !PROMOTIONAL_LINK_ID) {
            throw new Error('Missing required environment variables');
        }

        // Query Asaas API for subscriptions related to the promotional link
        const subscriptionCount = await getSubscriptionCount(ASAAS_API_KEY, PROMOTIONAL_LINK_ID);

        // Calculate remaining vacancies
        const remainingVacancies = Math.max(0, MAX_VACANCIES - subscriptionCount);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                totalVacancies: MAX_VACANCIES,
                soldCount: subscriptionCount,
                remainingVacancies: remainingVacancies,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Error fetching vacancies:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch vacancy data',
                message: error.message
            })
        };
    }
};

/**
 * Get subscription count from Asaas API
 */
function getSubscriptionCount(apiKey, linkId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.asaas.com',
            path: `/v3/subscriptions?paymentLink=${linkId}&status=ACTIVE`,
            method: 'GET',
            headers: {
                'access_token': apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'Netlify-Function'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);

                    if (res.statusCode === 200) {
                        // Asaas returns totalCount in the response
                        const count = response.totalCount || 0;
                        resolve(count);
                    } else {
                        reject(new Error(`Asaas API error: ${res.statusCode} - ${data}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse Asaas response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });

        req.end();
    });
}
