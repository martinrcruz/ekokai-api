// src/whatsapp/core/anti-spam.js
const { log } = require('./logger');

const last = new Map(); // key: to|tag → timestamp

function shouldSend(toE164, tag, windowMs = 5000) {
  const key = `${toE164}|${tag}`;
  const now = Date.now();
  const prev = last.get(key) || 0;
  const timeSince = now - prev;
  
 
  
  if (timeSince < windowMs) {
    console.log('[ANTI-SPAM] ⏰ Bloqueado por anti-spam:', { toE164, tag, timeSince, windowMs });
    log('[DEDUP] skip', { toE164, tag, sinceMs: timeSince });
    return false;
  }
  
  last.set(key, now);
  return true;
}

module.exports = { shouldSend };
