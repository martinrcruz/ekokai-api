// src/whatsapp/router/handler.js
const { normalizeToE164 } = require('../core/twilio.helper');
const { sendMenuPrincipal } = require('../menus');
const { handleMessage } = require('../flows/router'); // ← CAMBIO CLAVE
const { log, warn, error, debug, mask } = require('../core/logger');

async function handleIncomingText({ from, body }) {
  
  const toE164 = normalizeToE164(from);
  
  const text = String(body || '').trim();

  log('[Router] IN', { from: mask(from), toE164: mask(toE164), text });

  if (!toE164) {
    warn('[Router] from inválido, no se puede responder:', from);
    return { ok: false, reason: 'invalid-from' };
  }

  if (!text) {
    debug('[Router] sin texto → menú principal');
    await sendMenuPrincipal(toE164);
    return { ok: true, routed: 'menu_principal' };
  }

  try {
    const routed = await handleMessage(toE164, text);
    debug('[Router] handleMessage result:', routed);

    if (!routed) {
      warn('[Router] no se pudo rutear, enviando menú principal como fallback');
      await sendMenuPrincipal(toE164);
      return { ok: true, routed: 'fallback_menu_principal' };
    }

    return { ok: true, routed: 'handled' };
  } catch (e) {
    error('[Router] error en handleMessage:', e?.message);
    try { await sendMenuPrincipal(toE164); } catch (e2) { error('[Router] fallback menu error:', e2?.message); }
    return { ok: false, reason: 'exception' };
  }
}

module.exports = { handleIncomingText };
