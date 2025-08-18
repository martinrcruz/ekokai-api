// whatsapp/menus/ecopunto.menu.js
const { responderWhatsApp, responderWhatsAppTemplate } = require('../core/twilio.helper');
const { setLastMenu } = require('../state/session.store');

const MENU_ECOPUNTO_SID = process.env.TWILIO_CONTENT_SID_MENU_ECOPUNTO || '';

async function sendMenuEcopunto(toE164) {
  if (!MENU_ECOPUNTO_SID) {
    await responderWhatsApp(
      toE164,
      '📍 Menú Ecopuntos\n' +
      '1️⃣ Ubicaciones\n' +
      '2️⃣ Materiales/horarios\n' +
      '3️⃣ Materiales aceptados\n' +
      '4️⃣ Reportar problema\n' +
      'Escribí el número o el nombre. "Atrás" para volver.'
    );
  } else {
    const ok = await responderWhatsAppTemplate(toE164, MENU_ECOPUNTO_SID);
    if (!ok) await responderWhatsApp(toE164, 'Abriste: Ecopuntos. (No se pudo enviar el template)');
  }
  setLastMenu(toE164, 'ecopunto');
}

module.exports = { sendMenuEcopunto };
