// netlify/functions/gsc.js
// Proxies Google Search Console API calls using a service account

const https = require('https');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!SERVICE_ACCOUNT) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Google service account not configured' }) };
  }

  const { siteUrl, startDate, endDate, dimensions, rowLimit } = JSON.parse(event.body || '{}');

  if (!siteUrl) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'siteUrl required' }) };
  }

  try {
    const credentials = JSON.parse(SERVICE_ACCOUNT);
    const token = await getAccessToken(credentials);

    const requestBody = {
      startDate: startDate || getDateDaysAgo(90),
      endDate: endDate || getDateDaysAgo(1),
      dimensions: dimensions || ['query'],
      rowLimit: rowLimit || 25,
      dataState: 'final',
    };

    const encodedUrl = encodeURIComponent(siteUrl);
    const apiUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedUrl}/searchAnalytics/query`;

    const data = await postJson(apiUrl, requestBody, token);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const jwt = await createJWT(payload, credentials.private_key);

  const tokenData = await postForm('https://oauth2.googleapis.com/token', {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  return tokenData.access_token;
}

function createJWT(payload, privateKey) {
  const { createSign } = require('crypto');
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signing = `${header}.${body}`;
  const sign = createSign('RSA-SHA256');
  sign.update(signing);
  const signature = sign.sign(privateKey, 'base64url');
  return `${signing}.${signature}`;
}

function postJson(url, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Invalid JSON from GSC')); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function postForm(url, params) {
  return new Promise((resolve, reject) => {
    const data = new URLSearchParams(params).toString();
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Invalid JSON from token endpoint')); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
