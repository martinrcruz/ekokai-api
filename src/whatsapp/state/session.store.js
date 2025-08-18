// whatsapp/state/session.store.js
const sessionByUser = new Map();

console.log('[SESSION-STORE] 🚀 Inicializando store de sesiones...');

function ensureSession(toE164) {
  console.log('[SESSION-STORE] 🔍 Buscando sesión para:', toE164);
  
  if (!sessionByUser.has(toE164)) {
    console.log('[SESSION-STORE] 🆕 Creando nueva sesión para:', toE164);
    sessionByUser.set(toE164, {
      flow: null,         // dominio: 'canjear' | 'ver' | 'catalogo' | 'huella' | 'ecopunto' ...
      step: 'idle',       // subpasos internos
      coupons: null,
      prizes: null,
      lastMenu: null,
      lastMenuAt: null,
      tmp: {}
    });
  } else {
    console.log('[SESSION-STORE] 📋 Sesión existente encontrada para:', toE164);
  }
  
  const session = sessionByUser.get(toE164);
  console.log('[SESSION-STORE] 📊 Estado de sesión:', { toE164, session });
  
  return session;
}

function resetSession(toE164) {
  console.log('[SESSION-STORE] 🔄 Reseteando sesión para:', toE164);
  sessionByUser.delete(toE164);
  console.log('[SESSION-STORE] ✅ Sesión reseteada para:', toE164);
}

function setLastMenu(toE164, name) {
  const ses = ensureSession(toE164);
  ses.lastMenu = name;
  ses.lastMenuAt = Date.now();
}

function isRecentMenu(toE164, name, ttlMs = 10 * 60 * 1000) {
  const ses = ensureSession(toE164);
  if (ses.lastMenu !== name) return false;
  if (!ses.lastMenuAt) return false;
  return (Date.now() - ses.lastMenuAt) <= ttlMs;
}

module.exports = {
  ensureSession,
  resetSession,
  setLastMenu,
  isRecentMenu,
};
