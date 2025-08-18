// whatsapp/menus/problema.menu.js
const { responderWhatsApp, responderWhatsAppTemplate } = require('../core/twilio.helper');
const { setLastMenu } = require('../state/session.store');

const MENU_PROBLEMA_SID = process.env.TWILIO_CONTENT_SID_MENU_PROBLEMA || '';

async function sendMenuProblema(toE164) {
  if (!MENU_PROBLEMA_SID) {
    await responderWhatsApp(
      toE164,
      '⚠️ Tuve un problema\n' +
      '1️⃣ Problema con cupón\n' +
      '2️⃣ Problema en Ecopunto\n' +
      '3️⃣ No puedo ver mis datos (cupones/huella)\n' +
      '4️⃣ Otro problema\n' +
      '✍ Escribí el número o el nombre de la opción.'
    );
  } else {
    const ok = await responderWhatsAppTemplate(toE164, MENU_PROBLEMA_SID);
    if (!ok) await responderWhatsApp(toE164, 'Abriste: Problemas. (No se pudo enviar el template)');
  }
  setLastMenu(toE164, 'problema');
}

module.exports = { sendMenuProblema };
