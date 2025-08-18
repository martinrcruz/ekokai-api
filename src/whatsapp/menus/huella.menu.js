// whatsapp/menus/huella.menu.js
const { responderWhatsApp, responderWhatsAppTemplate } = require('../core/twilio.helper');
const { setLastMenu } = require('../state/session.store');

const MENU_HUELLA_SID = process.env.TWILIO_CONTENT_SID_MENU_HUELLA || '';

async function sendMenuHuella(toE164) {
  if (!MENU_HUELLA_SID) {
    await responderWhatsApp(
      toE164,
      '🌱 Información sobre tu Huella Verde. ¿Qué querés consultar?\n\n' +
      '1️⃣ Tu huella verde de este mes 📆\n' +
      '2️⃣ Tu huella total acumulada 📊\n' +
      '3️⃣ ¿Qué es la huella verde? ❓\n' +
      '4️⃣ ¿Cómo puedo mejorarla? 💡\n\n' +
      '✍ Escribí el número o el nombre de la opción.'
    );
  } else {
    const ok = await responderWhatsAppTemplate(toE164, MENU_HUELLA_SID);
    if (!ok) await responderWhatsApp(toE164, 'Abriste: Mi Huella Verde. (No se pudo enviar el template)');
  }
  setLastMenu(toE164, 'huella');
}

module.exports = { sendMenuHuella };
