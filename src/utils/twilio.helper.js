// utils/twilio.helper.js
const twilio = require('twilio');
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_NUMBER,       // Debe ser 'whatsapp:+123...'
  TWILIO_MESSAGING_SERVICE_SID, // opcional
} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Normaliza +E164 -> 'whatsapp:+E164'
function toWhatsAppAddr(e164OrWhats) {
  if (!e164OrWhats) return null;
  let n = String(e164OrWhats).trim();
  if (n.startsWith('whatsapp:')) return n;
  // aceptar +E164 o E164 y anteponer whatsapp:
  if (/^\+\d{6,15}$/.test(n)) return `whatsapp:${n}`;
  if (/^\d{6,15}$/.test(n)) return `whatsapp:+${n}`;
  return null;
}

async function responderWhatsApp(to, body) {
  const from = TWILIO_WHATSAPP_NUMBER; // debe iniciar con 'whatsapp:'
  const toAddr = toWhatsAppAddr(to);

  if (!from || !from.startsWith('whatsapp:')) {
    throw new Error('TWILIO_WHATSAPP_NUMBER debe iniciar con "whatsapp:"');
  }
  if (!toAddr) {
    throw new Error('Número destino inválido. Debe ser +E164 o whatsapp:+E164');
  }

  const params = { from, to: toAddr, body };
  if (TWILIO_MESSAGING_SERVICE_SID) {
    params.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  }
  return client.messages.create(params);
}

async function responderWhatsAppTemplate(to, contentSid, variables = null) {
  const from = TWILIO_WHATSAPP_NUMBER; // 'whatsapp:+...'
  const toAddr = toWhatsAppAddr(to);

  if (!from || !from.startsWith('whatsapp:')) {
    throw new Error('TWILIO_WHATSAPP_NUMBER debe iniciar con "whatsapp:"');
  }
  if (!toAddr) {
    throw new Error('Número destino inválido. Debe ser +E164 o whatsapp:+E164');
  }
  if (!contentSid || !/^HX[a-zA-Z0-9]{32}$/.test(contentSid)) {
    throw new Error('Content SID inválido. Debe iniciar con "HX" y tener 34 caracteres.');
  }

  const params = { from, to: toAddr, contentSid };
  if (variables && typeof variables === 'object') {
    params.contentVariables = JSON.stringify(variables);
  }
  if (TWILIO_MESSAGING_SERVICE_SID) {
    params.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  }
  return client.messages.create(params);
}

module.exports = {
  responderWhatsApp,
  responderWhatsAppTemplate,
};
