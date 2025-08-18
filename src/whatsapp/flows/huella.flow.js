// whatsapp/flows/huella.flow.js
const { responderWhatsApp } = require('../core/twilio.helper');
const { ensureSession } = require('../state/session.store');
const { mockGetHuellaMensual, mockGetHuellaAcumulada } = require('./helpers');

async function startHuellaMensualFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'huella';
  ses.step = 'wait_huella_mensual_back';

  const data = mockGetHuellaMensual();
  const txt =
`🌱 Tu Huella Verde — ${data.periodo}
• ♻️ Reciclaste: ${data.kgMes} kg
• 🛍️ Bolsas equivalentes evitadas: ${data.bolsasEquivalentes}
• 🗓️ Visitas a Ecopunto: ${data.visitasEcopunto}

Escribí "atrás" para volver al menú de Huella Verde.`;
  await responderWhatsApp(toE164, txt);
  return true;
}

async function startHuellaAcumuladaFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'huella';
  ses.step = 'wait_huella_total_back';

  const data = mockGetHuellaAcumulada();
  const txt =
`📈 Desde que te uniste a EKOKAI, reciclaste ${data.kgTotal} kg en total ♻️

Escribí "atrás" para volver al menú de Huella Verde.`;
  await responderWhatsApp(toE164, txt);
  return true;
}

async function startHuellaQueEsFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'huella';
  ses.step = 'wait_huella_info_back';

  const txt =
`🌱 La huella verde es una forma de medir el impacto ambiental positivo que generás al reciclar.
Se calcula según la cantidad de materiales que llevás a los Ecopuntos, su tipo y frecuencia.
Cuanto más constante y responsable seas, mayor será tu huella.

Escribí "atrás" para volver al menú de Huella Verde.`;
  await responderWhatsApp(toE164, txt);
  return true;
}

async function startHuellaMejorarFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'huella';
  ses.step = 'wait_huella_mejorar_back';

  const txt =
`💡 Para mejorar tu huella verde:
✅ Reciclá semanalmente
✅ Llevá los materiales limpios y secos
✅ Sumá nuevos materiales: papel, cartón, latas
✅ Enseñá a otros a reciclar con vos
🌿 Cada acción suma al cuidado del planeta.

Escribí "atrás" para volver al menú de Huella Verde.`;
  await responderWhatsApp(toE164, txt);
  return true;
}

module.exports = {
  startHuellaMensualFlow,
  startHuellaAcumuladaFlow,
  startHuellaQueEsFlow,
  startHuellaMejorarFlow,
};
