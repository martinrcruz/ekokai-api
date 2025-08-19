// src/whatsapp/core/twilio.helper.js
const twilio = require('twilio');
const { log, warn, error, debug, j, mask } = require('./logger');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_NUMBER,       // 'whatsapp:+...'
  TWILIO_MESSAGING_SERVICE_SID, // opcional
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  warn('Twilio env faltantes:',
    'TWILIO_ACCOUNT_SID?', !!TWILIO_ACCOUNT_SID,
    'TWILIO_AUTH_TOKEN?', !!TWILIO_AUTH_TOKEN
  );
}
if (!TWILIO_WHATSAPP_NUMBER) {
  warn('TWILIO_WHATSAPP_NUMBER no está seteado (debe ser "whatsapp:+NNNN...").');
}

let client;
try {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  log('Twilio client init OK. SID:', mask(TWILIO_ACCOUNT_SID));
} catch (e) {
  error('Error creando cliente Twilio:', e?.message);
}

function normalizeToE164(raw) {
  if (!raw) return null;
  let n = String(raw).trim();
  if (n.startsWith('whatsapp:')) n = n.replace(/^whatsapp:/, '');
  if (/^\+\d{6,15}$/.test(n)) return n;
  if (/^\d{6,15}$/.test(n)) return `+${n}`;
  return null;
}

function toWhatsAppAddr(e164) {
  const n = String(e164 || '').trim();
  if (!n) return null;
  if (n.startsWith('whatsapp:')) return n;
  if (/^\+\d{6,15}$/.test(n)) return `whatsapp:${n}`;
  return null;
}

async function responderWhatsApp(toE164, body) {
  
  log('WA: enviar texto →', { toE164: mask(toE164), hasBody: !!body, bodyLen: String(body || '').length });

  const from = TWILIO_WHATSAPP_NUMBER;
  const to = toWhatsAppAddr(toE164);
  
 
  
  debug('WA params:', { from, to, bodyPreview: String(body).slice(0, 60) });

  if (!from || !from.startsWith('whatsapp:')) {
    const msg = 'TWILIO_WHATSAPP_NUMBER debe iniciar con "whatsapp:"';
    error(msg); throw new Error(msg);
  }
  if (!to) {
    const msg = 'Número destino inválido. Debe ser +E164 o whatsapp:+E164';
    error(msg, { toE164 }); throw new Error(msg);
  }

  const params = { from, to, body };
  if (TWILIO_MESSAGING_SERVICE_SID) params.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;

  try {
    const resp = await client.messages.create(params);
    log('WA OK (texto). SID:', resp?.sid, 'to:', mask(toE164));
    return resp;
  } catch (e) {
    console.error('[TWILIO-HELPER] ❌ Error enviando mensaje:', e);
    error('WA FAIL (texto):', e?.message, j(e?.moreInfo || e));
    throw e;
  }
}

async function responderWhatsAppTemplate(toE164, contentSid, variables = null) {
  log('WA: enviar template →', { toE164: mask(toE164), contentSid, hasVars: !!variables });

  const from = TWILIO_WHATSAPP_NUMBER;
  const to = toWhatsAppAddr(toE164);

  if (!from || !from.startsWith('whatsapp:')) {
    const msg = 'TWILIO_WHATSAPP_NUMBER debe iniciar con "whatsapp:"';
    error(msg); throw new Error(msg);
  }
  if (!to) {
    const msg = 'Número destino inválido (+E164).';
    error(msg, { toE164 }); throw new Error(msg);
  }
  if (!contentSid || !/^HX[a-zA-Z0-9]{32}$/.test(contentSid)) {
    const msg = 'Content SID inválido. Debe iniciar con "HX" y tener 34 caracteres.';
    error(msg, { contentSid }); throw new Error(msg);
  }

  const payload = { from, to, contentSid };
  if (TWILIO_MESSAGING_SERVICE_SID) payload.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  if (variables && typeof variables === 'object') payload.contentVariables = JSON.stringify(variables);

  try {
    const resp = await client.messages.create(payload);
    log('WA OK (template). SID:', resp?.sid, 'to:', mask(toE164));
    return resp;
  } catch (e) {
    error('WA FAIL (template):', e?.message, j(e?.moreInfo || e));
    throw e;
  }
}

module.exports = {
  normalizeToE164,
  responderWhatsApp,
  responderWhatsAppTemplate,
  toWhatsAppAddr,
};
