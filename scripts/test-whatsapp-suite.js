/*
  Test suite para el chatbot de WhatsApp.
  - Mockea Twilio para NO enviar mensajes reales
  - Ejecuta el router con distintos mensajes
  - Muestra qué respondería el bot y si rutearon o cayeron en fallback
*/

const path = require('path');

// ---------- Mock de Twilio helper ANTES de cargar el módulo WhatsApp ----------
const helperPath = path.resolve(__dirname, '../src/whatsapp/core/twilio.helper.js');

// Copia de normalización (igual a la del helper real)
function normalizeToE164(raw) {
  if (!raw) return null;
  let n = String(raw).trim();
  if (n.startsWith('whatsapp:')) n = n.replace(/^whatsapp:/, '');
  if (/^\+\d{6,15}$/.test(n)) return n;
  if (/^\d{6,15}$/.test(n)) return `+${n}`;
  return null;
}

// Salida capturada por el mock
const sent = [];

async function responderWhatsApp(toE164, body) {
  sent.push({ type: 'text', toE164, body });
  console.log('BOT → TEXT:', String(body).slice(0, 200));
  return { ok: true, sid: 'FAKE_TEXT' };
}

async function responderWhatsAppTemplate(toE164, contentSid, variables = null) {
  sent.push({ type: 'template', toE164, contentSid, variables });
  console.log('BOT → TEMPLATE:', contentSid, variables ? JSON.stringify(variables) : '(sin vars)');
  return { ok: true, sid: 'FAKE_TEMPLATE' };
}

require.cache[helperPath] = {
  id: helperPath,
  filename: helperPath,
  loaded: true,
  exports: {
    normalizeToE164,
    responderWhatsApp,
    responderWhatsAppTemplate,
    toWhatsAppAddr: (e164) => (e164 ? `whatsapp:${e164}` : null),
  },
};

// ---------- Cargar router del WhatsApp ya con los mocks activos ----------
const whatsapp = require('../src/whatsapp');
const { handleIncomingText } = whatsapp;
const { inferUnifiedIntent } = require('../src/whatsapp/lex/intents.combined');
const { normalizarTexto } = require('../src/whatsapp/core/similarity');

