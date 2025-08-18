// src/whatsapp/menus/principal.menu.js
const { responderWhatsApp, responderWhatsAppTemplate } = require('../core/twilio.helper');
const { shouldSend } = require('../core/anti-spam');
const { log } = require('../core/logger');

const CONTENT_SID_MENU = process.env.TWILIO_CONTENT_SID_MENU_PRINCIPAL || ''; // HX...

async function sendMenuPrincipal(toE164) {
  console.log('[MENU-PRINCIPAL] 🚀 Iniciando envío de menú principal:', { toE164 });
  
  const canSend = shouldSend(toE164, 'menu_principal', 5000);
  console.log('[MENU-PRINCIPAL] 🔒 Anti-spam check:', { toE164, canSend });
  
  if (!canSend) {
    console.log('[MENU-PRINCIPAL] ⏰ Anti-spam bloqueó el envío');
    return null;
  }

  if (CONTENT_SID_MENU) {
    console.log('[MENU-PRINCIPAL] 🧾 Usando template:', { contentSid: CONTENT_SID_MENU });
    log('[MENU] principal → template');
    return responderWhatsAppTemplate(toE164, CONTENT_SID_MENU);
  }

  console.log('[MENU-PRINCIPAL] 📝 Usando texto plano');
  log('[MENU] principal → texto');
  const txt =
    '👋 ¡Hola! Soy EKOKAI.\n' +
    'Elige una opción:\n' +
    '1) 🏷️ Cuponera\n' +
    '2) ♻️ Ecopunto\n' +
    '3) 🌿 Huella Verde\n' +
    '4) ℹ️ Cómo funciona\n' +
    '5) 🧼 Separar residuos\n' +
    '6) 🚨 Problemas';
  
  console.log('[MENU-PRINCIPAL] 📤 Llamando a responderWhatsApp con texto');
  return responderWhatsApp(toE164, txt);
}

module.exports = { sendMenuPrincipal };
