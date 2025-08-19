// whatsapp/lex/intents.combined.js
const { normalizarTexto, encontrarMejorCoincidencia, calcularSimilitud } = require('../core/similarity');
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

// Ranking para resolver conflictos entre intents generales (menús) y específicos
function intentRank(intent) {
  const ranks = {
    // Cuponera
    ver_cupon: 10,
    canjear_cupon: 10,
    como_canjear: 11,
    ver_catalogo: 12,
    calculo_cupones: 13,
    consulta_cupones: 99,

    // Ecopunto
    ubicacion_ecopunto: 10,
    horario_ecopunto: 11,
    materiales_ecopunto: 12,
    problema_ecopunto: 13,
    menu_ecopunto: 99,

    // Huella
    huella_mensual: 10,
    huella_acumulada: 11,
    huella_verde: 12,
    huella_mejorar: 13,
    menu_huella: 99,

    // Funcionamiento / Participar / Premios
    como_participo: 10,
    que_gano: 11,
    menu_funcionamiento: 99,

    // Separar
    que_residuos: 10,
    como_limpio: 11,
    que_prohibidos: 12,
    menu_separar: 99,

    // Problemas
    no_ver: 5,
    menu_problema: 10,
    otro_problema: 11,
    problema: 20,
  };
  return ranks[intent] !== undefined ? ranks[intent] : 50;
}

function applyHeuristics(text, intent, baseScore) {
  let score = baseScore;
  const has = (re) => re.test(text);

  // Preferir "no_ver" cuando hay negaciones visuales
  if (intent === 'no_ver' && has(/\b(no veo|no aparecen|no me muestra|no puedo ver)\b/)) score += 0.5;

  // "como ... canj*" → preferir como_canjear vs canjear_cupon
  if (intent === 'como_canjear' && has(/^(como|cómo)\b.*\b(canj|cupon|cuponera|premio)\b/)) score += 0.5;
  if (intent === 'canjear_cupon' && has(/^(como|cómo)\b.*\b(canj|cupon|cuponera|premio)\b/)) score -= 0.3;

  // Ubicación ecopunto: palabras guía
  if (intent === 'ubicacion_ecopunto' && has(/\b(donde|dónde|ubic|mapa|direccion|dire|cerca|llegar|ubi)\b/)) score += 0.5;
  if (intent === 'menu_ecopunto' && has(/\b(donde|dónde|ubic|mapa|direccion|dire|cerca|llegar|ubi)\b/)) score -= 0.3;

  // Horario: evitar que "ahora" sin contexto empuje horario
  if (intent === 'horario_ecopunto') {
    const hasTimeWord = has(/\b(horario|hora|abren|cierran|hasta que hora|abren hoy|feriad)\b/);
    const onlyAhora = has(/\bahora\b/) && !has(/\bhora\b/);
    if (!hasTimeWord && onlyAhora) score -= 0.4;
    // Si no hay palabras de tiempo y sí hay de materiales, penalizar horario
    if (!hasTimeWord && has(/\b(material|materiales|reciben|aceptan|se puede|recicla|latas|vidrio|plastico|papel|carton)\b/)) score -= 0.5;
  }

  // Materiales vs prohibidos con negación
  if (intent === 'que_prohibidos' && has(/\b(no (reciben|aceptan)|prohibid|no se puede|que no|no puedo llevar)\b/)) score += 0.5;
  if (intent === 'materiales_ecopunto' && has(/\b(no (reciben|aceptan)|prohibid|no se puede|que no|no puedo llevar)\b/)) score -= 0.3;

  // Materiales vs que_residuos: preferir materiales cuando la frase habla de materiales/lista/reciclaje
  if (intent === 'materiales_ecopunto' && has(/\b(material(es)?|lista|reciclaje|se puede llevar|que se puede)\b/)) score += 0.6;
  if (intent === 'que_residuos' && has(/\b(material(es)?|lista|reciclaje|se puede llevar|que se puede)\b/)) score -= 0.4;
  // Si menciona materiales concretos, favorecer materiales
  if (intent === 'materiales_ecopunto' && has(/\b(vidrio|plastico|plástico|papel|carton|cartón|lata|latas|botella|botellas|tetra|telgopor|styrofoam)\b/)) score += 0.5;
  // Frase "que va y que no va" → materiales (no exclusivamente prohibidos)
  if (has(/\bque va y que no va\b/)) {
    if (intent === 'materiales_ecopunto') score += 0.6;
    if (intent === 'que_prohibidos') score -= 0.4;
  }

  // Ver cupones: expresiones frecuentes
  if (intent === 'ver_cupon' && has(/\b(ver|mostrar|mostrame|abrir|lista|listado)\b.*\b(cupon(es)?|cuponera|premios?)\b/)) score += 0.9;
  if (intent === 'consulta_cupones' && has(/\b(ver|mostrar|mostrame|abrir|lista|listado)\b.*\b(cupon(es)?|cuponera|premios?)\b/)) score -= 0.6;
  if (intent === 'ver_cupon' && has(/\b(me queda(n)?|que tengo|disponible|tengo)\b.*\b(cupon(es)?|premios?)\b/)) score += 0.6;
  if (intent === 'consulta_cupones' && has(/\b(me queda(n)?|que tengo|disponible|tengo)\b.*\b(cupon(es)?|premios?)\b/)) score -= 0.5;

  // Huella: kilos/impacto/mes
  if (intent === 'menu_huella' && has(/\b(kg|kilos|impacto)\b/)) score += 0.6;
  if (intent === 'huella_mensual' && has(/\b(este mes|mensual|del mes|mes)\b/)) score += 1.0;
  if (intent === 'menu_huella' && has(/\b(este mes|mensual|del mes|mes)\b/)) score -= 0.4;

  return score;
}