async function runSuite() {
  const from = 'whatsapp:+19999999999';
  const cases = [
    // Saludos y frases de inicio
    { name: 'Saludo simple', text: 'Hola', expectedIntent: null },
    { name: 'Saludo informal', text: 'Qué onda?', expectedIntent: null },
    { name: 'Saludo cordobés', text: 'Che, todo bien?', expectedIntent: null },
    { name: 'Consulta casual', text: 'Eeeeh... estás ahí?', expectedIntent: null },
    { name: 'Inicio de conversación', text: 'Necesito una mano.', expectedIntent: 'menu_problema' },
  
    // Cuponera: Ver Cupones
    { name: 'Ver cupones - Frase directa', text: 'Ver mis cupones', expectedIntent: 'ver_cupon' },
    { name: 'Ver cupones - Jerga 1', text: 'Mostrame los cupones que tengo.', expectedIntent: 'ver_cupon' },
    { name: 'Ver cupones - Jerga 2', text: 'Che, qué onda mis premios?', expectedIntent: 'ver_cupon' },
    { name: 'Ver cupones - Pregunta', text: 'Me quedan cupones?', expectedIntent: 'ver_cupon' },
    { name: 'Ver cupones - Informal', text: 'Quiero ver lo que me queda.', expectedIntent: 'ver_cupon' },
    { name: 'Ver cupones - Impaciente', text: 'A ver, mis cupones ya!', expectedIntent: 'ver_cupon' },
  
    // Cuponera: Canjear Cupón
    { name: 'Canjear cupón - Frase directa', text: 'Quiero canjear un cupón.', expectedIntent: 'canjear_cupon' },
    { name: 'Canjear cupón - Jerga 1', text: 'Che, quiero canjear un premio.', expectedIntent: 'canjear_cupon' },
    { name: 'Canjear cupón - Jerga 2', text: 'Lo canjeo, ¿cómo hago?', expectedIntent: 'canjear_cupon' },
    { name: 'Canjear cupón - Uso', text: 'Quiero usar un cupón.', expectedIntent: 'canjear_cupon' },
    { name: 'Canjear cupón - Sinónimo', text: 'Necesito activar el cupón.', expectedIntent: 'canjear_cupon' },
    { name: 'Canjear cupón - Directo', text: 'Hacer el canje.', expectedIntent: 'canjear_cupon' },
  
    // Cuponera: Ver Catálogo
    { name: 'Catálogo - Frase directa', text: 'Quiero ver el catálogo.', expectedIntent: 'ver_catalogo' },
    { name: 'Catálogo - Jerga', text: '¿Qué hay pa canjear?', expectedIntent: 'ver_catalogo' },
    { name: 'Catálogo - Informal', text: 'Mostrame el listado de premios.', expectedIntent: 'ver_catalogo' },
    { name: 'Catálogo - Pregunta', text: 'Cuáles son todos los premios que hay?', expectedIntent: 'ver_catalogo' },
    { name: 'Catálogo - Sinónimo', text: 'Catálogo completo.', expectedIntent: 'ver_catalogo' },
  
    // Cuponera: Cómo Canjear
    { name: 'Cómo canjear - Pregunta', text: 'Cómo se canjea esto?', expectedIntent: 'como_canjear' },
    { name: 'Cómo canjear - Ayuda', text: 'Me guías en el proceso de canje?', expectedIntent: 'como_canjear' },
    { name: 'Cómo canjear - Instrucciones', text: 'Necesito las instrucciones para canjear.', expectedIntent: 'como_canjear' },
    { name: 'Cómo canjear - Paso a paso', text: 'Explicame el paso a paso.', expectedIntent: 'como_canjear' },
  
    // Cuponera: Problema Cupón
    { name: 'Problema cupón - Fallo', text: 'El cupón no anda.', expectedIntent: 'problema_cupon' },
    { name: 'Problema cupón - Error', text: 'Me tira error el cupón.', expectedIntent: 'problema_cupon' },
    { name: 'Problema cupón - No funciona', text: 'No funciona el cupón del todo.', expectedIntent: 'problema_cupon' },
    { name: 'Problema cupón - Sin validez', text: 'El cupón no es válido.', expectedIntent: 'problema_cupon' },
    { name: 'Problema cupón - QR', text: 'No me reconoce el qr.', expectedIntent: 'problema_cupon' },
    { name: 'Problema cupón - No aparece', text: 'No me aparece el cupón.', expectedIntent: 'problema_cupon' },
  
    // Ecopuntos: Ubicación
    { name: 'Ubicación - Frase directa', text: 'Dónde queda el ecopunto?', expectedIntent: 'ubicacion_ecopunto' },
    { name: 'Ubicación - Jerga', text: 'Por dónde andan los puntos verdes?', expectedIntent: 'ubicacion_ecopunto' },
    { name: 'Ubicación - Búsqueda', text: 'Cómo encuentro un ecopunto?', expectedIntent: 'ubicacion_ecopunto' },
    { name: 'Ubicación - Cerca', text: 'Cual ecopunto me queda cerca?', expectedIntent: 'ubicacion_ecopunto' },
  
    // Ecopuntos: Horario
    { name: 'Horario - Pregunta', text: 'A qué hora abren?', expectedIntent: 'horario_ecopunto' },
    { name: 'Horario - Tarde', text: 'Hasta qué hora están?', expectedIntent: 'horario_ecopunto' },
    { name: 'Horario - Hoy', text: 'Abre hoy?', expectedIntent: 'horario_ecopunto' },
    { name: 'Horario - Cierre', text: 'Cuándo cierran los ecopuntos?', expectedIntent: 'horario_ecopunto' },
  
    // Ecopuntos: Materiales
    { name: 'Materiales - Directo', text: 'Qué materiales aceptan?', expectedIntent: 'materiales_ecopunto' },
    { name: 'Materiales - Jerga', text: 'Qué se puede llevar?', expectedIntent: 'materiales_ecopunto' },
    { name: 'Materiales - Específico', text: 'Aceptan botellas de plástico?', expectedIntent: 'materiales_ecopunto' },
    { name: 'Materiales - Informal', text: 'Qué va y qué no va?', expectedIntent: 'materiales_ecopunto' },
    { name: 'Materiales - Reciclaje', text: 'Lista de cosas para reciclaje.', expectedIntent: 'materiales_ecopunto' },
  
    // Huella Verde
    { name: 'Huella - Ver', text: 'Quiero ver mi huella.', expectedIntent: 'menu_huella' },
    { name: 'Huella - Impacto', text: 'Cómo va mi impacto?', expectedIntent: 'menu_huella' },
    { name: 'Huella - Kilos', text: 'Cuántos kg llevo?', expectedIntent: 'menu_huella' },
    { name: 'Huella - Qué es', text: 'Qué es la huella verde?', expectedIntent: 'huella_verde' },
    { name: 'Huella - Significado', text: 'Qué significa la huella?', expectedIntent: 'huella_verde' },
    { name: 'Huella - Mensual', text: 'Mis kilos de este mes.', expectedIntent: 'huella_mensual' },
    { name: 'Huella - Acumulada', text: 'Mi total acumulado.', expectedIntent: 'huella_acumulada' },
    { name: 'Huella - Total', text: 'Cuánto junté en total?', expectedIntent: 'huella_acumulada' },
  
    // Funcionamiento y separación
    { name: 'Funcionamiento - General', text: 'Cómo funciona todo esto?', expectedIntent: 'menu_funcionamiento' },
    { name: 'Funcionamiento - Labor', text: 'Cómo laburan?', expectedIntent: 'menu_funcionamiento' },
    { name: 'Participar - Pregunta', text: 'Cómo me sumo?', expectedIntent: 'como_participo' },
    { name: 'Participar - Empezar', text: 'Quiero arrancar a reciclar.', expectedIntent: 'como_participo' },
    { name: 'Premios - Pregunta', text: 'Qué gano con esto?', expectedIntent: 'que_gano' },
    { name: 'Premios - Beneficios', text: 'Qué beneficios me dan?', expectedIntent: 'que_gano' },
    { name: 'Cálculo - Cupones', text: 'Cómo me dan los cupones?', expectedIntent: 'calculo_cupones' },
    { name: 'Cálculo - Valor', text: 'Cuánto vale un cupón?', expectedIntent: 'calculo_cupones' },
    { name: 'Separar - Pregunta', text: 'Cómo separamos?', expectedIntent: 'menu_separar' },
    { name: 'Separar - Limpieza', text: 'Cómo tengo que limpiar?', expectedIntent: 'como_limpio' },
    { name: 'Separar - Prohibidos', text: 'Qué no puedo llevar?', expectedIntent: 'que_prohibidos' },
    { name: 'Separar - No aceptan', text: 'Qué no reciben?', expectedIntent: 'que_prohibidos' },
  
    // Problemas y No ver
    { name: 'Problema - General', text: 'Tuve un problema, necesito ayuda.', expectedIntent: 'problema' },
    { name: 'Problema - Queja', text: 'Tengo una queja.', expectedIntent: 'problema' },
    { name: 'Problema - No carga', text: 'No me carga nada.', expectedIntent: 'problema' },
    { name: 'No ver - Cupones', text: 'No aparecen mis cupones.', expectedIntent: 'no_ver' },
    { name: 'No ver - Huella', text: 'No veo mi huella.', expectedIntent: 'no_ver' },
    { name: 'No ver - Datos', text: 'No me muestra mis datos.', expectedIntent: 'no_ver' },
    { name: 'Otro problema - No es', text: 'Ninguna de las opciones.', expectedIntent: 'otro_problema' },
    { name: 'Otro problema - Diferente', text: 'Tengo algo diferente.', expectedIntent: 'otro_problema' },
  
    // Fallbacks (casos de texto irrelevante)
    { name: 'Fallback - Caracteres random', text: 'jklajdajsdja', expectedIntent: null },
    { name: 'Fallback - Puntos suspensivos', text: '......', expectedIntent: null },
    { name: 'Fallback - Insulto leve', text: 'este bot es una boludez', expectedIntent: null },
    { name: 'Fallback - Pregunta sin contexto', text: 'y ahora que hago', expectedIntent: null },
  ];

  const results = [];

  for (const test of cases) {
    sent.length = 0; // limpiar salidas
    console.log('\n===== CASE:', test.name, '=====' );
    console.log('USER →', test.text);
    try {
      const normalized = normalizarTexto(test.text);
      const inferredIntent = inferUnifiedIntent(normalized);
      const res = await handleIncomingText({ from, body: test.text });
      const match = (test.expectedIntent || null) === (inferredIntent || null);
      console.log('Intent esperado →', test.expectedIntent || '(none)');
      console.log('Intent detectado →', inferredIntent || '(none)');
      console.log('Match →', match);
      console.log('Result →', res);
      if (sent.length === 0) {
        console.log('(No hubo respuesta del bot)');
      } else {
        console.log('Mensajes enviados por el bot:', sent.length);
      }
      results.push({
        name: test.name,
        text: test.text,
        expected: test.expectedIntent || null,
        inferred: inferredIntent || null,
        match,
        routed: res?.routed,
        messages: sent.slice(0, 3),
      });
    } catch (e) {
      console.error('❌ ERROR en case:', test.name, e?.message);
      results.push({ name: test.name, text: test.text, error: e?.message });
    }
  }

  // Resumen
  const ok = results.filter(r => r.match === true).length;
  const bad = results.filter(r => r.match === false).length;
  console.log('\n===== RESUMEN INTENTS =====');
  console.log('Total casos:', results.length, '| OK:', ok, '| Fallas:', bad);
  for (const r of results) {
    if (r.error) {
      console.log(`- ${r.name}: ERROR → ${r.error}`);
      continue;
    }
    const status = r.match ? 'OK' : 'FAIL';
    console.log(`- ${r.name}: ${status} | esperado=${r.expected || '-'} | detectado=${r.inferred || '-'} | routed=${r.routed}`);
  }
}

runSuite().then(() => {
  console.log('\n✔ Suite de pruebas finalizada');
  process.exit(0);
}).catch((e) => {
  console.error('❌ Suite falló:', e);
  process.exit(1);
});


