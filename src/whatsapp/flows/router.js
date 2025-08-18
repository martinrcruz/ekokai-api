// src/whatsapp/flows/router.js
const { ensureSession, resetSession } = require('../state/session.store');
const { normalizarTexto } = require('../core/similarity');
const { inferUnifiedIntent } = require('../lex/intents.combined');
const { responderWhatsApp } = require('../core/twilio.helper');

const {
  sendMenuPrincipal, sendMenuCuponera, sendMenuEcopunto,
  sendMenuHuella, sendMenuFuncionamiento, sendMenuSeparar, sendMenuProblema
} = require('../menus');

const {
  startCanjearQuickFlow, startVerCuponesFlow, startVerCatalogoFlow,
  startComoCanjearFlow, startProblemaCuponFlow
} = require('./cuponera.flow');
const {
  startEcopuntoUbicacionesFlow, startEcopuntoHorarioFlow,
  startEcopuntoMaterialesFlow, startEcopuntoProblemaFlow
} = require('./ecopunto.flow');
const {
  startHuellaMensualFlow, startHuellaAcumuladaFlow,
  startHuellaQueEsFlow, startHuellaMejorarFlow
} = require('./huella.flow');
const {
  startComoParticiparFlow, startQueGanoFlow, startCalculoCuponesFlow
} = require('./funcionamiento.flow');
const {
  startQueResiduosFlow, startComoLimpioFlow, startQueProhibidosFlow
} = require('./separar.flow');
const {
  startProblemaNoVerFlow, startProblemaOtroFlow
} = require('./problema.flow');

const { normalizeDigits, matchPrize, genReqId, encontrarMejorCoincidencia } = require('./helpers');

// --- FIX: umbral correcto para similitud (antes estaba en 5) ---
function detectEcopuntoIssueChoice(text) {
  const t = normalizarTexto(text);
  const d = normalizeDigits(text);
  if (d === '1') return 'A';
  if (d === '2') return 'B';
  if (d === '3') return 'C';
  if (d === '4') return 'D';
  const first = t.trim().charAt(0);
  if (['a', 'b', 'c', 'd'].includes(first)) return first.toUpperCase();

  const A = ['cerrado', 'estaba cerrado', 'no abrieron', 'no estaba abierto'];
  const B = ['me atendieron mal', 'mal trato', 'mala atencion', 'mala atención', 'mal atendido'];
  const C = ['mal estado', 'sucio', 'rota', 'roto', 'no estaba bien', 'peligroso'];
  const D = ['otro problema', 'otro', 'alterno', 'distinto', 'diferente', 'asistente', 'agente', 'hablar con alguien'];

  if (encontrarMejorCoincidencia(t, A, 0.5)) return 'A';
  if (encontrarMejorCoincidencia(t, B, 0.5)) return 'B';
  if (encontrarMejorCoincidencia(t, C, 0.5)) return 'C';
  if (encontrarMejorCoincidencia(t, D, 0.5)) return 'D';
  return null;
}

