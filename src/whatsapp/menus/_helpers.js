// whatsapp/menus/_helpers.js
const { responderWhatsApp, responderWhatsAppTemplate } = require('../twilio/client');

const TWILIO_FROM = process.env.TWILIO_WHATSAPP_NUMBER || '';

let _setLastMenu = null;
function bindSetLastMenu(fn) { _setLastMenu = fn; }
function markVisited(toE164, name) { if (_setLastMenu) _setLastMenu(toE164, name); }

async function sendMenuText(toE164, text) {
  if (!TWILIO_FROM || !TWILIO_FROM.startsWith('whatsapp:')) {
    console.log('⚠️ [Twilio] TWILIO_WHATSAPP_NUMBER no configurado o sin prefijo "whatsapp:"');
    return;
  }
  console.log(`📲 [Twilio] Enviando MENÚ (texto) a ${toE164}…`);
  await responderWhatsApp(toE164, text);
}

async function sendTemplate(toE164, contentSid, variables = null) {
  if (!contentSid) {
    console.log('⚠️ [Twilio] contentSid vacío. No se envía template.');
    return false;
  }
  try {
    console.log(`📲 [Twilio] Enviando TEMPLATE a ${toE164} (contentSid=${contentSid})…`);
    await responderWhatsAppTemplate(toE164, contentSid, variables);
    return true;
  } catch (e) {
    console.error('❌ [Twilio] Error enviando template:', e?.message);
    return false;
  }
}

module.exports = { bindSetLastMenu, markVisited, sendMenuText, sendTemplate };
