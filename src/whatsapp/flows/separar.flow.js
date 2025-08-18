// whatsapp/flows/separar.flow.js
const { responderWhatsApp } = require('../core/twilio.helper');
const { ensureSession } = require('../state/session.store');

async function startQueResiduosFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'separar';
  ses.step = 'wair_que_residuos_back';
  const text =
`♻️ Estos son los residuos que podés llevar a cualquier Ecopunto EKOKAI:
✅ Botellas plásticas (tipo PET, sin tapa)
✅ Latas de aluminio (aplastadas y limpias)
✅ Papel blanco sin tinta
✅ Cartón limpio y seco
🟢 Todo debe estar limpio, seco y sin restos de comida ni líquidos.`;
  await responderWhatsApp(toE164, text);
  return true;
}

async function startComoLimpioFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'separar';
  ses.step = 'wair_como_limpio_back';
  const text =
`🧼 Limpiar no significa lavar con detergente. Con estos pasos es suficiente:
1. Enjuagá con un poco de agua si hay restos de comida o bebida.
2. Dejá secar antes de guardarlo.
3. Aplastá los envases para ocupar menos espacio.
4. Quitá tapas y etiquetas si podés.
💡 Un envase limpio asegura que tu reciclaje **cuente y no se pierda**.`;
  await responderWhatsApp(toE164, text);
  return true;
}

async function startQueProhibidosFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'separar';
  ses.step = 'wair_que_prohibidos_back';
  const text =
`🚫 Por ahora, EKOKAI **no acepta** estos residuos en los Ecopuntos:
❌ Vidrios
❌ Pilas o baterías
❌ Residuos electrónicos (celulares, cables, electrodomésticos)
❌ Residuos orgánicos (comida, restos vegetales)
❌ Envases con grasa, restos o mal olor
⚠️ Si un residuo contamina a los demás, **se pierde todo el lote**.
¡Separar bien es cuidar el esfuerzo de todos!`;
  await responderWhatsApp(toE164, text);
  return true;
}

module.exports = {
  startQueResiduosFlow,
  startComoLimpioFlow,
  startQueProhibidosFlow,
};
