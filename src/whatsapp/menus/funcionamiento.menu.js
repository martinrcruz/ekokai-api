// whatsapp/menus/funcionamiento.menu.js
const { responderWhatsApp, responderWhatsAppTemplate } = require('../core/twilio.helper');
const { setLastMenu } = require('../state/session.store');

const MENU_FUNCIONAMIENTO_SID = process.env.TWILIO_CONTENT_SID_MENU_FUNCIONAMIENTO || '';

async function sendMenuFuncionamiento(toE164) {
  if (!MENU_FUNCIONAMIENTO_SID) {
    await responderWhatsApp(
      toE164,
      '🧾 EKOKAI premia a quienes separan residuos y los llevan a Ecopuntos.\n\n' +
      '1️⃣ ¿Cómo participo?\n' +
      '2️⃣ ¿Qué gano?\n' +
      '3️⃣ ¿Qué residuos debo llevar?\n' +
      '4️⃣ ¿Cuánto vale cada residuo?\n' +
      '✍ Escribí el número o el nombre de la opción.'
    );
  } else {
    const ok = await responderWhatsAppTemplate(toE164, MENU_FUNCIONAMIENTO_SID);
    if (!ok) await responderWhatsApp(toE164, 'Abriste: Cómo funciona. (No se pudo enviar el template)');
  }
  setLastMenu(toE164, 'funcionamiento');
}

module.exports = { sendMenuFuncionamiento };
