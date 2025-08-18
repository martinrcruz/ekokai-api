// whatsapp/menus/cuponera.menu.js
const { responderWhatsApp, responderWhatsAppTemplate } = require('../core/twilio.helper');
const { setLastMenu } = require('../state/session.store');

const MENU_CUPONERA_SID = process.env.TWILIO_CONTENT_SID_MENU_CUPONERA || '';

async function sendMenuCuponera(toE164) {
  if (!MENU_CUPONERA_SID) {
    await responderWhatsApp(
      toE164,
      '🎁 Menú Cuponera y Canjes\n' +
      '1) Canjear\n2) Ver cupones\n3) Ver catálogo\n4) ¿Cómo canjear?\n5) Problemas con cupón\n' +
      'Escribí el número o el nombre. "Atrás" para volver.'
    );
  } else {
    const ok = await responderWhatsAppTemplate(toE164, MENU_CUPONERA_SID);
    if (!ok) await responderWhatsApp(toE164, 'Abriste: Cuponera y Canjes. (No se pudo enviar el template)');
  }
  setLastMenu(toE164, 'cuponera');
}

module.exports = { sendMenuCuponera };
