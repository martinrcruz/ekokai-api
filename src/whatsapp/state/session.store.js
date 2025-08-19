// whatsapp/state/session.store.js
const sessionByUser = new Map();

console.log('[SESSION-STORE] 🚀 Inicializando store de sesiones...');

function ensureSession(toE164) {
  
  if (!sessionByUser.has(toE164)) {
    sessionByUser.set(toE164, {
      flow: null,         // dominio: 'canjear' | 'ver' | 'catalogo' | 'huella' | 'ecopunto' ...
      step: 'idle',       // subpasos internos
      coupons: null,
      prizes: null,
      lastMenu: null,
      lastMenuAt: null,
      tmp: {},
      fallbackCount: 0
    });
  } else {
  }
  
  const session = sessionByUser.get(toE164);
  
  return session;
}

function resetSession(toE164) {
  sessionByUser.delete(toE164);

}

function incrementFallbackCount(toE164) {
  const ses = ensureSession(toE164);
  if (typeof ses.fallbackCount !== 'number') ses.fallbackCount = 0;
  ses.fallbackCount += 1;
  return ses.fallbackCount;
}

function resetFallbackCount(toE164) {
  const ses = ensureSession(toE164);
  ses.fallbackCount = 0;
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
  incrementFallbackCount,
  resetFallbackCount,
  setLastMenu,
  isRecentMenu,
};
