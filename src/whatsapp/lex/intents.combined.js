// whatsapp/lex/intents.combined.js
const { normalizarTexto, encontrarMejorCoincidencia } = require('../core/similarity');
const { INTENT_LEX } = require('./intents.cx');
const { LOCAL_LEX } = require('./intents.local');

function buildCombinedLex() {
  const combined = {};
  const intents = new Set([
    ...Object.keys(INTENT_LEX || {}),  // CX primero (prioridad)
    ...Object.keys(LOCAL_LEX)          // Locales después (fallback)
  ]);
  for (const name of intents) {
    const cxIntents = (INTENT_LEX && INTENT_LEX[name]) ? INTENT_LEX[name] : [];
    const localIntents = LOCAL_LEX[name] || [];
    // CX tiene prioridad, locales como fallback
    combined[name] = Array.from(new Set([...cxIntents, ...localIntents]));
  }
  return combined;
}
const COMBINED_LEX = buildCombinedLex();

// Log de intents disponibles al iniciar
console.log('[INTENTS-SETUP] 🎯 Intents de Dialogflow CX disponibles:', Object.keys(INTENT_LEX || {}));
console.log('[INTENTS-SETUP] 🏠 Intents locales disponibles:', Object.keys(LOCAL_LEX || {}));
console.log('[INTENTS-SETUP] 🔗 Intents combinados finales:', Object.keys(COMBINED_LEX));

function inferUnifiedIntent(text) {
  const t = normalizarTexto(text);
  console.log(`[INTENT-DETECTION] Analizando texto: "${text}" → normalizado: "${t}"`);
  
  // PRIMERO: Buscar coincidencias exactas (CX tiene prioridad)
  for (const intent of Object.keys(COMBINED_LEX)) {
    for (const k of COMBINED_LEX[intent]) {
      if (t.includes(normalizarTexto(k))) {
        // Verificar si la coincidencia viene de CX o locales
        const isFromCX = INTENT_LEX && INTENT_LEX[intent] && INTENT_LEX[intent].includes(k);
        const isFromLocal = LOCAL_LEX[intent] && LOCAL_LEX[intent].includes(k);
        
        console.log(`[INTENT-DETECTION] ✅ Coincidencia EXACTA encontrada:`);
        console.log(`  - Intent: "${intent}"`);
        console.log(`  - Palabra clave: "${k}"`);
        console.log(`  - Fuente: ${isFromCX ? 'Dialogflow CX' : isFromLocal ? 'Local' : 'Combinado'}`);
        
        return intent;
      }
    }
  }
  
  // SEGUNDO: Buscar por similitud (CX tiene prioridad)
  for (const intent of Object.keys(COMBINED_LEX)) {
    const got = encontrarMejorCoincidencia(t, COMBINED_LEX[intent], 0.5);
    if (got) {
      // Verificar si la coincidencia por similitud viene de CX o locales
      const isFromCX = INTENT_LEX && INTENT_LEX[intent] && INTENT_LEX[intent].includes(got);
      const isFromLocal = LOCAL_LEX[intent] && LOCAL_LEX[intent].includes(got);
      
      console.log(`[INTENT-DETECTION] 🔍 Coincidencia por SIMILITUD encontrada:`);
      console.log(`  - Intent: "${intent}"`);
      console.log(`  - Palabra clave: "${got}"`);
      console.log(`  - Fuente: ${isFromCX ? 'Dialogflow CX' : isFromLocal ? 'Local' : 'Combinado'}`);
      
      return intent;
    }
  }
  
  console.log(`[INTENT-DETECTION] ❌ No se encontró coincidencia para: "${text}"`);
  return null;
}

module.exports = { COMBINED_LEX, inferUnifiedIntent };
