// src/whatsapp/router/handler.js
const { normalizeToE164 } = require('../core/twilio.helper');
const { sendMenuPrincipal } = require('../menus');
const { handleMessage } = require('../flows/router'); // ← CAMBIO CLAVE
const { log, warn, error, debug, mask } = require('../core/logger');

async function handleIncomingText({ from, body }) {
  console.log('[ROUTER-HANDLER] 🚀 Iniciando handleIncomingText:', { from, body });
  
  const toE164 = normalizeToE164(from);
  console.log('[ROUTER-HANDLER] 📱 Número normalizado:', { from, toE164, isNull: toE164 === null });
  
  const text = String(body || '').trim();
  console.log('[ROUTER-HANDLER] 📝 Texto procesado:', { originalBody: body, processedText: text, textLength: text.length });

  log('[Router] IN', { from: mask(from), toE164: mask(toE164), text });

  if (!toE164) {
    console.log('[ROUTER-HANDLER] ❌ Número inválido, no se puede responder');
    warn('[Router] from inválido, no se puede responder:', from);
    return { ok: false, reason: 'invalid-from' };
  }

  if (!text) {
    console.log('[ROUTER-HANDLER] 📭 Sin texto, enviando menú principal');
    debug('[Router] sin texto → menú principal');
    await sendMenuPrincipal(toE164);
    return { ok: true, routed: 'menu_principal' };
  }

  try {
    console.log('[ROUTER-HANDLER] 🔍 Llamando a handleMessage:', { toE164, text });
    const routed = await handleMessage(toE164, text);
    console.log('[ROUTER-HANDLER] 📋 handleMessage result:', routed);
    debug('[Router] handleMessage result:', routed);

    if (!routed) {
      console.log('[ROUTER-HANDLER] ⚠️ No se pudo rutear, enviando menú principal como fallback');
      warn('[Router] no se pudo rutear, enviando menú principal como fallback');
      await sendMenuPrincipal(toE164);
      return { ok: true, routed: 'fallback_menu_principal' };
    }

    console.log('[ROUTER-HANDLER] ✅ Mensaje rutado exitosamente');
    return { ok: true, routed: 'handled' };
  } catch (e) {
    console.error('[ROUTER-HANDLER] ❌ Error en handleMessage:', e);
    error('[Router] error en handleMessage:', e?.message);
    try { await sendMenuPrincipal(toE164); } catch (e2) { error('[Router] fallback menu error:', e2?.message); }
    return { ok: false, reason: 'exception' };
  }
}

module.exports = { handleIncomingText };
