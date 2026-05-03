// netlify/functions/seranking.js
// Proxies SE Ranking API calls — keeps API key server-side

const https = require('https');

exports.handler = async (event) => {
  const API_KEY = process.env.SERANKING_API_KEY;

  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'SE Ranking API key not configured' }) };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const { endpoint, params } = JSON.parse(event.body || '{}');

  const allowedEndpoints = [
    '/sites',
    '/keywords/positions',
    '/site/info',
    '/site/ranking-overview',
    '/site/keywords',
    '/reports/visibility',
  ];

  if (!allowedEndpoints.some(e => endpoint && endpoint.startsWith(e))) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Endpoint not allowed' }) };
  }

  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  const url = `https://api4.seranking.com${endpoint}${queryString}`;

  try {
    const data = await fetchJson(url, {
      headers: { 'Authorization': `Token ${API_KEY}` }
    });
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Invalid JSON from SE Ranking')); }
      });
    });
    req.on('error', reject);
  });
}
