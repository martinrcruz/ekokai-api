// whatsapp/twilio/client.js
const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_NUMBER,       // 'whatsapp:+1XXXXXXXXXX'
  TWILIO_MESSAGING_SERVICE_SID, // opcional
} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
  const from = TWILIO_WHATSAPP_NUMBER;
  const to = toWhatsAppAddr(toE164);

  console.log('📤 Enviando mensaje con Twilio...');
  console.log('🔢 From:', from);
  console.log('🔢 To:', to);
  console.log('💬 Mensaje:', body);

  if (!from || !from.startsWith('whatsapp:')) {
    throw new Error('TWILIO_WHATSAPP_NUMBER debe iniciar con "whatsapp:"');
  }
  if (!to) throw new Error('Número destino inválido. Debe ser +E164 o whatsapp:+E164');

  const params = { from, to, body };
  if (TWILIO_MESSAGING_SERVICE_SID) {
    params.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  }

  const msg = await client.messages.create(params);
  console.log('✅ Mensaje enviado. SID:', msg.sid);
  return msg;
}

async function responderWhatsAppTemplate(toE164, contentSid, variables = null) {
  const from = TWILIO_WHATSAPP_NUMBER;
  const to = toWhatsAppAddr(toE164);

  console.log('📤 Enviando TEMPLATE con Twilio...');
  console.log('🔢 From:', from);
  console.log('🔢 To:', to);
  console.log('🧾 contentSid:', contentSid);
  if (variables) console.log('🧩 variables:', variables);

  if (!from || !from.startsWith('whatsapp:')) {
    throw new Error('TWILIO_WHATSAPP_NUMBER debe iniciar con "whatsapp:"');
  }
  if (!to) throw new Error('Número destino inválido. Debe ser +E164 o whatsapp:+E164');
  if (!contentSid || !/^HX[a-zA-Z0-9]{32}$/.test(contentSid)) {
    throw new Error('Content SID inválido. Debe iniciar con "HX" y tener 34 caracteres.');
  }

  const payload = { from, to, contentSid };
  if (TWILIO_MESSAGING_SERVICE_SID) payload.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  if (variables && typeof variables === 'object') payload.contentVariables = JSON.stringify(variables);

  const msg = await client.messages.create(payload);
  console.log('✅ Template enviado. SID:', msg.sid);
  return msg;
}

module.exports = {
  normalizeToE164,
  toWhatsAppAddr,
  responderWhatsApp,
  responderWhatsAppTemplate,
};
