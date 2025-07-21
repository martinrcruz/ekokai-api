// scripts/get-access-token.js
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

async function getAccessToken() {
  try {
    const keyPath = path.join(__dirname, '..', 'keys', 'service-account.json');
    console.log('📁 Verificando existencia de archivo JSON en:', keyPath);

    if (!fs.existsSync(keyPath)) {
      throw new Error('Archivo de cuenta de servicio no encontrado');
    }

    const rawContent = fs.readFileSync(keyPath, 'utf8');
    const rawKey = JSON.parse(rawContent);

    // 🚨 Corregimos el formato de la clave privada
    rawKey.private_key = rawKey.private_key.replace(/\\n/g, '\n');

    console.log('🔑 client_email:', rawKey.client_email);
    console.log('🔐 private_key presente:', !!rawKey.private_key);

    const jwtClient = new google.auth.JWT({
      email: rawKey.client_email,
      key: rawKey.private_key,
      scopes: ['https://www.googleapis.com/auth/dialogflow']
    });

    console.log('🔄 Autenticando con JWT...');
    const tokens = await jwtClient.authorize();

    console.log('✅ Access Token:', tokens.access_token);
  } catch (err) {
    console.error('❌ Error al obtener token:', err.message);
  }
}

getAccessToken();
