// src/controllers/whatsapp.controller.js
const dotenv = require('dotenv');
dotenv.config();

const { log, warn, error, debug, j, mask } = require('../whatsapp/core/logger');

// Router central (Twilio → texto entrante)
const { handleIncomingText } = require('../whatsapp');

// Acciones para CX (cuando venga tag)
const {
  normalizeToE164,
  sendMenuPrincipal,
  sendMenuCuponera,
  sendMenuEcopunto,
  sendMenuHuella,
  sendMenuFuncionamiento,
  sendMenuSeparar,
  sendMenuProblema,
} = require('../whatsapp');

const {
  startCanjearQuickFlow,
  startVerCuponesFlow,
  startVerCatalogoFlow,
  startComoCanjearFlow,
  startProblemaCuponFlow,
} = require('../whatsapp/flows/cuponera.flow');
const {
  startEcopuntoUbicacionesFlow,
  startEcopuntoHorarioFlow,
  startEcopuntoMaterialesFlow,
  startEcopuntoProblemaFlow,
} = require('../whatsapp/flows/ecopunto.flow');
const {
  startHuellaMensualFlow,
  startHuellaAcumuladaFlow,
  startHuellaQueEsFlow,
  startHuellaMejorarFlow,
} = require('../whatsapp/flows/huella.flow');
const {
  startComoParticiparFlow,
  startQueGanoFlow,
  startCalculoCuponesFlow,
} = require('../whatsapp/flows/funcionamiento.flow');
const {
  startQueResiduosFlow,
  startComoLimpioFlow,
  startQueProhibidosFlow,
} = require('../whatsapp/flows/separar.flow');
const {
  startProblemaNoVerFlow,
  startProblemaOtroFlow,
} = require('../whatsapp/flows/problema.flow');

const { buildCxResponse } = require('../whatsapp/core/dfcx.utils');

const DEBUG_TO = process.env.WHATSAPP_DEBUG_TO || ''; // +569...

function respCx(res, msg, params = {}) {
  const out = buildCxResponse(msg, params);
  debug('CX → RESP', j(out));
  return res.status(200).send(out);
}

/**
 * ÚNICA ruta: /webhook/whatsapp
 * - Si el body es de Twilio → enruta a flujos con handleIncomingText
 * - Si el body es de Dialogflow CX → usa tag y ejecuta acción
 */