async function handleMessage(toE164, userMsgRaw) {
  console.log('[FLOW-ROUTER] 🚀 Iniciando handleMessage:', { toE164, userMsgRaw });
  
  const msg = (userMsgRaw || '').trim();
  console.log('[FLOW-ROUTER] 📝 Mensaje procesado:', { original: userMsgRaw, trimmed: msg });
  
  const t = normalizarTexto(msg);
  console.log('[FLOW-ROUTER] 🔤 Texto normalizado:', { original: msg, normalized: t });
  
  const ses = ensureSession(toE164);
  console.log('[FLOW-ROUTER] 💾 Sesión obtenida:', { toE164, session: ses });

  // 👋 Saludos → menú principal directo
  const isSaludo = /^(hola|buenas|buen día|buen dia|hello|hi|hey)\b/i.test(msg);
  console.log('[FLOW-ROUTER] 👋 Detección de saludo:', { msg, isSaludo, pattern: /^(hola|buenas|buen día|buen dia|hello|hi|hey)\b/i });
  
  if (isSaludo) {
    console.log('[FLOW-ROUTER] ✅ Saludo detectado, enviando menú principal');
    await sendMenuPrincipal(toE164);
    return true;
  }

  // 🔢 Atajos numéricos del menú principal (1–6)
  const isNumero = /^[1-6]$/.test(t);
  console.log('[FLOW-ROUTER] 🔢 Detección de número:', { t, isNumero, pattern: /^[1-6]$/ });
  
  if (isNumero) {
    console.log('[FLOW-ROUTER] ✅ Número detectado, procesando opción:', t);
    switch (t) {
      case '1': 
        console.log('[FLOW-ROUTER] 🏷️ Enviando menú cuponera');
        await sendMenuCuponera(toE164);        return true;
      case '2': 
        console.log('[FLOW-ROUTER] ♻️ Enviando menú ecopunto');
        await sendMenuEcopunto(toE164);        return true;
      case '3': 
        console.log('[FLOW-ROUTER] 🌿 Enviando menú huella');
        await sendMenuHuella(toE164);          return true;
      case '4': 
        console.log('[FLOW-ROUTER] ℹ️ Enviando menú funcionamiento');
        await sendMenuFuncionamiento(toE164);  return true;
      case '5': 
        console.log('[FLOW-ROUTER] 🧼 Enviando menú separar');
        await sendMenuSeparar(toE164);         return true;
      case '6': 
        console.log('[FLOW-ROUTER] 🚨 Enviando menú problemas');
        await sendMenuProblema(toE164);        return true;
      default: break;
    }
  }

  console.log(`[ROUTER] 🔍 Detectando intent para: "${msg}"`);
  const inferred = inferUnifiedIntent(t);
  console.log(`[ROUTER] 📋 Intent detectado: "${inferred}"`);

  // salir / volver al menú
  if (inferred === 'menu_volver' || t === 'salir') {
    resetSession(toE164);
    await sendMenuPrincipal(toE164);
    return true;
  }

  // --- Subpasos: cuponera -> elegir premio ---
  if (ses.step === 'wait_prize' && ses.flow === 'canjear' && Array.isArray(ses.prizes)) {
    if (['atras', 'atrás', 'volver'].includes(t) || inferred === 'menu_volver') {
      ses.flow = null; ses.step = 'idle';
      await sendMenuCuponera(toE164);
      return true;
    }
    const prize = matchPrize(msg, ses.prizes);
    if (!prize) {
      await responderWhatsApp(toE164, '❌ No encontré ese premio. Escribí el **número** o el **nombre**, o "atrás" para volver.');
      return true;
    }
    await responderWhatsApp(toE164, `✅ ¡Listo! Canjeaste “${prize.title}”. Te enviamos el QR a tu WhatsApp.`);
    ses.flow = null; ses.step = 'idle';
    return true;
  }

  // --- Subpasos: ecopunto -> elegir A/B/C/D ---
  if (ses.flow === 'ecopunto' && ses.step === 'wait_ecopunto_issue') {
    const choice = detectEcopuntoIssueChoice(msg);
    if (!choice) {
      await responderWhatsApp(toE164, 'No te entendí. Escribí A, B, C o D (o 1–4). Para volver, escribí "atrás".');
      return true;
    }
    const id = genReqId();
    await responderWhatsApp(toE164, `📋 Gracias. Registramos tu reporte (${id}). Revisaremos el Ecopunto y te avisaremos.`);
    ses.flow = null; ses.step = 'idle';
    await sendMenuEcopunto(toE164);
    return true;
  }

  // --- Subpasos: problema no ver -> A/B/C ---
  if (ses.flow === 'problema_nover' && ses.step === 'wait_nover_choice') {
    const d = normalizeDigits(msg);
    let choice = null;
    if (d === '1') choice = 'A';
    if (d === '2') choice = 'B';
    if (d === '3') choice = 'C';
    if (!choice) {
      const first = t.trim().charAt(0);
      if (['a', 'b', 'c'].includes(first)) choice = first.toUpperCase();
    }
    if (!choice) {
      await responderWhatsApp(toE164, 'Decime A, B o C (o 1–3).');
      return true;
    }
    await responderWhatsApp(toE164, '📋 Gracias. Revisaremos tu cuenta y te avisaremos por WhatsApp.');
    ses.flow = null; ses.step = 'idle';
    await sendMenuProblema(toE164);
    return true;
  }

  // --- Subpasos: problema otro -> texto libre ---
  if (ses.flow === 'problema_otro' && ses.step === 'wait_otro_desc') {
    if (['atras', 'atrás', 'volver'].includes(t)) {
      ses.flow = null; ses.step = 'idle';
      await sendMenuProblema(toE164);
      return true;
    }
    const id = genReqId();
    await responderWhatsApp(toE164, `✅ Gracias. Registramos tu reclamo #${id}. Un asistente lo revisará y te contactará.`);
    ses.flow = null; ses.step = 'idle';
    await sendMenuProblema(toE164);
    return true;
  }

  // --- Accesos rápidos por intent ---
  // Cuponera
  if (inferred === 'canjear_cupon')     return startCanjearQuickFlow(toE164);
  if (inferred === 'ver_cupon')         return startVerCuponesFlow(toE164);
  if (inferred === 'ver_catalogo')      return startVerCatalogoFlow(toE164);
  if (inferred === 'como_canjear')      return startComoCanjearFlow(toE164);
  if (inferred === 'problema_cupon')    return startProblemaCuponFlow(toE164);

  // Ecopunto
  if (inferred === 'ubicacion_ecopunto')  return startEcopuntoUbicacionesFlow(toE164);
  if (inferred === 'horario_ecopunto')    return startEcopuntoHorarioFlow(toE164);
  if (inferred === 'materiales_ecopunto') return startEcopuntoMaterialesFlow(toE164);
  if (inferred === 'problema_ecopunto')   return startEcopuntoProblemaFlow(toE164);

  // Huella
  if (inferred === 'menu_huella')         { await sendMenuHuella(toE164); return true; }
  if (inferred === 'huella_mensual')      return startHuellaMensualFlow(toE164);
  if (inferred === 'huella_acumulada')    return startHuellaAcumuladaFlow(toE164);
  if (inferred === 'huella_verde')        return startHuellaQueEsFlow(toE164);
  if (inferred === 'huella_mejorar')      return startHuellaMejorarFlow(toE164);

  // Funcionamiento
  if (inferred === 'menu_funcionamiento') { await sendMenuFuncionamiento(toE164); return true; }
  if (inferred === 'como_participo')      return startComoParticiparFlow(toE164);
  if (inferred === 'que_gano')            return startQueGanoFlow(toE164);
  if (inferred === 'calculo_cupones')     return startCalculoCuponesFlow(toE164);

  // Separar
  if (inferred === 'menu_separar')        { await sendMenuSeparar(toE164); return true; }
  if (inferred === 'que_residuos')        return startQueResiduosFlow(toE164);
  if (inferred === 'como_limpio')         return startComoLimpioFlow(toE164);
  if (inferred === 'que_prohibidos')      return startQueProhibidosFlow(toE164);

  // Problemas
  if (inferred === 'problema' || inferred === 'menu_problema') { await sendMenuProblema(toE164); return true; }
  if (inferred === 'no_ver')              return startProblemaNoVerFlow(toE164);
  if (inferred === 'otro_problema')       return startProblemaOtroFlow(toE164);

  // No se pudo rutear
  console.log('[FLOW-ROUTER] ❌ No se pudo rutear el mensaje:', { msg, t });
  return false;
}

module.exports = { handleMessage };
