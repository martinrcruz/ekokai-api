// whatsapp/flows/funcionamiento.flow.js
const { responderWhatsApp } = require('../core/twilio.helper');
const { ensureSession } = require('../state/session.store');

async function startComoParticiparFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'funcionamiento';
  ses.step = 'wair_como_participo_back';
  const text =
`♻️ Participar en EKOKAI es fácil:
1. Separá residuos reciclables en tu casa.
2. Lleválos limpios y secos a uno de los Ecopuntos habilitados.
3. Al entregar, indicá tu número de usuario o DNI.
4. Sumás cupones por cada residuo entregado.
🎁 ¡Después podés canjear esos cupones por premios!`;
  await responderWhatsApp(toE164, text);
  return true;
}

async function startQueGanoFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'funcionamiento';
  ses.step = 'wair_que_gano_back';
  const text =
`🎁 Por participar en EKOKAI, ganás:
✅ Cupones y descuentos en comercios locales
✅ Reconocimiento en tu huella verde
✅ Ahorro en tu producción de basura
✅ ¡Y la satisfacción de cuidar el planeta!
🌿 Cuanto más reciclás, más ganás.`;
  await responderWhatsApp(toE164, text);
  return true;
}

async function startCalculoCuponesFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'funcionamiento';
  ses.step = 'wair_calculo_cupones_back';
  const text =
`📏 Cada tipo de residuo tiene un valor en cupones. Por ejemplo:
- 🧃 Botella PET 1.5L = 1 cupón
- 📦 1 kg de cartón = 3 cupones
- 🥫 Lata de aluminio = 2 cupones
🎫 Los cupones acumulados se usan en la Cuponera para canjear premios.`;
  await responderWhatsApp(toE164, text);
  return true;
}

module.exports = {
  startComoParticiparFlow,
  startQueGanoFlow,
  startCalculoCuponesFlow,
};