async function dialogflowWebhook(req, res) {
  console.log('[WEBHOOK-ENTRY] 🚪 === WEBHOOK INICIADO ===');
  console.log('[WEBHOOK-ENTRY] 📅 Timestamp:', new Date().toISOString());
  console.log('[WEBHOOK-ENTRY] 🌐 IP del cliente:', req.ip || req.connection.remoteAddress);
  console.log('[WEBHOOK-ENTRY] 🔗 URL:', req.url);
  console.log('[WEBHOOK-ENTRY] 📋 Método HTTP:', req.method);
  console.log('[WEBHOOK-ENTRY] 📝 Headers:', JSON.stringify(req.headers, null, 2));
  
  res.set('Cache-Control', 'no-store');

  try {
    console.log('[WEBHOOK-ENTRY] 📦 Body recibido:', typeof req.body, req.body);
    debug('Webhook IN → RAW BODY', j(req.body));
    const b = req.body || {};

    // Detectar Twilio (urlencoded con From, Body y Sms/MessageSid)
    console.log('[WEBHOOK-DETECTION] 🔍 === ANÁLISIS DEL WEBHOOK ===');
    console.log('[WEBHOOK-DETECTION] 📊 Contenido completo del body:', JSON.stringify(b, null, 2));
    console.log('[WEBHOOK-DETECTION] 🔑 Claves del body:', Object.keys(b));
    console.log('[WEBHOOK-DETECTION] 📱 Valores específicos:', {
      SmsMessageSid: b.SmsMessageSid,
      MessageSid: b.MessageSid,
      From: b.From,
      Body: b.Body,
      AccountSid: b.AccountSid,
      To: b.To
    });
    
    const isTwilio =
      (typeof b.SmsMessageSid === 'string' && typeof b.From === 'string') ||
      (typeof b.MessageSid === 'string' && typeof b.From === 'string');

    console.log('[WEBHOOK-DETECTION] 🔍 Analizando webhook:', {
      hasSmsMessageSid: typeof b.SmsMessageSid === 'string',
      hasMessageSid: typeof b.MessageSid === 'string', 
      hasFrom: typeof b.From === 'string',
      isTwilio: isTwilio,
      bodyKeys: Object.keys(b)
    });

    if (isTwilio) {
      console.log('[WEBHOOK-TWILIO] 🎉 === TWILIO DETECTADO ===');
      const from = b.From;          // "whatsapp:+569..."
      const body = b.Body || '';
      console.log('[WEBHOOK-TWILIO] 📱 Twilio detectado:', { from, body, bodyLength: body.length });
      console.log('[WEBHOOK-TWILIO] 📊 Detalles completos:', {
        from: from,
        body: body,
        bodyLength: body.length,
        SmsMessageSid: b.SmsMessageSid,
        MessageSid: b.MessageSid,
        AccountSid: b.AccountSid,
        To: b.To,
        timestamp: new Date().toISOString()
      });
      log('→ Twilio DETECTADO', { from, bodyPreview: String(body).slice(0, 80) });

      try {
        console.log(`[WEBHOOK] 🚀 Procesando mensaje de Twilio: "${body}"`);
        console.log('[WEBHOOK] 📤 Llamando a handleIncomingText con:', { from, body });
        const result = await handleIncomingText({ from, body });
        console.log('[WEBHOOK] ✅ handleIncomingText result:', result);
        log('Twilio handled OK →', { from: mask(from), len: body.length });
      } catch (e) {
        console.error('[WEBHOOK] ❌ Error en handleIncomingText:', e);
        error('Twilio handle FAIL:', e?.message);
      }
      return res.status(200).end(); // Twilio solo necesita 200, sin body
    }

    console.log('[WEBHOOK-DETECTION] ❌ === NO ES TWILIO ===');
    console.log('[WEBHOOK-DETECTION] 🔍 Analizando si es Dialogflow CX...');
    console.log('[WEBHOOK-DETECTION] 📊 Body completo (no Twilio):', JSON.stringify(b, null, 2));
    
    // Dialogflow CX (JSON con fulfillmentInfo.tag y sessionInfo.parameters)
    res.set('Content-Type', 'application/json; charset=utf-8');

    console.log('[WEBHOOK-CX] 🔍 === ANALIZANDO DIALOGFLOW CX ===');
    console.log('[WEBHOOK-CX] 📊 fulfillmentInfo:', b.fulfillmentInfo);
    console.log('[WEBHOOK-CX] 📊 sessionInfo:', b.sessionInfo);
    
    const tag = (b.fulfillmentInfo?.tag || '').toLowerCase();
    const cxParams = b?.sessionInfo?.parameters || {};
    const phoneParam = cxParams?.phone || cxParams?.user_phone || null;
    const toRaw = phoneParam || DEBUG_TO || null;
    const to = normalizeToE164(toRaw);

    console.log('[WEBHOOK-CX] 📋 Parámetros extraídos:', {
      tag,
      tagOriginal: b.fulfillmentInfo?.tag,
      cxParams: Object.keys(cxParams || {}),
      phoneParam,
      toRaw,
      toE164: to ? mask(to) : '(null)',
      DEBUG_TO
    });

    log('→ CX DETECTADO', {
      tag,
      params: Object.keys(cxParams || {}),
      toRaw,
      toE164: to ? mask(to) : '(null)',
    });

    if (!tag) {
      console.log('[WEBHOOK-CX] ⚠️ Sin TAG, enviando ack');
      warn('CX sin TAG → ack');
      return respCx(res, 'ack', cxParams);
    }

    const doSend = async (fnName, fn, msg) => {
      console.log('[WEBHOOK-CX] 🚀 Ejecutando acción:', fnName);
      debug('CX acción:', fnName);
      if (to) {
        try { 
          console.log('[WEBHOOK-CX] 📱 Enviando WhatsApp a:', mask(to));
          await fn(to); 
          console.log('[WEBHOOK-CX] ✅ Acción ejecutada exitosamente:', fnName);
          log('CX acción OK:', fnName, '→', mask(to)); 
        }
        catch (e) { 
          console.error('[WEBHOOK-CX] ❌ Error ejecutando acción:', fnName, e);
          error('CX acción FAIL:', fnName, e?.message); 
        }
      } else {
        console.log('[WEBHOOK-CX] ⚠️ Sin número destino, no se enviará WhatsApp');
        warn('CX sin número destino (to). No se enviará WhatsApp.');
      }
      return respCx(res, msg, cxParams);
    };

    switch (tag) {
      case 'menu_principal':
      case 'menu_volver':            return doSend('sendMenuPrincipal', sendMenuPrincipal, 'Menú principal.');
      // Cuponera
      case 'consulta_cupones':       return doSend('sendMenuCuponera', sendMenuCuponera, 'Menú Cuponera.');
      case 'canjear_cupon':          return doSend('startCanjearQuickFlow', startCanjearQuickFlow, 'Premios canjeables.');
      case 'ver_cupon':              return doSend('startVerCuponesFlow', startVerCuponesFlow, 'Cupones activos.');
      case 'ver_catalogo':           return doSend('startVerCatalogoFlow', startVerCatalogoFlow, 'Catálogo.');
      case 'como_canjear':           return doSend('startComoCanjearFlow', startComoCanjearFlow, 'Cómo canjear.');
      case 'problema_cupon':         return doSend('startProblemaCuponFlow', startProblemaCuponFlow, 'Problema cupón.');
      // Ecopunto
      case 'menu_ecopunto':          return doSend('sendMenuEcopunto', sendMenuEcopunto, 'Menú Ecopunto.');
      case 'ubicacion_ecopunto':     return doSend('startEcopuntoUbicacionesFlow', startEcopuntoUbicacionesFlow, 'Ubicaciones.');
      case 'horario_ecopunto':       return doSend('startEcopuntoHorarioFlow', startEcopuntoHorarioFlow, 'Horarios y materiales.');
      case 'materiales_ecopunto':    return doSend('startEcopuntoMaterialesFlow', startEcopuntoMaterialesFlow, 'Materiales aceptados.');
      case 'problema_ecopunto':      return doSend('startEcopuntoProblemaFlow', startEcopuntoProblemaFlow, 'Problema Ecopunto.');
      // Huella
      case 'menu_huella':            return doSend('sendMenuHuella', sendMenuHuella, 'Menú Huella Verde.');
      case 'huella_mensual':         return doSend('startHuellaMensualFlow', startHuellaMensualFlow, 'Huella mensual.');
      case 'huella_acumulada':       return doSend('startHuellaAcumuladaFlow', startHuellaAcumuladaFlow, 'Huella acumulada.');
      case 'huella_verde':           return doSend('startHuellaQueEsFlow', startHuellaQueEsFlow, 'Qué es la huella verde.');
      case 'huella_mejorar':         return doSend('startHuellaMejorarFlow', startHuellaMejorarFlow, 'Mejorar huella.');
      // Funcionamiento
      case 'menu_funcionamiento':    return doSend('sendMenuFuncionamiento', sendMenuFuncionamiento, 'Menú funcionamiento.');
      case 'como_participo':         return doSend('startComoParticiparFlow', startComoParticiparFlow, 'Cómo participar.');
      case 'que_gano':               return doSend('startQueGanoFlow', startQueGanoFlow, 'Qué gano.');
      case 'calculo_cupones':        return doSend('startCalculoCuponesFlow', startCalculoCuponesFlow, 'Cálculo cupones.');
      // Separar residuos
      case 'menu_separar':           return doSend('sendMenuSeparar', sendMenuSeparar, 'Menú separar residuos.');
      case 'que_residuos':           return doSend('startQueResiduosFlow', startQueResiduosFlow, 'Residuos aceptados.');
      case 'como_limpio':            return doSend('startComoLimpioFlow', startComoLimpioFlow, 'Cómo limpiar.');
      case 'que_prohibidos':         return doSend('startQueProhibidosFlow', startQueProhibidosFlow, 'Residuos NO aceptados.');
      // Problemas
      case 'problema':               return doSend('sendMenuProblema', sendMenuProblema, 'Menú problemas.');
      case 'no_ver':                 return doSend('startProblemaNoVerFlow', startProblemaNoVerFlow, 'Qué no podés ver.');
      case 'otro_problema':          return doSend('startProblemaOtroFlow', startProblemaOtroFlow, 'Describe el problema.');

      default:
        console.log('[WEBHOOK-CX] ❓ TAG desconocido:', tag);
        warn('CX TAG desconocido → ack:', tag);
        return respCx(res, 'ack', cxParams);
    }
  } catch (err) {
    console.error('[WEBHOOK-ERROR] ❌ === ERROR EN WEBHOOK ===');
    console.error('[WEBHOOK-ERROR] 📊 Error completo:', err);
    console.error('[WEBHOOK-ERROR] 📝 Mensaje de error:', err?.message);
    console.error('[WEBHOOK-ERROR] 🔍 Stack trace:', err?.stack);
    
    error('Webhook FAIL:', err?.message, j(err));
    if (req.headers['content-type']?.includes('application/json')) {
      return respCx(res, 'error', {});
    }
    return res.sendStatus(200);
  }
}

module.exports = { dialogflowWebhook };
