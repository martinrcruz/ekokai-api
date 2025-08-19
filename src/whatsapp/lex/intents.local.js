// whatsapp/lex/intents.local.js

// =====================
// Debug helpers
// =====================
const INTENT_DEBUG = process.env.INTENT_DEBUG === '1' || process.env.INTENT_DEBUG === 'true';

function ts() { return new Date().toISOString(); }
function dlog(tag, obj) {
  if (!INTENT_DEBUG) return;
  try {
    const payload = typeof obj === 'string' ? obj : JSON.stringify(obj);
    console.log(`[INTENTS][${ts()}][${tag}] ${payload}`);
  } catch {
    console.log(`[INTENTS][${ts()}][${tag}] (unserializable)`);
  }
}

// ---------- Helpers de normalización ----------
const STOPWORDS_CBA = [
  'che','e','eh','eee','bue','buee','ok','oka','dale',
  'culiau','culiao','ñeri','loco','loca','guaso','guasa','amigo','amiga',
  'ma','pa','po','viste','boludo','boluda','re','alto','mal','posta'
];

const RE_EMOJIS = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu;
const RE_ALARGUES = /(.)\1{2,}/g;
const RE_DIACRITICS = /\p{Diacritic}/gu;

function normalizeMsg(s) {
  if (!s) return '';
  const before = s;
  const after = s
    .toLowerCase()
    .normalize('NFD').replace(RE_DIACRITICS, '')
    .replace(RE_EMOJIS, ' ')
    .replace(RE_ALARGUES, '$1')
    .replace(/[.,;:!?()[\]{}"'`´~@#$%^&*_+=<>\/\\|-]/g, ' ')
    .replace(/\b(porque)\b/g, 'xq')
    .replace(/\b(para)\b/g, 'pa')
    .replace(/\b(estas|esta)\b/g, 'ta')
    .replace(new RegExp(`\\b(${STOPWORDS_CBA.join('|')})\\b`, 'g'), ' ')
    .replace(/\s+/g, ' ')
    .trim();

  dlog('normalizeMsg', { before, after });
  return after;
}

function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ========= Saluditos / chitchat (early exit) =========
const GREET_PATTERNS = [
  /\b(hola|buen dia|buenas|hello|hi|hey)\b/,
  /\b(que onda|todo bien|como va|estas ahi|estas ahi)\b/,
  /^e+h*$/i, // "eee", "eeeeh"
];

function isChitChat(text) {
  return GREET_PATTERNS.some((re) => re.test(text));
}

// ====================================================
// LÉXICO LOCAL
// ====================================================
const LOCAL_LEX = {
  // CUPONERA
  canjear_cupon: [
    'canjear cupon','canjear','quiero canjear','canje directo','canjear ahora',
    'premio','regalo','canjear premio','activar cupon','usar cupon',
    'metele al canje','lo canjeo','hacer el canje','canjear ya','canjeame este',
    'canjear cuponera','canje al toque','canje ahora',
  ],
  ver_cupon: [
    'ver cupon','ver cupones','mis cupones','cupones activos','cupones vigentes','vigentes',
    'activos','ver mis cupones activos','mis premios','mis canjes',
    'que cupones tengo','que me queda','que tengo disponible',
    'mostrar cupones','abrir cuponera','ver cuponera'
  ],
  ver_catalogo: [
    'catalogo','catalogo completo','ver catalogo','lista de premios','listado','premios',
    'todos los cupones','todos los premios','ver todos los premios','ver todos los cupones',
    'que hay pa canjear','que hay en el catalogo','mostrame el catalogo','cataloguito'
  ],
  como_canjear: [
    'como se canjea','q se canjea','que tengo q hacer','paso a paso','que pasos seguir',
    'instrucciones','como hago','me guias','proceso de canje','como canjear',
    'como uso la cuponera','como activar cupon','explicame el canje',
    'como es el canje','como canjeo esto'
  ],
  problema_cupon: [
    'no funciona','problema','no reconoce','error','no sirve','no valido','vencido',
    'no acepta','no aplica','no reconoce el qr','no funciona el qr','no me llego',
    'no anda','se rompio','me tira error','no pude canjear','no aparece el cupon',
    'no me toma el cupon'
  ],

  // ECOPUNTOS
  ubicacion_ecopunto: [
    'ubicacion','donde','donde quedan','queda','esta','ubicados',
    'encuentro','encontrar','mapa','direccion','punto verde','puntos verdes',
    'donde puedo llevar','cual me queda cerca','por donde estan','ubicacion ecopunto'
  ],
  horario_ecopunto: [
    'horario','horarios','a que hora','cuando abren','cuando cierran',
    'materiales','material','que reciben','reciclaje','que se puede llevar',
    'hasta que hora atienden','abre hoy','horario ecopunto'
  ],
  materiales_ecopunto: [
    'materiales','material','que reciben','aceptan','que aceptan',
    'residuos','que no reciben','que se puede llevar','pueden latas',
    'aceptan vidrio','aceptan plastico','aceptan papel','lista de materiales'
  ],
  problema_ecopunto: [
    'problema','queja','reclamo','reporte','reportar','me atendieron mal',
    'estaba cerrado','mal estado','no funcionaba','malo','hablar con alguien',
    'asistente','agente','reportar ecopunto','sucio','colapsado'
  ],

  // HUELLA
  menu_huella: [
    'mi huella','huella verde','huellita','mi impacto','mi reciclaje',
    'cuanto recicle','cuanto llevo','cuanta basura junte','estadisticas huella',
    'mis kilos','mis kg','ver mi huella'
  ],
  huella_mensual: [
    'huella mensual','este mes','de este mes','kg este mes','kilos este mes',
    'cuanto recicle este mes','cuanto junte este mes','mi huella del mes',
    'lo de este mes'
  ],
  huella_acumulada: [
    'huella total','total acumulada','acumulada','suma total','mi total',
    'cuanto llevo en total','todo lo reciclado','kg acumulados','kilos acumulados',
    'mi total de kg','total total'
  ],
  huella_verde: [
    'que es la huella','que significa la huella','que es la huella verde',
    'significado huella','definicion huella','explicame huella','explicacion huella'
  ],
  huella_mejorar: [
    'como mejorar mi huella','consejos huella','tips huella','mejorar huella',
    'como la mejoro','que hacer para mejorar la huella','recomendaciones huella',
    'como sumar mas kg','como reciclar mejor'
  ],

  // FUNCIONAMIENTO / PARTICIPAR / PREMIOS / CÁLCULO
  menu_funcionamiento: [
    'como funciona','que es ekokai','significado','de que se trata',
    'como labura esto','explicame ekokai'
  ],
  como_participo: [
    'como puedo participar','como puedo ayudar','como ayudar a ekokai',
    'como ganar cupones','como se calculan los cupones','como arranco',
    'quiero sumarme','como participo'
  ],
  que_gano: [
    'que gano','que premios','que puedo ganar','que puedo ganar con ekokai',
    'que beneficios','que me llevo'
  ],
  calculo_cupones: [
    'como calculan los cupones','cuanto vale un cupon','cuanto acumulo',
    'cuanto puedo acumular','como sumo cupones','como me dan los cupones'
  ],

  // SEPARAR / LIMPIAR / PROHIBIDOS
  menu_separar: [
    'como separar','como limpiar','que residuos','como clasificar',
    'como se separa','como se limpia','como separamos'
  ],
  que_residuos: [
    'que residuos aceptan','aceptan','correctos','que va y que no',
    'que entra','que puedo llevar'
  ],
  como_limpio: [
    'como limpio','como limpiar','como lavar','como dejo listo',
    'como preparo los residuos','como tengo que limpiar','como tengo que lavar',
    'como se limpian los envases','como enjuagar'
  ],
  que_prohibidos: [
    'que residuos no aceptan','prohibidos','incorrectos','que no va',
    'que no recibe el ecopunto','que no puedo llevar','que no reciben','no aceptan'
  ],

  // PROBLEMAS
  problema: [
    'problema','reclamo','queja','tuve un problema','no carga','no anda',
    'se colgo','me crashea','necesito ayuda','ayuda'
  ],
  menu_problema: [
    'reportar problema','necesito ayuda','no veo mis datos','no veo mis cupones',
    'no veo mi huella','tengo un drama','ayuda'
  ],
  no_ver: [
    'no veo','no puedo ver','no aparecen','no aparecen mis cupones',
    'no veo mis cupones','no veo mi huella','no veo mis datos','no me muestra'
  ],
  otro_problema: [
    'otro problema','ninguna de las opciones','algo diferente','algo distinto',
    'otra cosa','no es eso'
  ]
};

// ====================================================
// Scoring / Desambiguaciones
// ====================================================
const INTENT_PRIORITY = [
  'canjear_cupon','ver_cupon','ver_catalogo',
  'como_canjear','problema_cupon',
  'materiales_ecopunto','horario_ecopunto','ubicacion_ecopunto','problema_ecopunto',
  'huella_mensual','huella_acumulada','huella_mejorar','huella_verde','menu_huella',
  'calculo_cupones','como_participo','que_gano','menu_funcionamiento',
  'que_prohibidos','como_limpio','que_residuos','menu_separar',
  'no_ver','menu_problema','problema','otro_problema'
];

function baseLexScore(text, intent) {
  const phrases = LOCAL_LEX[intent] || [];
  let score = 0;
  const reasons = [];

  for (const p of phrases) {
    const norm = normalizeMsg(p);
    if (!norm) continue;
    const re = new RegExp(`\\b${escapeReg(norm)}\\b`);
    if (re.test(text)) { score += 3; reasons.push(`lex:exact:${norm}`); }
    else if (text.includes(norm)) { score += 1; reasons.push(`lex:substr:${norm}`); }
  }
  return { score, reasons };
}

function keywordBoosts(text, intent) {
  let score = 0; const reasons = [];

  // --- Cuponera
  if (intent === 'ver_cupon') {
    if (/\b(ver|mostrar|mostrame|abrir|lista?r?)\b.*\b(cupon(es)?|cuponera|premios?)\b/.test(text)) {
      score += 6; reasons.push('boost:ver_cupon:ver/mostrar+cupon(es)|premios');
    }
    if (/\b(me queda(n)?|que tengo|disponible|tengo)\b.*\b(cupon(es)?|premios?)\b/.test(text)) {
      score += 5; reasons.push('boost:ver_cupon:que_tengo/me_queda');
    }
  }
  if (intent === 'canjear_cupon') {
    if (/\b(canj(e|ea|eo|eamos)?|usar|activar|validar|redim(ir)?)\b/.test(text)) {
      score += 3; reasons.push('boost:canjear_cupon:canj*|usar|activar|validar');
    }
    if (/^como\b|^cómo\b/.test(text)) {
      score -= 2; reasons.push('penalty:canjear_cupon:prefiere_como_canjear');
    }
  }
  if (intent === 'como_canjear') {
    if (/^como\b|^cómo\b/.test(text) && /\b(canj|cupon|cuponera|premio)\b/.test(text)) {
      score += 5; reasons.push('boost:como_canjear:pregunta_como+canje');
    }
  }
  if (intent === 'ver_catalogo') {
    if (/\b(catalog|lista|listado|muestrario|todos los premios|todos los cupones)\b/.test(text)) {
      score += 4; reasons.push('boost:ver_catalogo:catalog|lista|listado|todos');
    }
  }

  // --- Ecopunto
  if (intent === 'ubicacion_ecopunto') {
    if (/\b(donde|dónde|ubic|mapa|direccion|dire|cerca|como llegar|ubi)\b/.test(text)) {
      score += 5; reasons.push('boost:ubicacion:ubicacion|mapa|direccion|cerca');
    }
  }
  if (intent === 'horario_ecopunto') {
    if (/\b(horario|hora|abren|cierran|hasta que hora|abren hoy|feriad)\b/.test(text)) {
      score += 4; reasons.push('boost:horario:horario|abren|cierran');
    }
    // anti-falso positivo por "ahora"
    if (/\bahora\b/.test(text) && !/\bhora\b/.test(text)) {
      score -= 4; reasons.push('penalty:horario:palabra_ahora');
    }
  }
  if (intent === 'materiales_ecopunto') {
    if (/\b(material(es)?|reciben|aceptan|se puede llevar|reciclar|latas|vidrio|plastico|papel|carton)\b/.test(text)) {
      score += 3; reasons.push('boost:materiales:lista/reciben/aceptan');
    }
    if (/\b(no (reciben|aceptan)|prohibid|no se puede|que no)\b/.test(text)) {
      score -= 2; reasons.push('penalty:materiales:negacion_detectada');
    }
  }
  if (intent === 'que_prohibidos') {
    if (/\b(no (reciben|aceptan)|prohibid|no se puede|que no|no puedo llevar)\b/.test(text)) {
      score += 6; reasons.push('boost:prohibidos:negacion/prohibidos');
    }
  }
  if (intent === 'como_limpio') {
    if (/\b(limpiar|limpio|lavar|enjuagar|higien|preparar|sacar olor)\b/.test(text)) {
      score += 6; reasons.push('boost:como_limpio:limpiar|lavar|enjuagar|preparar');
    }
  }
  if (intent === 'menu_separar') {
    if (/\b(separa(r|mos)?|clasific(ar|o)|limpiar|residuos)\b/.test(text)) {
      score += 3; reasons.push('boost:menu_separar:separar|clasificar|limpiar');
    }
  }

  // --- Huella
  if (intent === 'menu_huella') {
    if (/\b(huella|impacto)\b/.test(text)) { score += 3; reasons.push('boost:menu_huella:huella|impacto'); }
    if (/\b(kg|kilos)\b.*\b(llevo|tengo|voy)\b/.test(text)) { score += 5; reasons.push('boost:menu_huella:kg+kilos+llevo'); }
    if (/\b(cuanto recicle|cuantos kilos|cuanta basura)\b/.test(text)) { score += 3; reasons.push('boost:menu_huella:cuanto_recicle'); }
  }
  if (intent === 'huella_mensual') {
    if (/\b(este mes|mensual|del mes|mes)\b/.test(text)) {
      score += 5; reasons.push('boost:huella_mensual:mes|mensual');
    }
  }
  if (intent === 'huella_acumulada') {
    if (/\b(total|acumulad|en total|global|todo lo reciclado)\b/.test(text)) {
      score += 5; reasons.push('boost:huella_acumulada:total|acumulado');
    }
  }
  if (intent === 'huella_verde') {
    if (/\b(que es|qué es|significa|significado|definicion|definición)\b/.test(text)) {
      score += 5; reasons.push('boost:huella_verde:definicion|significado');
    }
  }
  if (intent === 'huella_mejorar') {
    if (/\b(mejorar|recomend|tips|consej|sumar mas|aumentar)\b/.test(text)) {
      score += 4; reasons.push('boost:huella_mejorar:tips|mejorar|recomendaciones');
    }
  }

  // --- Funcionamiento / Participar / Premios / Cálculo
  if (intent === 'calculo_cupones') {
    if (/\b(cuanto vale|como calculan|valor|equivale|como me dan los cupones|cuanto acumulo|cuanto puedo acumular)\b/.test(text)) {
      score += 6; reasons.push('boost:calculo_cupones:valor|calculo|equivale');
    }
  }
  if (intent === 'como_participo') {
    if (/\b(participar|sumar(me)?|arranco|ayudar|ser parte|me uno|como participo|arrancar a reciclar)\b/.test(text)) {
      score += 5; reasons.push('boost:como_participo:participar|sumarme|arranco');
    }
  }
  if (intent === 'que_gano') {
    if (/\b(que gano|beneficio(s)?|premios?|que me llevo|que obtengo)\b/.test(text)) {
      score += 5; reasons.push('boost:que_gano:premios|beneficios');
    }
  }
  if (intent === 'menu_funcionamiento') {
    if (/\b(como funciona|de que se trata|que es ekokai|como labura)\b/.test(text)) {
      score += 4; reasons.push('boost:menu_funcionamiento:como funciona|que es');
    }
  }

  // --- Problemas y no ver
  if (intent === 'no_ver') {
    if (/\b(no veo|no aparecen|no me muestra|no puedo ver|no figura(n)?)\b/.test(text)) {
      score += 7; reasons.push('boost:no_ver:no veo|no aparecen|no me muestra');
    }
  }
  if (intent === 'problema') {
    if (/\b(problema|reclamo|queja|ayuda|inconveniente)\b/.test(text)) {
      score += 4; reasons.push('boost:problema:palabra_problema');
    }
  }
  if (intent === 'problema_cupon') {
    if (/\b(cupon|cupones|qr|codigo|código|comercio|canje)\b/.test(text)) {
      score += 5; reasons.push('boost:problema_cupon:terminos_cupon');
    } else if (/\b(problema|queja|reclamo)\b/.test(text)) {
      score -= 1; reasons.push('penalty:problema_cupon:sin_terminos_cupon');
    }
  }
  if (intent === 'problema_ecopunto') {
    if (/\b(ecopunto|punto verde|lugar|atendieron|cerrado|mal estado)\b/.test(text)) {
      score += 5; reasons.push('boost:problema_ecopunto:terminos_ecopunto');
    } else if (/\b(problema|queja|reclamo)\b/.test(text)) {
      score -= 1; reasons.push('penalty:problema_ecopunto:sin_terminos_ecopunto');
    }
  }

  return { score, reasons };
}

function crossPenalties(text, intent) {
  let score = 0; const reasons = [];

  // limpieza vs cuponera
  if (/\b(limpiar|limpio|lavar|enjuagar|higien|preparar)\b/.test(text)) {
    if (['canjear_cupon','ver_cupon','ver_catalogo','como_canjear','calculo_cupones'].includes(intent)) {
      score -= 3; reasons.push('penalty:cuponera:habla_de_limpieza');
    }
  }

  // horarios/ubicación
  if (/\b(horario|hora|abren|cierran|hasta que hora)\b/.test(text) && intent === 'materiales_ecopunto') {
    score -= 2; reasons.push('penalty:materiales:habla_de_horario');
  }
  if (/\b(donde|dónde|ubic|mapa|direccion|cerca|ubi)\b/.test(text) && intent === 'horario_ecopunto') {
    score -= 2; reasons.push('penalty:horario:habla_de_ubicacion');
  }

  // "como ..." con canje -> preferir como_canjear
  if ((/^como\b|^cómo\b/.test(text)) && /\b(canj|cupon|cuponera|premio)\b/.test(text) && intent === 'canjear_cupon') {
    score -= 2; reasons.push('penalty:canjear_cupon:pregunta_como_detectada');
  }

  // no ver vs catálogo/canje
  if (/\b(no veo|no aparecen|no me muestra|no puedo ver)\b/.test(text) && ['ver_catalogo','canjear_cupon'].includes(intent)) {
    score -= 3; reasons.push('penalty:catalogo/canjear:caso_no_ver');
  }

  // negación -> prohibidos
  if (/\b(que no|no reciben|no aceptan|prohibid|no se puede)\b/.test(text) && intent === 'materiales_ecopunto') {
    score -= 3; reasons.push('penalty:materiales:negacion->prohibidos');
  }

  return { score, reasons };
}

function resolveConflicts(text, perIntent) {
  // chitchat ya se filtra antes (en matchIntent)

  // no_ver preferido con negación visual
  if (perIntent.no_ver && /\b(no veo|no aparecen|no me muestra|no puedo ver)\b/.test(text)) {
    perIntent.no_ver.score += 3;
    perIntent.no_ver.reasons.push('resolve:no_ver:preferido_por_negacion_visual');
  }

  // como_limpio vs como_canjear
  if (perIntent.como_limpio && perIntent.como_canjear) {
    if (/\b(limpiar|lavar|enjuagar|higien|preparar)\b/.test(text)) {
      perIntent.como_limpio.score += 4;
      perIntent.como_limpio.reasons.push('resolve:como_limpio>como_canjear:palabras_limpieza');
      perIntent.como_canjear.score -= 2;
      perIntent.como_canjear.reasons.push('resolve:como_canjear:penalizado_por_limpieza');
    }
  }

  // prohibidos vs materiales
  if (perIntent.que_prohibidos && perIntent.materiales_ecopunto) {
    if (/\b(que no|no reciben|no aceptan|prohibid|no se puede|no puedo llevar)\b/.test(text)) {
      perIntent.que_prohibidos.score += 4;
      perIntent.que_prohibidos.reasons.push('resolve:prohibidos>materiales:negacion_detectada');
      perIntent.materiales_ecopunto.score -= 2;
      perIntent.materiales_ecopunto.reasons.push('resolve:materiales:penalizado_por_negacion');
    }
  }

  // problema genérico
  if (perIntent.problema) {
    const cupon = /\b(cupon|cupones|qr|canje|voucher|codigo|código)\b/.test(text);
    const eco = /\b(ecopunto|punto verde|comercio|lugar)\b/.test(text);
    if (!cupon && !eco && /\b(problema|reclamo|queja|ayuda)\b/.test(text)) {
      perIntent.problema.score += 3;
      perIntent.problema.reasons.push('resolve:problema:generico_preferido');
      if (perIntent.problema_cupon) { perIntent.problema_cupon.score -= 2; }
      if (perIntent.problema_ecopunto) { perIntent.problema_ecopunto.score -= 2; }
    }
  }

  // ubicación > menú ecopunto
  if (perIntent.ubicacion_ecopunto && /\b(donde|dónde|ubic|mapa|direccion|cerca|ubi|como llegar)\b/.test(text)) {
    perIntent.ubicacion_ecopunto.score += 3;
    perIntent.ubicacion_ecopunto.reasons.push('resolve:ubicacion>menu_ecopunto:consulta_directa');
  }

  // huella refinamientos
  if (perIntent.huella_mensual && /\b(este mes|mensual|del mes|mes)\b/.test(text)) {
    perIntent.huella_mensual.score += 3;
  }
  if (perIntent.huella_acumulada && /\b(total|acumulad|en total|global)\b/.test(text)) {
    perIntent.huella_acumulada.score += 3;
  }
  if (perIntent.huella_verde && /\b(que es|qué es|significa|significado|definicion|definición)\b/.test(text)) {
    perIntent.huella_verde.score += 3;
  }

  return perIntent;
}

function pickBest(perIntent) {
  let best = { intent: null, score: -1 };
  for (const intent of INTENT_PRIORITY) {
    if (!perIntent[intent]) continue;
    const s = perIntent[intent].score;
    if (s > best.score) best = { intent, score: s };
  }
  return best;
}

// ====================================================
// API principal
// ====================================================
function matchIntent(rawText) {
  dlog('matchIntent.start', { rawText });

  const text = normalizeMsg(rawText);
  dlog('matchIntent.normalized', { normalized: text });

  // Early exit: saludos / chitchat
  if (!text || isChitChat(text)) {
    dlog('matchIntent.none', { reason: 'chitchat_or_empty' });
    return null;
  }

  const perIntent = {};
  for (const intent of INTENT_PRIORITY) {
    const base = baseLexScore(text, intent);
    const kb = keywordBoosts(text, intent);
    const cp = crossPenalties(text, intent);
    const score = base.score + kb.score + cp.score;
    const reasons = [...base.reasons, ...kb.reasons, ...cp.reasons];
    perIntent[intent] = { score, reasons };
    dlog('matchIntent.intentScore', { intent, score, reasons });
  }

  resolveConflicts(text, perIntent);

  const best = pickBest(perIntent);
  dlog('matchIntent.result', { best, perIntent });

  if (!best.intent || best.score <= 0) {
    dlog('matchIntent.none', { reason: 'sin_score_positivo' });
    return null;
  }
  return best.intent;
}

// Para tus tests
function explainMatch(rawText) {
  const normalized = normalizeMsg(rawText);
  const perIntent = {};
  for (const intent of INTENT_PRIORITY) {
    const base = baseLexScore(normalized, intent);
    const kb = keywordBoosts(normalized, intent);
    const cp = crossPenalties(normalized, intent);
    perIntent[intent] = {
      score: base.score + kb.score + cp.score,
      reasons: [...base.reasons, ...kb.reasons, ...cp.reasons],
    };
  }
  resolveConflicts(normalized, perIntent);
  const best = pickBest(perIntent);
  return { input: rawText, normalized, best, perIntent };
}

// Alias para el fast-path del router
function encontrarMejorCoincidencia(texto) {
  return matchIntent(texto);
}

module.exports = {
  LOCAL_LEX,
  normalizeMsg,
  matchIntent,
  explainMatch,
  encontrarMejorCoincidencia,
};
