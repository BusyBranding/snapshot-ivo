// netlify/functions/seranking.js
// Proxies SE Ranking Project API calls for keyword position tracking

const https = require('https');

exports.handler = async (event) => {
  const API_KEY = process.env.SERANKING_API_KEY;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'SE Ranking API key not configured' }) };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch(e) {}

  const { endpoint, params } = body;

  const allowedEndpoints = ['/sites/', '/keywords/', '/stat/', '/rankings/'];

  if (!endpoint || !allowedEndpoints.some(e => endpoint.startsWith(e))) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Endpoint not allowed', endpoint }) };
  }

  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  const url = `https://api4.seranking.com${endpoint}${queryString}`;

  try {
    const data = await fetchJson(url, API_KEY);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function fetchJson(url, apiKey) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'Authorization': `Token ${apiKey}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`Invalid JSON: ${body.slice(0,200)}`)); }
      });
    });
    req.on('error', reject);
  });
}
