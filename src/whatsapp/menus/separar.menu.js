// whatsapp/menus/separar.menu.js
const { responderWhatsApp, responderWhatsAppTemplate } = require('../core/twilio.helper');
const { setLastMenu } = require('../state/session.store');

const MENU_SEPARACION_SID = process.env.TWILIO_CONTENT_SID_MENU_SEPARACION || '';

async function sendMenuSeparar(toE164) {
  if (!MENU_SEPARACION_SID) {
    await responderWhatsApp(
      toE164,
      '🔄 Cómo separar residuos\n' +
      '1️⃣ ¿Qué residuos aceptan?\n' +
      '2️⃣ ¿Cómo los limpio?\n' +
      '3️⃣ ¿Qué residuos NO aceptan?\n' +
      '✍ Escribí el número o el nombre de la opción.'
    );
  } else {
    const ok = await responderWhatsAppTemplate(toE164, MENU_SEPARACION_SID);
    if (!ok) await responderWhatsApp(toE164, 'Abriste: Cómo separar residuos. (No se pudo enviar el template)');
  }
  setLastMenu(toE164, 'separar');
}

module.exports = { sendMenuSeparar };
