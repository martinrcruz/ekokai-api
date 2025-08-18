// src/whatsapp/core/logger.js
function ts() {
  return new Date().toISOString();
}

function mask(value, show = 4) {
  if (!value) return '(null)';
  const s = String(value);
  if (s.length <= show) return '*'.repeat(s.length);
  return s.slice(0, show) + '*'.repeat(Math.max(0, s.length - show));
}

function j(obj) {
  try { return JSON.stringify(obj, null, 2); }
  catch { return String(obj); }
}

function log(...args)  { console.log(`[${ts()}]`, ...args); }
function warn(...args) { console.warn(`[${ts()}] ⚠️`, ...args); }
function error(...args){ console.error(`[${ts()}] ❌`, ...args); }
function debug(...args){ console.debug(`[${ts()}] 🐛`, ...args); }

module.exports = { ts, mask, j, log, warn, error, debug };
