// whatsapp/flows/ecopunto.flow.js
const { responderWhatsApp } = require('../core/twilio.helper');
const { ensureSession } = require('../state/session.store');
const { ECOPUNTO_ISSUE_PROMPT } = require('./helpers');

async function startEcopuntoUbicacionesFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'ecopunto';
  ses.step = 'wait_back_locations';
  const text =
`📍 Acá tenés el listado de Ecopuntos disponibles en Córdoba:

📍 Ecopunto Nueva Córdoba
📅 Lun a sáb de 9 a 18 hs
📌 Ver en Google Maps → https://maps.google.com/?q=ecopunto+nueva+cordoba

📍 Ecopunto General Paz
📅 Lun a vie de 10 a 17 hs
📌 Ver en Google Maps → https://maps.google.com/?q=ecopunto+general+paz

📍 Ecopunto Villa El Libertador
📅 Mar y jue de 9 a 13 hs
📌 Ver en Google Maps → https://maps.google.com/?q=ecopunto+villa+el+libertador

♻️ ¡Llevá tus residuos limpios y secos!

Escribí "atrás" para volver al menú de Ecopuntos.`;
  await responderWhatsApp(toE164, text);
  return true;
}

async function startEcopuntoHorarioFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'ecopunto';
  ses.step = 'wait_back_horario';
  const text =
`🕓 Estos son los horarios de atención de los Ecopuntos:

📍 Nueva Córdoba: Lun a sáb de 9 a 18 hs
📍 General Paz: Lun a vie de 10 a 17 hs
📍 Villa El Libertador: Mar y jue de 9 a 13 hs

Escribí "atrás" para volver al menú de Ecopuntos.`;
  await responderWhatsApp(toE164, text);
  return true;
}

async function startEcopuntoMaterialesFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'ecopunto';
  ses.step = 'wait_back_materiales';
  const text =
`♻️ En los Ecopuntos podés dejar:
✅ Botellas plásticas (tipo PET)
✅ Latas de aluminio
✅ Cartón limpio y seco
✅ Papel blanco sin tinta

❌ No se reciben:
✖️ Residuos orgánicos
✖️ Vidrios
✖️ Pilas
✖️ Electrónicos

💡 Recordá llevar los materiales limpios, secos y sin bolsas.

Escribí "atrás" para volver al menú de Ecopuntos.`;
  await responderWhatsApp(toE164, text);
  return true;
}

async function startEcopuntoProblemaFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'ecopunto';
  ses.step = 'wait_ecopunto_issue';
  await responderWhatsApp(toE164, ECOPUNTO_ISSUE_PROMPT);
  return true;
}

module.exports = {
  startEcopuntoUbicacionesFlow,
  startEcopuntoHorarioFlow,
  startEcopuntoMaterialesFlow,
  startEcopuntoProblemaFlow,
};
