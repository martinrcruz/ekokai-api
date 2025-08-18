// whatsapp/flows/problema.flow.js
const { responderWhatsApp } = require('../core/twilio.helper');
const { ensureSession } = require('../state/session.store');

async function startProblemaNoVerFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'problema_nover';
  ses.step = 'wait_nover_choice';
  const txt =
`🔒 ¿Qué datos no podés ver?
A. Mis cupones
B. Mi huella verde
C. Otra información

✍ Escribí A, B o C (también podés usar 1–3).`;
  await responderWhatsApp(toE164, txt);
  return true;
}

async function startProblemaOtroFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'problema_otro';
  ses.step = 'wait_otro_desc';
  const txt =
`📝 Contame brevemente qué ocurrió y lo derivaremos a un asistente humano.
📆 Registraremos tu reclamo con fecha y lo analizaremos. Gracias por tu paciencia.`;
  await responderWhatsApp(toE164, txt);
  return true;
}

module.exports = {
  startProblemaNoVerFlow,
  startProblemaOtroFlow,
};