function inferUnifiedIntent(text) {
  const t = normalizarTexto(text);
  console.log(`[INTENT-DETECTION] Analizando texto: "${text}" → normalizado: "${t}"`);

  // Utilidad: escapar claves para regex
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Early-exit: saludos / chitchat
  const isChitChat = (
    /^e+h+$/i.test(t) ||
    /(\b|^)(hola|buen dia|buen dia|buenas|hello|hi|hey)(\b|$)/.test(t) ||
    /(\b|^)(que onda|qué onda|todo bien|como va|estas ahi|estás ahi)(\b|$)/.test(t)
  );
  const domainHint = /(\b|^)(cupon|cupones|premio|catalog|ecopunto|punto verde|huella|impacto|recicla|material|residuo|horario|ubica|direccion|mapa|problema|queja|reclamo)(\b|$)/;
  if (!t || (isChitChat && !domainHint.test(t))) {
    return null;
  }

  // Recorremos TODOS los intents y nos quedamos con el mejor puntaje
  let best = { intent: null, score: 0, key: null };

  for (const intent of Object.keys(COMBINED_LEX)) {
    const keys = COMBINED_LEX[intent] || [];
    let localBest = 0;
    let localKey = null;

    for (const k of keys) {
      const nk = normalizarTexto(k);

      // Exact match por palabra/frontera: prefiera coincidencias largas
      const pattern = new RegExp(`(^|\\W)${escapeRegex(nk)}(\\W|$)`);
      let score = 0;
      if (nk && pattern.test(t)) {
        score = 2.0 + Math.min(nk.length, 100) / 100; // 2.00 – 3.00
      } else {
        // Similitud fuzzy
        const sim = calcularSimilitud(t, nk);
        score = sim; // 0 – 1
      }

      if (score > localBest) {
        localBest = score;
        localKey = nk;
      }
    }

    // Heurísticas de ajuste por contexto
    const adjusted = applyHeuristics(t, intent, localBest);

    if (
      adjusted > best.score + 0.001 ||
      (Math.abs(adjusted - best.score) <= 0.001 && intentRank(intent) < intentRank(best.intent))
    ) {
      best = { intent, score: adjusted, key: localKey };
    }
  }

  // Umbral mínimo para aceptar un intent
  if (!best.intent || best.score < 0.6) {
    console.log(`[INTENT-DETECTION] ❌ No se encontró coincidencia aceptable para: "${text}"`);
    return null;
  }

  return best.intent;
}

module.exports = { COMBINED_LEX, inferUnifiedIntent };
