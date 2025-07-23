/**
 * 🚀 EKOKAI WhatsApp Controller - Versión SUPER INTELIGENTE
 * 
 * 🌟 FUNCIONALIDADES AVANZADAS IMPLEMENTADAS:
 * 
 * 1. 🧠 SISTEMA DE NLP AVANZADO:
 *    - Detección de intenciones con puntuación semántica
 *    - Análisis de sinónimos y contexto
 *    - Algoritmo de similitud mejorado
 *    - Fallback inteligente con sugerencias
 * 
 * 2. 🎭 EASTER EGGS Y RESPUESTAS ESPECIALES:
 *    - Detección de expresiones de amor y cariño
 *    - Respuestas motivacionales automáticas
 *    - Sistema de felicitaciones y humor
 *    - Respuestas contextuales dinámicas
 * 
 * 3. 📛 PERSONALIZACIÓN AVANZADA:
 *    - Saludos personalizados por nombre y hora
 *    - Respuestas dinámicas basadas en contexto
 *    - Mensajes diferenciados por estado de tokens
 *    - Cache inteligente de usuarios
 * 
 * 4. 🎯 SISTEMA DE SUGERENCIAS INTELIGENTES:
 *    - Fallback con opciones contextuales
 *    - Detección de confusión del usuario
 *    - Sugerencias basadas en palabras clave
 *    - Respuestas de agradecimiento automáticas
 * 
 * 5. 📊 ANÁLISIS Y MEJORA CONTINUA:
 *    - Registro de interacciones no reconocidas
 *    - Estadísticas de intenciones exitosas
 *    - Análisis de sugerencias utilizadas
 *    - Limpieza automática de datos antiguos
 * 
 * 6. 🌱 EXPERIENCIA DE USUARIO SUPERIOR:
 *    - Respuestas más humanas y empáticas
 *    - Motivación constante y personalizada
 *    - Detección de emociones y estados
 *    - Adaptación dinámica al contexto
 * 
 * @author Kamila - EKOKAI Team
 * @version 3.0 - Super Inteligente
 * @features NLP, Easter Eggs, Personalización, Análisis, Motivación
 */

const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const usuarioRepo = require('../repositories/usuario.repository');
const entregaRepo = require('../repositories/entregaresiduio.repository');
const { responderWhatsApp } = require('../utils/twilio.helper');

// 🔑 Carga de credenciales desde variables de entorno
const serviceAccount = {
  type: process.env.GC_TYPE,
  project_id: process.env.GC_PROJECT_ID,
  private_key_id: process.env.GC_PRIVATE_KEY_ID,
  private_key: process.env.GC_PRIVATE_KEY,
  client_email: process.env.GC_CLIENT_EMAIL,
  client_id: process.env.GC_CLIENT_ID,
  auth_uri: process.env.GC_AUTH_URI,
  token_uri: process.env.GC_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GC_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GC_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GC_UNIVERSE_DOMAIN
};

const projectId = serviceAccount.project_id;

// 🔧 Configuración Dialogflow
let privateKey = process.env.GC_PRIVATE_KEY;
if (privateKey) privateKey = privateKey.replace(/\\n/g, '\n');

let sessionClient;
try {
  sessionClient = new dialogflow.SessionsClient({
    credentials: {
      private_key: privateKey,
      client_email: process.env.GC_CLIENT_EMAIL
    },
    projectId
  });
  console.log('[LOG] Dialogflow SessionsClient creado exitosamente');
} catch (err) {
  console.error('[ERROR] Error al crear SessionsClient:', err);
}

// 📌 Estado temporal de registro
const registroTemporal = {}; // { telefono: { paso: 'nombre', datos: { nombre, apellido, ... } } }

// 📌 Cache de usuarios para evitar búsquedas duplicadas
const usuarioCache = new Map(); // { telefono: { usuario, timestamp } }
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// 🔧 Función para obtener usuario con cache
async function obtenerUsuarioConCache(telefono) {
  const ahora = Date.now();
  const cacheEntry = usuarioCache.get(telefono);
  
  // Si hay cache válido, usarlo
  if (cacheEntry && (ahora - cacheEntry.timestamp) < CACHE_DURATION) {
    console.log(`[LOG] Usuario obtenido desde cache: ${telefono}`);
    return cacheEntry.usuario;
  }
  
  // Buscar en base de datos
  console.log(`[LOG] Buscando usuario en base de datos: ${telefono}`);
  const usuario = await usuarioRepo.buscarPorTelefono(telefono);
  
  // Guardar en cache
  if (usuario) {
    usuarioCache.set(telefono, { usuario, timestamp: ahora });
    console.log(`[LOG] Usuario guardado en cache: ${telefono}`);
  }
  
  return usuario;
}

// 🧹 Función para limpiar cache expirado
function limpiarCacheExpirado() {
  const ahora = Date.now();
  let eliminados = 0;
  
  for (const [telefono, entry] of usuarioCache.entries()) {
    if (ahora - entry.timestamp > CACHE_DURATION) {
      usuarioCache.delete(telefono);
      eliminados++;
    }
  }
  
  if (eliminados > 0) {
    console.log(`[LOG] Cache limpiado: ${eliminados} entradas expiradas eliminadas`);
  }
}

// 🕐 Limpiar cache cada 10 minutos
setInterval(limpiarCacheExpirado, 10 * 60 * 1000);

// 📊 Sistema de análisis y mejora continua
const interaccionesAnalisis = {
  mensajesNoReconocidos: new Map(), // { mensaje: { count, timestamp } }
  intencionesExitosas: new Map(),   // { intencion: { count, aciertos } }
  sugerenciasUtilizadas: new Map()  // { sugerencia: { count, timestamp } }
};

// 📈 Función para registrar interacciones y mejorar el sistema
function registrarInteraccion(tipo, datos) {
  const ahora = Date.now();
  
  switch (tipo) {
    case 'mensaje_no_reconocido':
      const mensaje = datos.mensaje.toLowerCase();
      const actual = interaccionesAnalisis.mensajesNoReconocidos.get(mensaje) || { count: 0, timestamp: ahora };
      actual.count++;
      actual.timestamp = ahora;
      interaccionesAnalisis.mensajesNoReconocidos.set(mensaje, actual);
      
      // Log para análisis
      if (actual.count === 1) {
        console.log(`[ANÁLISIS] Nuevo mensaje no reconocido: "${datos.mensaje}"`);
      } else if (actual.count % 5 === 0) {
        console.log(`[ANÁLISIS] Mensaje frecuentemente no reconocido (${actual.count} veces): "${datos.mensaje}"`);
      }
      break;
      
    case 'intencion_exitosa':
      const intencion = datos.intencion;
      const intencionActual = interaccionesAnalisis.intencionesExitosas.get(intencion) || { count: 0, aciertos: 0 };
      intencionActual.count++;
      intencionActual.aciertos++;
      interaccionesAnalisis.intencionesExitosas.set(intencion, intencionActual);
      break;
      
    case 'sugerencia_utilizada':
      const sugerencia = datos.sugerencia;
      const sugerenciaActual = interaccionesAnalisis.sugerenciasUtilizadas.get(sugerencia) || { count: 0, timestamp: ahora };
      sugerenciaActual.count++;
      sugerenciaActual.timestamp = ahora;
      interaccionesAnalisis.sugerenciasUtilizadas.set(sugerencia, sugerenciaActual);
      break;
  }
}

// 📊 Función para obtener estadísticas del sistema
function obtenerEstadisticasSistema() {
  const stats = {
    mensajesNoReconocidos: Array.from(interaccionesAnalisis.mensajesNoReconocidos.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10),
    intencionesExitosas: Array.from(interaccionesAnalisis.intencionesExitosas.entries())
      .sort((a, b) => b[1].count - a[1].count),
    sugerenciasUtilizadas: Array.from(interaccionesAnalisis.sugerenciasUtilizadas.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
  };
  
  return stats;
}

// 🔄 Función para limpiar datos antiguos de análisis
function limpiarAnalisisAntiguo() {
  const ahora = Date.now();
  const unDia = 24 * 60 * 60 * 1000;
  
  // Limpiar mensajes no reconocidos de más de 1 día
  for (const [mensaje, datos] of interaccionesAnalisis.mensajesNoReconocidos.entries()) {
    if (ahora - datos.timestamp > unDia) {
      interaccionesAnalisis.mensajesNoReconocidos.delete(mensaje);
    }
  }
  
  // Limpiar sugerencias de más de 1 día
  for (const [sugerencia, datos] of interaccionesAnalisis.sugerenciasUtilizadas.entries()) {
    if (ahora - datos.timestamp > unDia) {
      interaccionesAnalisis.sugerenciasUtilizadas.delete(sugerencia);
    }
  }
  
  console.log('[ANÁLISIS] Datos antiguos limpiados');
}

// 🕐 Limpiar análisis cada hora
setInterval(limpiarAnalisisAntiguo, 60 * 60 * 1000);

// 🧠 Funciones de procesamiento de lenguaje natural avanzado
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras, números y espacios
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .trim();
}

// 🎯 Sistema de detección de intenciones avanzado
function detectarIntencionAvanzada(mensaje) {
  const texto = normalizarTexto(mensaje);
  const palabras = texto.split(' ');
  
  // 🧠 Análisis semántico avanzado con más variaciones y faltas de ortografía
  const intenciones = {
    tokens: {
      palabras: ['token', 'tokens', 'tengo', 'cuantos', 'cuántos', 'balance', 'saldo', 'acumulados', 'ganados', 'puntos', 'punto'],
      sinonimos: ['dinero', 'plata', 'pesos', 'monedas', 'creditos', 'créditos', 'puntaje', 'score'],
      variaciones: ['tokenes', 'tokens', 'tengo', 'cuantos', 'kantos', 'kantos', 'balanse', 'balanse', 'akumulados', 'ganados', 'puntos', 'punto', 'puntitos'],
      contexto: ['ver', 'mostrar', 'consultar', 'revisar', 'chequear', 'mirar', 'saber', 'conocer', 'decime', 'dime', 'che', 'ke']
    },
    catalogo: {
      palabras: ['catalogo', 'catálogo', 'premios', 'cupones', 'canjear', 'canje', 'beneficios', 'descuentos', 'ofertas'],
      sinonimos: ['regalos', 'gift', 'recompensas', 'rewards', 'cosas', 'cositas', 'que hay', 'disponible'],
      variaciones: ['katalogo', 'katálogo', 'premios', 'kupones', 'kanjear', 'kanje', 'beneficios', 'deskuentos', 'ofertas', 'premios', 'premios', 'ke hay', 'ke ai'],
      contexto: ['ver', 'mostrar', 'que hay', 'disponible', 'puedo', 'puedes', 'hay algo', 'ke', 'que']
    },
    ecopuntos: {
      palabras: ['ecopunto', 'ecopuntos', 'punto', 'puntos', 'donde', 'ubicacion', 'ubicación', 'lugar', 'direccion'],
      sinonimos: ['centro', 'lugar', 'sitio', 'donde llevar', 'donde ir', 'adonde', 'a donde'],
      variaciones: ['ekopunto', 'ekopuntos', 'punto', 'puntos', 'donde', 'ubikasion', 'ubikación', 'lugar', 'direksion', 'donde ai', 'donde hay'],
      contexto: ['ir', 'llevar', 'reciclar', 'entregar', 'donde', 'cerca', 'cercano', 'decime', 'dime']
    },
    registro: {
      palabras: ['registrar', 'registrarme', 'registrarse', 'crear', 'cuenta', 'alta', 'inscribir'],
      sinonimos: ['anotar', 'apuntar', 'darme de alta', 'sumarme', 'unirme', 'participar'],
      variaciones: ['rejistrar', 'rejistrarme', 'rejistrarse', 'krear', 'kuenta', 'alta', 'inskribir', 'registrarme', 'registrarse'],
      contexto: ['quiero', 'necesito', 'puedo', 'como', 'ayuda', 'keiro', 'nesesito']
    },
    ayuda: {
      palabras: ['ayuda', 'ayudar', 'como', 'funciona', 'que es', 'qué es', 'explicar', 'informacion'],
      sinonimos: ['socorro', 'auxilio', 'soporte', 'support', 'help', 'que hacer', 'qué hacer'],
      variaciones: ['ayuda', 'ayudar', 'komo', 'funciona', 'ke es', 'qué es', 'eksplikar', 'informasion', 'decime', 'dime', 'explicame'],
      contexto: ['no entiendo', 'confuso', 'perdido', 'perdida', 'duda', 'pregunta', 'no entiendo', 'konfuso']
    },
    amor: {
      palabras: ['te quiero', 'te amo', 'amor', 'love', 'me gustas', 'eres genial', 'eres bueno'],
      sinonimos: ['adoro', 'me encantas', 'eres increible', 'increíble', 'fantastico', 'fantástico'],
      variaciones: ['te kiero', 'te amo', 'amor', 'love', 'me gustas', 'eres genial', 'eres bueno', 'te kiero'],
      contexto: ['bot', 'asistente', 'ekokai', 'sistema']
    },
    motivacion: {
      palabras: ['cansado', 'cansada', 'difícil', 'difícil', 'complicado', 'no puedo', 'no se', 'no sé'],
      sinonimos: ['agotado', 'agotada', 'frustrado', 'frustrada', 'desanimado', 'desanimada'],
      variaciones: ['kansado', 'kansada', 'difikil', 'difikil', 'komplikado', 'no puedo', 'no se', 'no sé', 'kansado', 'kansada'],
      contexto: ['reciclar', 'tokens', 'esfuerzo', 'trabajo', 'tiempo', 'resiklar']
    }
  };

  // 🎯 Algoritmo de puntuación de intenciones mejorado
  const puntuaciones = {};
  
  for (const [intencion, config] of Object.entries(intenciones)) {
    let puntuacion = 0;
    
    // Verificar palabras exactas
    for (const palabra of config.palabras) {
      if (texto.includes(palabra)) {
        puntuacion += 3; // Peso alto para palabras exactas
      }
    }
    
    // Verificar sinónimos
    for (const sinonimo of config.sinonimos) {
      if (texto.includes(sinonimo)) {
        puntuacion += 2; // Peso medio para sinónimos
      }
    }
    
    // Verificar variaciones (faltas de ortografía)
    for (const variacion of config.variaciones || []) {
      if (texto.includes(variacion)) {
        puntuacion += 2.5; // Peso alto para variaciones
      }
    }
    
    // Verificar contexto
    for (const contexto of config.contexto) {
      if (texto.includes(contexto)) {
        puntuacion += 1; // Peso bajo para contexto
      }
    }
    
    // Bonus por longitud de coincidencia
    const palabrasCoincidentes = config.palabras.filter(p => texto.includes(p)).length;
    const variacionesCoincidentes = (config.variaciones || []).filter(v => texto.includes(v)).length;
    puntuacion += (palabrasCoincidentes + variacionesCoincidentes) * 0.5;
    
    puntuaciones[intencion] = puntuacion;
  }
  
  // 🏆 Encontrar la intención con mayor puntuación
  const mejorIntencion = Object.entries(puntuaciones)
    .filter(([_, puntuacion]) => puntuacion > 0)
    .sort(([_, a], [__, b]) => b - a)[0];
  
  return mejorIntencion ? { intencion: mejorIntencion[0], confianza: Math.min(mejorIntencion[1] / 10, 1) } : null;
}

// 🎭 Sistema de Easter Eggs y respuestas especiales
function detectarEasterEggs(mensaje) {
  const texto = normalizarTexto(mensaje);
  
  const easterEggs = {
    amor: {
      patrones: [
        /te quiero/i, /te amo/i, /love you/i, /me gustas/i, /eres genial/i, /eres bueno/i,
        /adoro/i, /me encantas/i, /eres increible/i, /fantastico/i, /hermoso/i, /hermosa/i
      ],
      respuestas: [
        '🥰 ¡Yo también te quiero por reciclar y cuidar el planeta! 🌎💚',
        '💕 ¡Gracias por tu amor! Juntos hacemos un mundo mejor reciclando ♻️',
        '😍 ¡Me encantas por ser parte de la revolución del reciclaje! 🌱💖',
        '💝 ¡Yo también te amo! Cada botella que reciclas es un abrazo al planeta 🌍',
        '🥰 ¡Eres increíble! Tu amor por el planeta se nota en cada token que ganas 💚'
      ]
    },
    motivacion: {
      patrones: [
        /estoy cansado/i, /estoy cansada/i, /es dificil/i, /es difícil/i, /no puedo/i,
        /me cuesta/i, /es complicado/i, /estoy agotado/i, /estoy agotada/i
      ],
      respuestas: [
        '💪 ¡Cada botella cuenta! Sigue así y ganarás más tokens que nadie ♻️',
        '🌟 ¡Tú puedes! Cada pequeño esfuerzo suma para un planeta mejor 🌱',
        '🔥 ¡Eres un héroe del reciclaje! No te rindas, el planeta te necesita 💚',
        '⚡ ¡Cada acción importa! Juntos somos más fuertes que cualquier obstáculo 🌍',
        '🎯 ¡Mira tus tokens! Cada uno representa un paso hacia un futuro mejor ♻️'
      ]
    },
    felicitacion: {
      patrones: [
        /felicidades/i, /felicitaciones/i, /congratulations/i, /bien hecho/i, /excelente/i,
        /muy bien/i, /perfecto/i, /genial/i, /increible/i, /increíble/i
      ],
      respuestas: [
        '🎉 ¡Gracias! Juntos celebramos cada victoria por el planeta 🌱',
        '🏆 ¡Excelente actitud! Cada felicitación es energía para seguir reciclando ♻️',
        '🌟 ¡Tú también mereces felicitaciones por ser parte del cambio! 💚',
        '🎊 ¡Celebremos juntos el amor por nuestro planeta! 🌍',
        '👏 ¡Gracias por tu entusiasmo! Es contagioso y necesario ♻️'
      ]
    },
    humor: {
      patrones: [
        /chiste/i, /broma/i, /joke/i, /divertido/i, /gracioso/i, /haha/i, /jaja/i,
        /lol/i, /risa/i, /reir/i, /reír/i
      ],
      respuestas: [
        '😄 ¡El mejor chiste es reciclar y ganar tokens! ¿No es genial? ♻️',
        '🤣 ¡Jaja! Me haces reír mientras salvamos el planeta juntos 🌱',
        '😆 ¡El humor es la mejor manera de reciclar! ¡Sigue así! 💚',
        '😂 ¡Me encanta tu sentido del humor! Es tan verde como tus tokens 🌍',
        '😊 ¡Sonreír mientras reciclamos es la mejor combinación! ♻️'
      ]
    }
  };
  
  for (const [tipo, config] of Object.entries(easterEggs)) {
    for (const patron of config.patrones) {
      if (patron.test(mensaje)) {
        const respuesta = config.respuestas[Math.floor(Math.random() * config.respuestas.length)];
        return { tipo, respuesta };
      }
    }
  }
  
  return null;
}

// 🧠 Sistema de sugerencias inteligentes
function generarSugerenciasInteligentes(mensaje, usuario = null) {
  const texto = normalizarTexto(mensaje);
  const sugerencias = [];
  
  // Detectar palabras relacionadas con tokens
  if (texto.includes('token') || texto.includes('punto') || texto.includes('ganar')) {
    sugerencias.push('1️⃣ Ver mis tokens');
  }
  
  // Detectar palabras relacionadas con premios
  if (texto.includes('premio') || texto.includes('canjear') || texto.includes('beneficio')) {
    sugerencias.push('2️⃣ Ver catálogo de premios');
  }
  
  // Detectar palabras relacionadas con ubicación
  if (texto.includes('donde') || texto.includes('lugar') || texto.includes('ir')) {
    sugerencias.push('3️⃣ Ubicación de ecopuntos');
  }
  
  // Detectar palabras relacionadas con ayuda
  if (texto.includes('ayuda') || texto.includes('como') || texto.includes('funciona')) {
    sugerencias.push('4️⃣ ¿Cómo funciona EKOKAI?');
  }
  
  // Si no hay sugerencias específicas, ofrecer opciones generales
  if (sugerencias.length === 0) {
    sugerencias.push('1️⃣ Ver mis tokens', '2️⃣ Ver catálogo de premios', '3️⃣ Ubicación de ecopuntos');
  }
  
  return sugerencias;
}

// 🎯 Sistema de respuestas contextuales
function generarRespuestaContextual(mensaje, usuario = null) {
  const texto = normalizarTexto(mensaje);
  
  // Detectar frases de confusión o no entendimiento
  const frasesConfusion = [
    'no entiendo', 'no se', 'no sé', 'que quieres', 'qué quieres', 'que dices', 'qué dices',
    'no comprendo', 'confuso', 'perdido', 'perdida', 'ayuda', 'que hacer', 'qué hacer'
  ];
  
  if (frasesConfusion.some(frase => texto.includes(frase))) {
    const sugerencias = generarSugerenciasInteligentes(mensaje, usuario);
    return {
      tipo: 'confusion',
      mensaje: `🤔 ¿Te refieres a:\n${sugerencias.join('\n')}\n\n💡 O simplemente escribí lo que necesitas y te ayudo 🌱`,
      sugerencias
    };
  }
  
  // Detectar frases de agradecimiento
  const frasesAgradecimiento = [
    'gracias', 'thank you', 'thanks', 'te agradezco', 'muy agradecido', 'muy agradecida'
  ];
  
  if (frasesAgradecimiento.some(frase => texto.includes(frase))) {
    const respuestas = [
      '🌱 ¡De nada! Es un placer ayudarte a cuidar el planeta ♻️',
      '💚 ¡Gracias a ti por ser parte del cambio! Juntos somos más fuertes 🌍',
      '🌟 ¡Es mi trabajo! Y me encanta hacerlo mientras salvamos el planeta ♻️',
      '😊 ¡No hay de qué! Tu entusiasmo por reciclar es mi mejor recompensa 🌱'
    ];
    return {
      tipo: 'agradecimiento',
      mensaje: respuestas[Math.floor(Math.random() * respuestas.length)]
    };
  }
  
  return null;
}

// ⚡ Sistema de respuestas rápidas para casos comunes
function generarRespuestaRapida(mensaje, usuario = null) {
  const texto = normalizarTexto(mensaje);
  
  // Respuestas rápidas para preguntas frecuentes
  const respuestasRapidas = {
    'que es ekokai': '🌱 EKOKAI es un sistema que premia el reciclaje con tokens que podés canjear por beneficios. ¡Cada kilo reciclado cuenta! ♻️',
    'como funciona': '♻️ 1) Llevá residuos al ecopunto 2) Te pesamos 3) Recibís tokens 4) Canjealos por premios. ¡Es así de simple! 🌱',
    'donde reciclar': '🗺️ Llevá tus residuos a cualquier ecopunto. Te doy las ubicaciones más cercanas si querés 🌍',
    'que reciclar': '♻️ Plástico, vidrio, papel y latas. ¡Limpios y secos! Cada material tiene su valor en tokens 🌱',
    'cuanto vale': '💰 1kg plástico=5 tokens, 1kg vidrio=3 tokens, 1kg papel=2 tokens, 1kg latas=4 tokens 💎',
    'cuánto vale': '💰 1kg plástico=5 tokens, 1kg vidrio=3 tokens, 1kg papel=2 tokens, 1kg latas=4 tokens 💎',
    'que premios': '🎁 Descuentos en comercios, entradas gratis, servicios especiales y mucho más. ¡Todo por reciclar! 🌟',
    'qué premios': '🎁 Descuentos en comercios, entradas gratis, servicios especiales y mucho más. ¡Todo por reciclar! 🌟',
    'horarios': '⏰ Los ecopuntos abren de lunes a domingo, horarios variables. Te doy los detalles si querés 📅',
    'cuando abren': '⏰ Los ecopuntos abren de lunes a domingo, horarios variables. Te doy los detalles si querés 📅',
    'cuándo abren': '⏰ Los ecopuntos abren de lunes a domingo, horarios variables. Te doy los detalles si querés 📅',
    'es gratis': '✅ ¡Sí! Reciclar es completamente gratis. Solo traé tus residuos limpios y secos ♻️',
    'es gratuito': '✅ ¡Sí! Reciclar es completamente gratis. Solo traé tus residuos limpios y secos ♻️',
    'necesito ayuda': '🤝 ¡Te ayudo! ¿Qué necesitás saber sobre EKOKAI? Podés preguntarme lo que quieras 🌱',
    'ayudame': '🤝 ¡Te ayudo! ¿Qué necesitás saber sobre EKOKAI? Podés preguntarme lo que quieras 🌱',
    'ayúdame': '🤝 ¡Te ayudo! ¿Qué necesitás saber sobre EKOKAI? Podés preguntarme lo que quieras 🌱',
    'no entiendo': '🤔 No te preocupes, te explico paso a paso. ¿Qué parte no te queda clara? 🌱',
    'no comprendo': '🤔 No te preocupes, te explico paso a paso. ¿Qué parte no te queda clara? 🌱',
    'estoy perdido': '🗺️ ¡No te preocupes! Te guío. ¿Querés que te explique cómo funciona EKOKAI? 🌱',
    'estoy perdida': '🗺️ ¡No te preocupes! Te guío. ¿Querés que te explique cómo funciona EKOKAI? 🌱',
    'que hago': '🎯 ¡Fácil! 1) Juntá residuos 2) Llevalos al ecopunto 3) ¡Ganá tokens! ¿Empezamos? 🌱',
    'qué hago': '🎯 ¡Fácil! 1) Juntá residuos 2) Llevalos al ecopunto 3) ¡Ganá tokens! ¿Empezamos? 🌱',
    'por donde empiezo': '🚀 ¡Por acá! Primero registrate, después juntá residuos y llevalos al ecopunto. ¡Te ayudo con todo! 🌱',
    'por dónde empiezo': '🚀 ¡Por acá! Primero registrate, después juntá residuos y llevalos al ecopunto. ¡Te ayudo con todo! 🌱'
  };
  
  // Buscar coincidencias exactas o parciales
  for (const [pregunta, respuesta] of Object.entries(respuestasRapidas)) {
    if (texto.includes(pregunta) || pregunta.includes(texto)) {
      return respuesta;
    }
  }
  
  return null;
}

// 🎭 Sistema de respuestas dinámicas basadas en el contexto del usuario
function generarRespuestaDinamica(tipo, usuario = null, datosAdicionales = {}) {
  const respuestas = {
    tokens: {
      conTokens: [
        `🪙 ¡Hola ${usuario?.nombre || 'vecino'}! Tienes ${datosAdicionales.tokens} tokens acumulados. ¡Excelente trabajo reciclando! 🌱`,
        `💰 ¡Hola ${usuario?.nombre || 'vecino'}! Tu balance actual: ${datosAdicionales.tokens} tokens EKOKAI. ¡Seguí así! 🌱`,
        `🎯 ¡Hola ${usuario?.nombre || 'vecino'}! Sumaste ${datosAdicionales.tokens} tokens reciclando. ¡Continuá ayudando al planeta! 🌱`
      ],
      sinTokens: [
        `🪙 ¡Hola ${usuario?.nombre || 'vecino'}! Aún no tienes tokens acumulados. ¡Llevá tus residuos al ecopunto más cercano para empezar a ganar! 🌱`,
        `🌟 ¡Hola ${usuario?.nombre || 'vecino'}! Es momento de empezar a reciclar y ganar tokens. ¡El planeta te necesita! 🌱`,
        `💚 ¡Hola ${usuario?.nombre || 'vecino'}! Tu primer token está esperando. ¡Llevá tus residuos al ecopunto! 🌱`
      ]
    },
    motivacion: {
      general: [
        '💪 ¡Cada botella cuenta! Sigue así y ganarás más tokens que nadie ♻️',
        '🌟 ¡Tú puedes! Cada pequeño esfuerzo suma para un planeta mejor 🌱',
        '🔥 ¡Eres un héroe del reciclaje! No te rindas, el planeta te necesita 💚'
      ],
      conTokens: [
        `🎯 ¡Mira tus ${datosAdicionales.tokens} tokens! Cada uno representa un paso hacia un futuro mejor ♻️`,
        `💪 ¡Con ${datosAdicionales.tokens} tokens ya eres un experto reciclador! ¡Seguí así! 🌱`,
        `🌟 ¡${datosAdicionales.tokens} tokens! ¡Eres una inspiración para otros vecinos! 💚`
      ]
    },
    bienvenida: {
      nuevo: [
        '🎉 ¡Bienvenido a la familia EKOKAI! Juntos haremos un mundo mejor 🌱',
        '🌟 ¡Qué bueno que te sumes! Cada reciclador cuenta para el planeta ♻️',
        '💚 ¡Bienvenido! Tu compromiso con el planeta es admirable 🌍'
      ],
      recurrente: [
        `🌱 ¡Qué bueno verte de nuevo, ${usuario?.nombre || 'vecino'}! ¿Cómo va tu reciclaje? ♻️`,
        `🌟 ¡Hola ${usuario?.nombre || 'vecino'}! ¿Listo para seguir ganando tokens? 💚`,
        `💪 ¡${usuario?.nombre || 'Vecino'}! ¿Qué tal va tu misión de salvar el planeta? 🌍`
      ]
    }
  };
  
  const categoria = respuestas[tipo];
  if (!categoria) return null;
  
  // Seleccionar subcategoría basada en datos adicionales
  let subcategoria = 'general';
  if (tipo === 'tokens') {
    subcategoria = datosAdicionales.tokens > 0 ? 'conTokens' : 'sinTokens';
  } else if (tipo === 'motivacion' && datosAdicionales.tokens > 0) {
    subcategoria = 'conTokens';
  } else if (tipo === 'bienvenida') {
    subcategoria = datosAdicionales.esNuevo ? 'nuevo' : 'recurrente';
  }
  
  const opciones = categoria[subcategoria] || categoria.general;
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function calcularSimilitud(str1, str2) {
  const s1 = normalizarTexto(str1);
  const s2 = normalizarTexto(str2);
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Algoritmo de similitud simple (Levenshtein simplificado)
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function encontrarMejorCoincidencia(mensaje, opciones, umbral = 0.7) {
  console.log(`[LOG] Buscando coincidencia para: "${mensaje}"`);
  console.log(`[LOG] Opciones disponibles: ${JSON.stringify(opciones)}`);
  
  let mejorCoincidencia = null;
  let mejorSimilitud = 0;
  
  for (const opcion of opciones) {
    const similitud = calcularSimilitud(mensaje, opcion);
    console.log(`[LOG] Similitud con "${opcion}": ${similitud}`);
    
    if (similitud > mejorSimilitud && similitud >= umbral) {
      mejorSimilitud = similitud;
      mejorCoincidencia = opcion;
    }
  }
  
  console.log(`[LOG] Mejor coincidencia: "${mejorCoincidencia}" (similitud: ${mejorSimilitud})`);
  return mejorCoincidencia;
}

// 📌 Función para validar y formatear número de teléfono argentino
function validarYFormatearTelefono(numero) {
  // Remover todos los caracteres no numéricos
  const soloNumeros = numero.replace(/\D/g, '');
  
  console.log(`[LOG] Validando número: "${numero}" -> Solo números: "${soloNumeros}"`);
  
  // Si ya tiene el código de país +56 (Chile), solo validar longitud
  if (numero.startsWith('+56')) {
    const numeroSinCodigo = soloNumeros.substring(2);
    if (numeroSinCodigo.length >= 8 && numeroSinCodigo.length <= 9) {
      return `+56${numeroSinCodigo}`;
    }
  }
  
  // Si ya tiene el código de país +54 (Argentina), solo validar longitud
  if (numero.startsWith('+54')) {
    const numeroSinCodigo = soloNumeros.substring(2);
    if (numeroSinCodigo.length >= 8 && numeroSinCodigo.length <= 10) {
      return `+54${numeroSinCodigo}`;
    }
  }
  
  // Si no tiene código de país, verificar si es chileno o argentino
  if (soloNumeros.length >= 8 && soloNumeros.length <= 9) {
    // Probablemente chileno (8-9 dígitos)
    return `+56${soloNumeros}`;
  }
  
  if (soloNumeros.length >= 8 && soloNumeros.length <= 10) {
    // Probablemente argentino (8-10 dígitos)
    return `+54${soloNumeros}`;
  }
  
  // Si tiene 11 dígitos y empieza con 56 (Chile), formatear
  if (soloNumeros.length === 11 && soloNumeros.startsWith('56')) {
    return `+${soloNumeros}`;
  }
  
  // Si tiene 11 dígitos y empieza con 54 (Argentina), formatear
  if (soloNumeros.length === 11 && soloNumeros.startsWith('54')) {
    return `+${soloNumeros}`;
  }
  
  // Si tiene 13 dígitos y empieza con 569 (Chile), formatear
  if (soloNumeros.length === 13 && soloNumeros.startsWith('569')) {
    return `+${soloNumeros}`;
  }
  
  // Si tiene 13 dígitos y empieza con 549 (Argentina), formatear
  if (soloNumeros.length === 13 && soloNumeros.startsWith('549')) {
    return `+${soloNumeros}`;
  }
  
  // Si el número ya está bien formateado, devolverlo tal como está
  if (numero.startsWith('+') && soloNumeros.length >= 10) {
    return numero;
  }
  
  return null; // Número inválido
}

// 📌 Función para obtener saludo personalizado según la hora
function obtenerSaludoPersonalizado(nombreUsuario = null) {
  const hora = new Date().getHours();
  let saludo = '';
  
  if (hora >= 5 && hora < 12) {
    saludo = nombreUsuario 
      ? `🌅 ¡Buenos días ${nombreUsuario}! ¡Qué bueno verte de nuevo! 🌱`
      : `🌅 ¡Buenos días! ¡Bienvenido a EKOKAI!`;
  } else if (hora >= 12 && hora < 18) {
    saludo = nombreUsuario 
      ? `☀️ ¡Buenas tardes ${nombreUsuario}! ¡Qué bueno verte de nuevo! 🌱`
      : `☀️ ¡Buenas tardes! ¡Bienvenido a EKOKAI!`;
  } else {
    saludo = nombreUsuario 
      ? `🌙 ¡Buenas noches ${nombreUsuario}! ¡Qué bueno verte de nuevo! 🌱`
      : `🌙 ¡Buenas noches! ¡Bienvenido a EKOKAI!`;
  }
  
  return saludo;
}

// 📌 Función para enviar menú principal
async function enviarMenuPrincipal(telefono, nombreUsuario = null) {
  console.log(`[LOG] Enviando menú principal a ${telefono}${nombreUsuario ? ` (${nombreUsuario})` : ''}`);
  
  // Personalizar saludo según si tenemos el nombre del usuario y la hora
  const saludoPersonalizado = obtenerSaludoPersonalizado(nombreUsuario);
  
  const menusPrincipales = [
    `${saludoPersonalizado}
Gracias por sumarte a la comunidad que premia el reciclaje. 🌱

📲 ¿En qué puedo ayudarte?

1️⃣ Conocer mis tokens  
2️⃣ Ver cupones para canjear  
3️⃣ Ubicación del ecopunto  
4️⃣ ¿Cómo funciona EKOKAI?

✍️ Escribí una opción o simplemente preguntame.`,
    
    `${saludoPersonalizado}
Soy tu asistente EKOKAI ♻️
Te ayudo a reciclar y ganar premios. 🌱

🎯 ¿Qué querés hacer?

1️⃣ Ver mis tokens acumulados
2️⃣ Explorar cupones disponibles
3️⃣ Encontrar ecopuntos cercanos
4️⃣ Conocer cómo funciona

💬 Escribí el número o preguntame lo que quieras.`,
    
    `${saludoPersonalizado}
Donde reciclar se convierte en premios. 🎁

📱 ¿En qué te ayudo hoy?

1️⃣ Consultar mis tokens
2️⃣ Ver premios disponibles
3️⃣ Ubicación de ecopuntos
4️⃣ Información del sistema

✍️ Elegí una opción o preguntame directamente.`
  ];
  
  const menuAleatorio = menusPrincipales[Math.floor(Math.random() * menusPrincipales.length)];
  await responderWhatsApp(telefono, menuAleatorio);
}

function esSaludo(mensaje) {
  const saludos = [
    'hola', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches', 
    'hi', 'hello', 'hey', 'buen día', 'buenas noches', 'saludos',
    // Variaciones con faltas ortográficas comunes
    'ola', 'ola k tal', 'ola que tal', 'buenas tardes', 'buenos dias',
    'buenas noches', 'buen dia', 'saludo', 'saludos cordiales',
    // Más variaciones y faltas de ortografía
    'hols', 'holas', 'holaa', 'holaaa', 'ola', 'olas', 'olaa', 'olaaa',
    'buenas', 'buenos', 'buen', 'buenos dias', 'buenos días', 'buen dia', 'buen día',
    'buenas tardes', 'buenas noches', 'buenas noches', 'buenas noches',
    'saludos', 'saludo', 'saludos cordiales', 'saludos cordiales',
    'hey', 'heyy', 'heyyy', 'hi', 'hii', 'hiii', 'hello', 'helloo', 'hellooo',
    'que tal', 'ke tal', 'que tal', 'ke tal', 'como estas', 'komo estas',
    'como estás', 'komo estás', 'todo bien', 'todo bien', 'todo bien'
  ];
  
  console.log(`[LOG] Verificando saludo: "${mensaje}" | Longitud: ${mensaje.length}`);
  console.log(`[LOG] Lista de saludos a verificar: ${JSON.stringify(saludos)}`);
  
  // Primero verificar coincidencia exacta
  const coincidenciaExacta = saludos.some(saludo => {
    const contiene = mensaje.toLowerCase().includes(saludo);
    console.log(`[LOG] Verificando "${saludo}" en "${mensaje.toLowerCase()}" -> ${contiene}`);
    return contiene;
  });
  
  if (coincidenciaExacta) {
    console.log(`[LOG] ¿Es saludo?: true | Mensaje recibido: "${mensaje}"`);
    return true;
  }
  
  // Si no hay coincidencia exacta, usar similitud
  const mejorCoincidencia = encontrarMejorCoincidencia(mensaje, saludos, 0.6);
  const resultado = mejorCoincidencia !== null;
  
  console.log(`[LOG] ¿Es saludo?: ${resultado} | Mensaje recibido: "${mensaje}"`);
  return resultado;
}

function esOpcionRegistro(mensaje) {
  const opcionesRegistro = [
    'registrarme', 'registrarse', 'registrar', 'crear cuenta', 
    'no estoy registrado', 'registro', '5',
    // Variaciones con faltas ortográficas
    'registrame', 'registrarse', 'registrar', 'crear cuanta',
    'no estoy registrado', 'registro', 'cinco', '5',
    'me registro', 'quiero registrarme', 'darme de alta',
    'alta', 'inscribirme', 'inscribir', 'anotarme'
  ];
  
  console.log(`[LOG] Verificando opción de registro: "${mensaje}"`);
  
  // Primero verificar coincidencia exacta
  const coincidenciaExacta = opcionesRegistro.some(opcion => {
    const contiene = mensaje.toLowerCase().includes(opcion);
    console.log(`[LOG] Verificando "${opcion}" en "${mensaje.toLowerCase()}" -> ${contiene}`);
    return contiene;
  });
  
  if (coincidenciaExacta) {
    console.log(`[LOG] ¿Es opción de registro?: true | Mensaje recibido: "${mensaje}"`);
    return true;
  }
  
  // Si no hay coincidencia exacta, usar similitud
  const mejorCoincidencia = encontrarMejorCoincidencia(mensaje, opcionesRegistro, 0.6);
  const resultado = mejorCoincidencia !== null;
  
  console.log(`[LOG] ¿Es opción de registro?: ${resultado} | Mensaje recibido: "${mensaje}"`);
  return resultado;
}

function interpretarOpcionMenu(mensaje) {
  const opcionesMenu = {
    '1': ['1', 'uno', 'tokens', 'consultar tokens', 'ver tokens', 'mis tokens', 'token'],
    '2': ['2', 'dos', 'cupones', 'ver cupones', 'cupones disponibles', 'canjear', 'premios', 'catalogo', 'catálogo'],
    '3': ['3', 'tres', 'punto', 'puntos', 'reciclaje', 'punto de reciclaje', 'ecopunto', 'ecopuntos', 'donde reciclar', 'donde puedo reciclar', 'ubicacion', 'ubicación'],
    '4': ['4', 'cuatro', 'registrarme', 'registro', 'registrarse', 'crear cuenta'],
    '5': ['5', 'cinco', 'como funciona', 'cómo funciona', 'como funciona ekokai', 'cómo funciona ekokai', 'ayuda', 'informacion', 'información', 'que es ekokai', 'qué es ekokai']
  };
  
  console.log(`[LOG] Interpretando opción de menú: "${mensaje}"`);
  
  // Primero verificar números exactos
  if (['1', '2', '3', '4', '5', '6', '7'].includes(mensaje.trim())) {
    console.log(`[LOG] Opción numérica detectada: ${mensaje.trim()}`);
    return mensaje.trim();
  }
  
  // Buscar coincidencia por similitud
  for (const [numero, variaciones] of Object.entries(opcionesMenu)) {
    const mejorCoincidencia = encontrarMejorCoincidencia(mensaje, variaciones, 0.6);
    if (mejorCoincidencia) {
      console.log(`[LOG] Opción interpretada: ${numero} (coincidencia: "${mejorCoincidencia}")`);
      return numero;
    }
  }
  
  console.log(`[LOG] No se pudo interpretar la opción: "${mensaje}"`);
  return null;
}

async function manejarOpcionNoRegistrado(telefono, opcion) {
  console.log(`[LOG] Usuario NO registrado intentó acceder a opción: ${opcion}`);
  
  // Para la opción 5 (Cómo funciona EKOKAI), mostrar información sin necesidad de registro
  if (opcion === '5') {
    await responderWhatsApp(
      telefono,
      `🎯 **¿Cómo funciona EKOKAI?** 🌱\n\n` +
      `♻️ **El proceso es simple:**\n` +
      `1️⃣ Recolecta residuos reciclables (plástico, vidrio, papel, latas)\n` +
      `2️⃣ Llévalos limpios y secos al ecopunto más cercano\n` +
      `3️⃣ Un encargado los pesará en balanza digital\n` +
      `4️⃣ Recibes tokens automáticamente en tu cuenta\n` +
      `5️⃣ Canjea tokens por cupones y beneficios\n\n` +
      `🪙 **Sistema de tokens:**\n` +
      `• 1 kg de plástico = 5 tokens\n` +
      `• 1 kg de vidrio = 3 tokens\n` +
      `• 1 kg de papel = 2 tokens\n` +
      `• 1 kg de latas = 4 tokens\n\n` +
      `🎁 **Beneficios:**\n` +
      `• Descuentos en comercios locales\n` +
      `• Entradas gratuitas a eventos\n` +
      `• Servicios especiales\n` +
      `• Contribuyes al medioambiente\n\n` +
      `🌍 **Impacto ambiental:**\n` +
      `Cada kilo reciclado evita la emisión de CO2 y reduce la contaminación. ¡Tú haces la diferencia! ♻️✨`
    );
    return;
  }
  
  // Para la opción 3 (Ubicaciones), mostrar sin necesidad de registro
  if (opcion === '3') {
    await responderWhatsApp(
      telefono,
      `🗺️ Puntos de reciclaje más cercanos:\n\n📍 EcoPunto Central\n🏠 Av. Corrientes 1234, CABA\n⏰ Lunes a Sábado 9:00-18:00\n📞 +54 11 1234-5678\n\n📍 EcoPunto Norte\n🏠 Av. Santa Fe 5678, CABA\n⏰ Martes a Domingo 10:00-19:00\n📞 +54 11 8765-4321\n\n📍 EcoPunto Sur\n🏠 Av. 9 de Julio 9012, CABA\n⏰ Lunes a Viernes 8:00-17:00\n📞 +54 11 2109-8765\n\n🗺️ Para más ubicaciones visita: ekokai.com/ecopuntos`
    );
    return;
  }
  
  // Para otras opciones, requerir registro
  await responderWhatsApp(
    telefono, 
    `❌ Vecino no encontrado. Debes registrarte primero para acceder a esta función.`
  );
  await enviarMenuPrincipal(telefono);
}

// Función para detectar intenciones globales durante el registro
function detectarIntencionGlobal(mensaje) {
  const texto = normalizarTexto(mensaje);

  // Cancelar o salir
  if (/^(cancelar|no|salir|volver|anular|stop|terminar|abortar|cancel|exit|menu|menu)$/i.test(texto)) {
    return { tipo: 'cancelar' };
  }

  // Menú principal
  if (/^(menu|menu|volver al menu)$/i.test(texto)) {
    return { tipo: 'menu' };
  }

  // Cómo reciclar
  if (/como reciclar|ayuda reciclaje|que reciclar|reciclaje|reciclar/.test(texto)) {
    return { tipo: 'como_reciclar' };
  }

  // Canjes
  if (/canje|canjes|ver canjes|historial de canjes|premios canjeados/.test(texto)) {
    return { tipo: 'canjes' };
  }

  // Puntos de reciclaje
  if (/punto de reciclaje|ecopunto|ecopuntos|donde reciclar/.test(texto)) {
    return { tipo: 'puntos_reciclaje' };
  }

  // Registro
  if (/registrarme|registrarse|crear cuenta|alta|inscribirme|inscribir|anotarme/.test(texto)) {
    return { tipo: 'registro' };
  }

  // Tokens
  if (/tokens|consultar tokens|ver tokens|mis tokens|token/.test(texto)) {
    return { tipo: 'tokens' };
  }

  // Historial
  if (/historial|ver historial|mis entregas|entregas|historial de entregas/.test(texto)) {
    return { tipo: 'historial' };
  }

  // Catálogo
  if (/catalogo|catalogo|ver catalogo|premios|ver premios/.test(texto)) {
    return { tipo: 'catalogo' };
  }

  return null;
}

// Función para validar si un apellido es válido
function esApellidoValido(apellido) {
  const ap = normalizarTexto(apellido);
  // No debe contener números ni símbolos, ni ser muy largo
  if (/\d/.test(ap)) return false;
  if (/[^a-z\s'-]/.test(ap)) return false;
  if (ap.length < 2 || ap.length > 30) return false;
  return true;
}

// Función para consultar Dialogflow y obtener el intent detectado
async function detectarIntentDialogflow(texto, telefono) {
  try {
    const sessionId = telefono.replace(/[^\w]/g, '').substring(0, 36);
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: texto,
          languageCode: 'es',
        },
      },
    };
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    
    // Extraer fulfillmentTag si existe
    let fulfillmentTag = null;
    console.log(`[LOG] Verificando fulfillmentMessages:`, JSON.stringify(result.fulfillmentMessages, null, 2));
    
    if (result.fulfillmentMessages && result.fulfillmentMessages.length > 0) {
      for (const message of result.fulfillmentMessages) {
        console.log(`[LOG] Procesando message:`, JSON.stringify(message, null, 2));
        
        // Verificar diferentes estructuras posibles del payload
        if (message.payload) {
          console.log(`[LOG] Payload encontrado:`, JSON.stringify(message.payload, null, 2));
          
          // Estructura 1: payload.fields.tag
          if (message.payload.fields && message.payload.fields.tag) {
            fulfillmentTag = message.payload.fields.tag.stringValue;
            console.log(`[LOG] Tag encontrada en fields.tag: ${fulfillmentTag}`);
            break;
          }
          
          // Estructura 2: payload directo con tag
          if (message.payload.tag) {
            fulfillmentTag = message.payload.tag;
            console.log(`[LOG] Tag encontrada en payload.tag: ${fulfillmentTag}`);
            break;
          }
          
          // Estructura 3: payload como string JSON
          if (typeof message.payload === 'string') {
            try {
              const payloadObj = JSON.parse(message.payload);
              if (payloadObj.tag) {
                fulfillmentTag = payloadObj.tag;
                console.log(`[LOG] Tag encontrada en payload JSON: ${fulfillmentTag}`);
                break;
              }
            } catch (e) {
              console.log(`[LOG] Error parseando payload JSON: ${e.message}`);
            }
          }
        }
      }
    }
    
    console.log(`[LOG] FulfillmentTag final: ${fulfillmentTag}`);
    
    return {
      intent: result.intent?.displayName || null,
      confidence: result.intentDetectionConfidence || 0,
      fulfillmentText: result.fulfillmentText || '',
      fulfillmentTag: fulfillmentTag
    };
  } catch (err) {
    console.error('[ERROR] Error al consultar Dialogflow:', err);
    return { intent: null, confidence: 0, fulfillmentText: '', fulfillmentTag: null };
  }
}

// Mejorar el flujo de registro para usar Dialogflow para intenciones
async function manejarFlujoRegistro(telefono, mensajeUsuario) {
  const estado = registroTemporal[telefono];
  console.log(`[LOG] Flujo de registro para ${telefono} | Paso actual: ${estado.paso} | Valor recibido: "${mensajeUsuario}"`);

  // Primero, consultar Dialogflow
  const dialogflowIntent = await detectarIntentDialogflow(mensajeUsuario, telefono);
  if (dialogflowIntent.intent) {
    const intent = dialogflowIntent.intent;
    console.log(`[LOG] Dialogflow detectó intent: ${intent} (confianza: ${dialogflowIntent.confidence})`);
    
    // Solo procesar intents que interrumpan el registro si la confianza es alta
    if (dialogflowIntent.confidence > 0.7) {
      if (intent === 'CancelarRegistro') {
        delete registroTemporal[telefono];
        await responderWhatsApp(telefono, '❌ Registro cancelado. Volviendo al menú principal.');
        await enviarMenuPrincipal(telefono);
        return;
      }
      if (intent === 'Como Reciclar') {
        delete registroTemporal[telefono];
        await manejarOpcionRegistrado(telefono, '7', { nombre: 'Vecino' });
        return;
      }
      if (intent === 'CatalogoPremios') {
        delete registroTemporal[telefono];
        await manejarOpcionRegistrado(telefono, '3', { nombre: 'Vecino' });
        return;
      }
      if (intent === 'ConsultarTokens') {
        delete registroTemporal[telefono];
        await manejarOpcionRegistrado(telefono, '1', { nombre: 'Vecino', tokensAcumulados: 0 });
        return;
      }
      if (intent === 'HistorialEntregas') {
        delete registroTemporal[telefono];
        await manejarOpcionRegistrado(telefono, '2', { nombre: 'Vecino' });
        return;
      }
    }
    
    // Para Registrarme, solo procesar si no está ya registrándose
    if (intent === 'Registrarme') {
      if (!registroTemporal[telefono]) {
        registroTemporal[telefono] = { paso: 'nombre', datos: {} };
        await responderWhatsApp(telefono, '✍️ Vamos a registrarte. Por favor envíame tu nombre:');
        return;
      } else {
        console.log(`[LOG] Usuario ya está en registro (paso: ${registroTemporal[telefono].paso}). Ignorando intent de registro.`);
        // No hacer return aquí, continuar con el flujo normal
      }
    }
  }

  // Detectar intención global local (fallback)
  const intencion = detectarIntencionGlobal(mensajeUsuario);
  if (intencion) {
    delete registroTemporal[telefono];
    switch (intencion.tipo) {
      case 'cancelar':
        await responderWhatsApp(telefono, '❌ Registro cancelado. Volviendo al menú principal.');
        await enviarMenuPrincipal(telefono);
        return;
      case 'menu':
        await enviarMenuPrincipal(telefono);
        return;
      case 'como_reciclar':
        await manejarOpcionRegistrado(telefono, '7', { nombre: 'Vecino' });
        return;
      case 'canjes':
        await manejarOpcionRegistrado(telefono, '6', { nombre: 'Vecino' });
        return;
      case 'puntos_reciclaje':
        await manejarOpcionRegistrado(telefono, '4', { nombre: 'Vecino' });
        return;
      case 'registro':
        registroTemporal[telefono] = { paso: 'nombre', datos: {} };
        await responderWhatsApp(telefono, '✍️ Vamos a registrarte. Por favor envíame tu nombre:');
        return;
      case 'tokens':
        await manejarOpcionRegistrado(telefono, '1', { nombre: 'Vecino', tokensAcumulados: 0 });
        return;
      case 'historial':
        await manejarOpcionRegistrado(telefono, '2', { nombre: 'Vecino' });
        return;
      case 'catalogo':
        await manejarOpcionRegistrado(telefono, '3', { nombre: 'Vecino' });
        return;
    }
  }

  switch (estado.paso) {
    case 'nombre':
      // Validar nombre (no debe ser muy largo ni contener números)
      const nombreNorm = normalizarTexto(mensajeUsuario);
      if (nombreNorm.length > 30 || /\d/.test(nombreNorm)) {
        await responderWhatsApp(telefono, '❌ El nombre no parece válido. Por favor ingresa solo tu nombre (sin números ni símbolos):');
        return;
      }
      estado.datos.nombre = mensajeUsuario;
      estado.paso = 'apellido';
      await responderWhatsApp(telefono, '✍️ Ahora envíame tu apellido:');
      break;
    case 'apellido':
      // Validar apellido
      if (!esApellidoValido(mensajeUsuario)) {
        await responderWhatsApp(telefono, '❌ El apellido no parece válido. Por favor ingresa solo tu apellido (sin números ni símbolos):');
        return;
      }
      estado.datos.apellido = mensajeUsuario;
      estado.paso = 'dni';
      await responderWhatsApp(telefono, '🪪 Ahora envíame tu DNI:');
      break;
    case 'dni':
      // Validar DNI (solo números, longitud razonable)
      const dniNorm = normalizarTexto(mensajeUsuario);
      if (!/^\d{6,12}$/.test(dniNorm)) {
        await responderWhatsApp(telefono, '❌ El DNI debe ser solo números (6 a 12 dígitos). Intenta de nuevo:');
        return;
      }
      estado.datos.dni = mensajeUsuario;
      estado.paso = 'email';
      await responderWhatsApp(telefono, '📧 Ahora envíame tu correo electrónico:');
      break;
    case 'email':
      // Validar email básico
      const emailNorm = normalizarTexto(mensajeUsuario);
      if (!/^\S+@\S+\.\S+$/.test(emailNorm)) {
        await responderWhatsApp(telefono, '❌ El correo no parece válido. Intenta de nuevo:');
        return;
      }
      estado.datos.email = mensajeUsuario;
      // Guardar el teléfono desde el parámetro de la función
      estado.datos.telefono = telefono;
      console.log(`[LOG] Teléfono tomado automáticamente del WhatsApp: "${telefono}"`);
      try {
        const creado = await usuarioRepo.crearUsuario({
          ...estado.datos,
          rol: 'vecino',
          password: '12345678',
          requiereCambioPassword: true
        });
        delete registroTemporal[telefono];
        // Limpiar cache para este usuario
        usuarioCache.delete(telefono);
        console.log(`[LOG] Usuario registrado exitosamente: ${JSON.stringify(creado)}`);
        await responderWhatsApp(
          telefono, 
          `🎉 ¡Registro completo! Bienvenido a la familia EKOKAI, ${creado.nombre}.\n📱 Tu número registrado: ${telefono}\n🌱 ¡Ya podés empezar a reciclar y ganar tokens!`
        );
        await enviarMenuPrincipal(telefono, creado.nombre);
      } catch (err) {
        console.error(`[ERROR] Error al registrar usuario:`, err);
        await responderWhatsApp(telefono, '❌ Hubo un problema al registrarte. Intenta más tarde.');
        delete registroTemporal[telefono];
      }
      break;
  }
}

async function manejarOpcionRegistrado(telefono, opcion, usuario) {
  console.log(`[LOG] Usuario registrado (${usuario.nombre}) seleccionó opción: ${opcion}`);
  switch (opcion) {
    case '1':
      const tokens = usuario.tokensAcumulados ?? 0;
      if (tokens > 0) {
        await responderWhatsApp(telefono, `🪙 ¡Hola ${usuario.nombre}! Tienes ${tokens} tokens acumulados. ¡Excelente trabajo reciclando! 🌱`);
      } else {
        await responderWhatsApp(telefono, `🪙 ¡Hola ${usuario.nombre}! Aún no tienes tokens acumulados. ¡Llevá tus residuos al ecopunto más cercano para empezar a ganar! 🌱`);
      }
      break;
    case '2':
      await responderWhatsApp(
        telefono,
        `🎁 Cupones disponibles para canjear:\n\n` +
        `🛍️ **Comercios locales:**\n` +
        `• 10 tokens: 20% descuento en panadería\n` +
        `• 15 tokens: 15% descuento en verdulería\n` +
        `• 20 tokens: 25% descuento en librería\n` +
        `• 30 tokens: 30% descuento en farmacia\n\n` +
        `🎫 **Beneficios especiales:**\n` +
        `• 25 tokens: Entrada gratis al cine\n` +
        `• 40 tokens: Clase de yoga gratuita\n` +
        `• 50 tokens: Masaje relajante\n` +
        `• 100 tokens: Día completo en spa\n\n` +
        `🌟 **Descuentos exclusivos:**\n` +
        `• 35 tokens: 50% descuento en transporte público\n` +
        `• 45 tokens: 40% descuento en gimnasio\n` +
        `• 60 tokens: 60% descuento en restaurante\n\n` +
        `💡 Para canjear, acércate al ecopunto más cercano con tu código de usuario.`
      );
      break;
    case '3':
      await responderWhatsApp(
        telefono,
        `🗺️ Puntos de reciclaje más cercanos:\n\n📍 EcoPunto Central\n🏠 Av. Corrientes 1234, CABA\n⏰ Lunes a Sábado 9:00-18:00\n📞 +54 11 1234-5678\n\n📍 EcoPunto Norte\n🏠 Av. Santa Fe 5678, CABA\n⏰ Martes a Domingo 10:00-19:00\n📞 +54 11 8765-4321\n\n📍 EcoPunto Sur\n🏠 Av. 9 de Julio 9012, CABA\n⏰ Lunes a Viernes 8:00-17:00\n📞 +54 11 2109-8765\n\n🗺️ Para más ubicaciones visita: ekokai.com/ecopuntos`
      );
      break;
    case '4':
      await responderWhatsApp(telefono, `✅ ¡Hola ${usuario.nombre}! Ya estás registrado en EKOKAI. ¿En qué puedo ayudarte hoy? 🌱`);
      await enviarMenuPrincipal(telefono, usuario.nombre);
      break;
    case '5':
      await responderWhatsApp(
        telefono,
        `🎯 **¿Cómo funciona EKOKAI?** 🌱\n\n` +
        `♻️ **El proceso es simple:**\n` +
        `1️⃣ Recolecta residuos reciclables (plástico, vidrio, papel, latas)\n` +
        `2️⃣ Llévalos limpios y secos al ecopunto más cercano\n` +
        `3️⃣ Un encargado los pesará en balanza digital\n` +
        `4️⃣ Recibes tokens automáticamente en tu cuenta\n` +
        `5️⃣ Canjea tokens por cupones y beneficios\n\n` +
        `🪙 **Sistema de tokens:**\n` +
        `• 1 kg de plástico = 5 tokens\n` +
        `• 1 kg de vidrio = 3 tokens\n` +
        `• 1 kg de papel = 2 tokens\n` +
        `• 1 kg de latas = 4 tokens\n\n` +
        `🎁 **Beneficios:**\n` +
        `• Descuentos en comercios locales\n` +
        `• Entradas gratuitas a eventos\n` +
        `• Servicios especiales\n` +
        `• Contribuyes al medioambiente\n\n` +
        `🌍 **Impacto ambiental:**\n` +
        `Cada kilo reciclado evita la emisión de CO2 y reduce la contaminación. ¡Tú haces la diferencia! ♻️✨`
      );
      break;
    default:
      await enviarMenuPrincipal(telefono, usuario.nombre);
      break;
  }
}

const dialogflowWebhook = async (req, res) => {
  console.log('================ NUEVA PETICIÓN AL WEBHOOK DE WHATSAPP ================');
  console.log(`[LOG] Fecha/Hora: ${new Date().toLocaleString('es-CL')}`);
  console.log(`[LOG] IP Remota: ${req.ip}`);
  console.log(`[LOG] Headers: ${JSON.stringify(req.headers)}`);
  console.log(`[LOG] Body recibido: ${JSON.stringify(req.body)}`);

  // Detectar si es una petición de Dialogflow (webhook fulfillment)
  const isDialogflowWebhook = req.headers['user-agent']?.includes('Google-Dialogflow') || 
                             req.body.queryResult || 
                             req.body.responseId;
  
  if (isDialogflowWebhook) {
    console.log('[LOG] Petición detectada como webhook de Dialogflow. Ignorando.');
    return res.status(200).send();
  }

  // Verificar que sea una petición válida de Twilio
  if (!req.body.From || !req.body.Body) {
    console.log('[LOG] Petición no válida de Twilio. Ignorando.');
    return res.status(200).send();
  }

  if (!sessionClient) {
    console.error('[ERROR] SessionsClient no está disponible');
    await responderWhatsApp(req.body.From?.replace('whatsapp:', ''), 'Error interno. Intenta más tarde.');
    return res.status(500).send();
  }

  try {
    const telefono = req.body.From?.replace('whatsapp:', '');
    const mensajeUsuario = req.body.Body?.trim();
    const mensajeLower = mensajeUsuario ? mensajeUsuario.toLowerCase() : '';
    let usuario = null; // Declarar usuario al inicio para que esté disponible en todo el scope

    console.log(`[LOG] Teléfono extraído: ${telefono}`);
    console.log(`[LOG] Mensaje recibido: "${mensajeUsuario}"`);

    if (!telefono || !mensajeUsuario) {
      console.warn('[LOG] Teléfono o mensaje vacío. No se procesa la petición.');
      return res.status(400).send();
    }

    // 🔥 NUEVO: Siempre consultar Dialogflow CX primero
    console.log('[LOG] Consultando Dialogflow CX...');
    console.log(`[LOG] Mensaje a enviar a Dialogflow: "${mensajeUsuario}"`);
    const dialogflowIntent = await detectarIntentDialogflow(mensajeUsuario, telefono);
    console.log(`[LOG] Dialogflow CX resultado:`, {
      intent: dialogflowIntent.intent,
      confidence: dialogflowIntent.confidence,
      fulfillmentText: dialogflowIntent.fulfillmentText,
      fulfillmentTag: dialogflowIntent.fulfillmentTag
    });
    console.log(`[LOG] Mensaje original: "${mensajeUsuario}"`);
    console.log(`[LOG] Intent detectado: "${dialogflowIntent.intent}"`);
    console.log(`[LOG] Confianza: ${dialogflowIntent.confidence}`);
    console.log(`[LOG] FulfillmentText: "${dialogflowIntent.fulfillmentText}"`);
    console.log(`[LOG] FulfillmentTag: "${dialogflowIntent.fulfillmentTag}"`);
    
    // 🔥 DIAGNÓSTICO: Analizar por qué no se detectan las frases de entrenamiento
    if (dialogflowIntent.intent === 'Default Fallback Intent' && dialogflowIntent.confidence === 1) {
      console.log(`[LOG] ⚠️ DIAGNÓSTICO: Dialogflow no reconoció "${mensajeUsuario}"`);
      console.log(`[LOG] ⚠️ Posibles causas:`);
      console.log(`[LOG] ⚠️ 1. La frase no está en las frases de entrenamiento`);
      console.log(`[LOG] ⚠️ 2. El intent no está configurado correctamente`);
      console.log(`[LOG] ⚠️ 3. La confianza es muy baja`);
      console.log(`[LOG] ⚠️ 4. Problema de configuración en Dialogflow CX`);
    }

    // Si Dialogflow detectó un intent con alta confianza, procesarlo
    if (dialogflowIntent.intent && dialogflowIntent.confidence > 0.6) {
      console.log(`[LOG] Dialogflow CX detectó intent: ${dialogflowIntent.intent} (confianza: ${dialogflowIntent.confidence})`);
      
      // Procesar intents específicos
      const intent = dialogflowIntent.intent;
      
      // 🔥 PRIORIDAD 1: Saludos y menú principal - SIEMPRE usar nuestro menú personalizado
      if (intent === 'Default Welcome Intent' || 
          intent.includes('saludo') || 
          intent.includes('hola') || 
          intent.includes('welcome') ||
          intent.includes('greeting') ||
          intent.includes('buenas') ||
          intent.includes('buenos') ||
          intent.includes('hello') ||
          intent.includes('hi')) {
        console.log('[LOG] Intent de saludo detectado por Dialogflow CX - Usando menú personalizado');
        // Buscar usuario para personalizar el saludo
        usuario = await obtenerUsuarioConCache(telefono);
        const nombreUsuario = usuario ? usuario.nombre : null;
        await enviarMenuPrincipal(telefono, nombreUsuario);
        return res.status(200).send();
      }
      
      // 🔥 PRIORIDAD 2: Procesar fulfillment tags específicos
      if (dialogflowIntent.fulfillmentTag) {
        const tag = dialogflowIntent.fulfillmentTag;
        console.log(`[LOG] Dialogflow CX detectó fulfillment tag: ${tag}`);
        
        if (tag === 'eco_punto') {
          console.log('[LOG] Procesando tag eco_punto - Mostrando ubicaciones de ecopuntos');
          await responderWhatsApp(
            telefono,
            `🗺️ Puntos de reciclaje más cercanos:\n\n📍 EcoPunto Central\n🏠 Av. Corrientes 1234, CABA\n⏰ Lunes a Sábado 9:00-18:00\n📞 +54 11 1234-5678\n\n📍 EcoPunto Norte\n🏠 Av. Santa Fe 5678, CABA\n⏰ Martes a Domingo 10:00-19:00\n📞 +54 11 8765-4321\n\n📍 EcoPunto Sur\n🏠 Av. 9 de Julio 9012, CABA\n⏰ Lunes a Viernes 8:00-17:00\n📞 +54 11 2109-8765\n\n🗺️ Para más ubicaciones visita: ekokai.com/ecopuntos`
          );
          return res.status(200).send();
        }
      }
      
      // 🔥 VERIFICACIÓN ADICIONAL: Detectar intents de ecopuntos por nombre
      if (intent && (intent.includes('ecopunto') || intent.includes('punto') || intent.includes('ubicacion') || intent.includes('donde'))) {
        console.log(`[LOG] Intent relacionado con ecopuntos detectado: ${intent}`);
        await responderWhatsApp(
          telefono,
          `🗺️ Puntos de reciclaje más cercanos:\n\n📍 EcoPunto Central\n🏠 Av. Corrientes 1234, CABA\n⏰ Lunes a Sábado 9:00-18:00\n📞 +54 11 1234-5678\n\n📍 EcoPunto Norte\n🏠 Av. Santa Fe 5678, CABA\n⏰ Martes a Domingo 10:00-19:00\n📞 +54 11 8765-4321\n\n📍 EcoPunto Sur\n🏠 Av. 9 de Julio 9012, CABA\n⏰ Lunes a Viernes 8:00-17:00\n📞 +54 11 2109-8765\n\n🗺️ Para más ubicaciones visita: ekokai.com/ecopuntos`
        );
        return res.status(200).send();
      }
      
      // 🔥 VERIFICACIÓN ESPECIAL: Si es Default Fallback Intent, analizar el contenido del mensaje
      if (intent === 'Default Fallback Intent') {
        console.log(`[LOG] Default Fallback Intent detectado, analizando contenido: "${mensajeUsuario}"`);
        const mensajeLower = mensajeUsuario.toLowerCase();
        
        // Detectar consultas de cómo funciona (PRIORIDAD ALTA)
        const esConsultaFuncionamiento = mensajeLower.includes('como funciona') || 
                                        mensajeLower.includes('cómo funciona') || 
                                        mensajeLower.includes('que es') || 
                                        mensajeLower.includes('qué es') ||
                                        mensajeLower.includes('ayuda') ||
                                        mensajeLower.includes('informacion') ||
                                        mensajeLower.includes('información');
        
        console.log(`[LOG] ¿Es consulta de funcionamiento?: ${esConsultaFuncionamiento}`);
        
        if (esConsultaFuncionamiento) {
          console.log('[LOG] Consulta de funcionamiento detectada en Default Fallback Intent');
          const respuestasFuncionamiento = [
            `🎯 **¿Cómo funciona EKOKAI?** 🌱\n\n♻️ **El proceso es simple:**\n1️⃣ Recolecta residuos reciclables (plástico, vidrio, papel, latas)\n2️⃣ Llévalos limpios y secos al ecopunto más cercano\n3️⃣ Un encargado los pesará en balanza digital\n4️⃣ Recibes tokens automáticamente en tu cuenta\n5️⃣ Canjea tokens por cupones y beneficios\n\n🪙 **Sistema de tokens:**\n• 1 kg de plástico = 5 tokens\n• 1 kg de vidrio = 3 tokens\n• 1 kg de papel = 2 tokens\n• 1 kg de latas = 4 tokens\n\n🎁 **Beneficios:**\n• Descuentos en comercios locales\n• Entradas gratuitas a eventos\n• Servicios especiales\n• Contribuyes al medioambiente\n\n🌍 **Impacto ambiental:**\nCada kilo reciclado evita la emisión de CO2 y reduce la contaminación. ¡Tú haces la diferencia! ♻️✨`,
            
            `🌿 **¡EKOKAI te explica!** ♻️\n\n📋 **Así funciona nuestro sistema:**\n\n🔄 **Paso a paso:**\n1. Juntá tus residuos reciclables\n2. Llevalos al ecopunto más cercano\n3. Te pesamos y registramos\n4. ¡Recibís tokens al instante!\n5. Canjealos por premios increíbles\n\n💰 **Valor de los materiales:**\n• Plástico PET: 5 tokens/kg\n• Vidrio: 3 tokens/kg\n• Papel y cartón: 2 tokens/kg\n• Latas: 4 tokens/kg\n\n🎉 **Lo que ganás:**\n• Descuentos en comercios\n• Entradas gratis\n• Servicios especiales\n• ¡Planeta más limpio!\n\n💚 **Cada acción cuenta para el medioambiente** 🌍`,
            
            `♻️ **EKOKAI: Reciclaje que premia** 🌱\n\n🎯 **¿Cómo funciona?**\n\n📦 **Tu proceso:**\n1. Recolectá residuos limpios y secos\n2. Acercate al ecopunto\n3. Te pesamos con balanza digital\n4. ¡Tokens automáticos en tu cuenta!\n5. Canjealos por beneficios\n\n🪙 **Conversión de materiales:**\n• 1kg plástico = 5 tokens\n• 1kg vidrio = 3 tokens\n• 1kg papel = 2 tokens\n• 1kg latas = 4 tokens\n\n🏆 **Beneficios disponibles:**\n• Descuentos en comercios locales\n• Entradas a eventos\n• Servicios de bienestar\n• Contribución ambiental\n\n🌍 **Impacto positivo:**\nCada kilo reciclado reduce la contaminación y ayuda al planeta. ¡Vos hacés la diferencia! ✨`
          ];
          
          const respuestaAleatoria = respuestasFuncionamiento[Math.floor(Math.random() * respuestasFuncionamiento.length)];
          await responderWhatsApp(telefono, respuestaAleatoria);
          return res.status(200).send();
        }
        
        // Detectar consultas de tokens
        const esConsultaTokens = mensajeLower.includes('token') || 
                                mensajeLower.includes('tengo') || 
                                mensajeLower.includes('cuantos') || 
                                mensajeLower.includes('cuántos') ||
                                mensajeLower.includes('conocer') ||
                                mensajeLower.includes('ver mis') ||
                                mensajeLower.includes('mis tokens');
        
        console.log(`[LOG] ¿Es consulta de tokens?: ${esConsultaTokens}`);
        
        if (esConsultaTokens) {
          console.log('[LOG] Consulta de tokens detectada en Default Fallback Intent');
          usuario = await obtenerUsuarioConCache(telefono);
          if (usuario) {
            const tokens = usuario.tokensAcumulados ?? 0;
            const respuestasTokens = [
              `🪙 ¡Hola ${usuario.nombre}! Tienes ${tokens} tokens acumulados. ¡Excelente trabajo reciclando! 🌱`,
              `💰 ¡Hola ${usuario.nombre}! Tu balance actual: ${tokens} tokens EKOKAI. ¡Seguí así! 🌱`,
              `🎯 ¡Hola ${usuario.nombre}! Sumaste ${tokens} tokens reciclando. ¡Continuá ayudando al planeta! 🌱`,
              `🪙 ¡Hola ${usuario.nombre}! Balance de tokens: ${tokens} disponibles para canjear. ¡Fantástico! 🌱`,
              `💚 ¡Hola ${usuario.nombre}! ¡Excelente! Tenés ${tokens} tokens en tu cuenta EKOKAI. 🌱`,
              `🌟 ¡Hola ${usuario.nombre}! Tus tokens acumulados: ${tokens} - ¡Ya podés canjear premios increíbles! 🌱`
            ];
            const respuestaAleatoria = respuestasTokens[Math.floor(Math.random() * respuestasTokens.length)];
            await responderWhatsApp(telefono, respuestaAleatoria);
          } else {
            const respuestasNoRegistrado = [
              '❌ Vecino no encontrado. Debes registrarte primero para ver tus tokens.',
              '🔍 No encontramos tu registro. Registrate para ver tus tokens.',
              '📝 Primero necesitás registrarte para acceder a tus tokens.',
              '❌ Usuario no registrado. Completá tu registro para ver tokens.'
            ];
            const respuestaAleatoria = respuestasNoRegistrado[Math.floor(Math.random() * respuestasNoRegistrado.length)];
            await responderWhatsApp(telefono, respuestaAleatoria);
            await enviarMenuPrincipal(telefono);
          }
          return res.status(200).send();
        }
        
        // Detectar consultas de cupones
        const esConsultaCupones = mensajeLower.includes('cupon') || 
                                 mensajeLower.includes('cupón') || 
                                 mensajeLower.includes('canjear') || 
                                 mensajeLower.includes('premio') ||
                                 mensajeLower.includes('ver cupones') ||
                                 mensajeLower.includes('disponibles');
        
        console.log(`[LOG] ¿Es consulta de cupones?: ${esConsultaCupones}`);
        
        if (esConsultaCupones) {
          console.log('[LOG] Consulta de cupones detectada en Default Fallback Intent');
          usuario = await obtenerUsuarioConCache(telefono);
          if (usuario) {
            const respuestasCupones = [
              `🎁 **Cupones disponibles para canjear:**\n\n🛍️ **Comercios locales:**\n• 10 tokens: 20% descuento en panadería\n• 15 tokens: 15% descuento en verdulería\n• 20 tokens: 25% descuento en librería\n• 30 tokens: 30% descuento en farmacia\n\n🎫 **Beneficios especiales:**\n• 25 tokens: Entrada gratis al cine\n• 40 tokens: Clase de yoga gratuita\n• 50 tokens: Masaje relajante\n• 100 tokens: Día completo en spa\n\n🌟 **Descuentos exclusivos:**\n• 35 tokens: 50% descuento en transporte público\n• 45 tokens: 40% descuento en gimnasio\n• 60 tokens: 60% descuento en restaurante\n\n💡 Para canjear, acércate al ecopunto más cercano con tu código de usuario.`,
              
              `🎊 **¡Premios que podés canjear!** 🎁\n\n🏪 **Descuentos en comercios:**\n• 10 tokens = 20% off panadería\n• 15 tokens = 15% off verdulería\n• 20 tokens = 25% off librería\n• 30 tokens = 30% off farmacia\n\n🎬 **Experiencias únicas:**\n• 25 tokens = Cine gratis\n• 40 tokens = Clase de yoga\n• 50 tokens = Masaje relajante\n• 100 tokens = Día completo en spa\n\n🚌 **Beneficios especiales:**\n• 35 tokens = 50% off transporte\n• 45 tokens = 40% off gimnasio\n• 60 tokens = 60% off restaurante\n\n📍 Canjeá en cualquier ecopunto con tu código.`,
              
              `💎 **Catálogo de premios EKOKAI** 🌟\n\n🛒 **Descuentos locales:**\n• Panadería: 20% off (10 tokens)\n• Verdulería: 15% off (15 tokens)\n• Librería: 25% off (20 tokens)\n• Farmacia: 30% off (30 tokens)\n\n🎭 **Experiencias:**\n• Cine: Entrada gratis (25 tokens)\n• Yoga: Clase gratuita (40 tokens)\n• Spa: Masaje relajante (50 tokens)\n• Wellness: Día completo (100 tokens)\n\n🚇 **Servicios:**\n• Transporte: 50% descuento (35 tokens)\n• Gimnasio: 40% descuento (45 tokens)\n• Restaurante: 60% descuento (60 tokens)\n\n🎯 ¡Canjeá en el ecopunto más cercano!`
            ];
            const respuestaAleatoria = respuestasCupones[Math.floor(Math.random() * respuestasCupones.length)];
            await responderWhatsApp(telefono, respuestaAleatoria);
          } else {
            const respuestasNoRegistrado = [
              '❌ Vecino no encontrado. Debes registrarte primero para ver los cupones.',
              '🔍 No encontramos tu registro. Registrate para ver cupones.',
              '📝 Primero necesitás registrarte para acceder a los cupones.',
              '❌ Usuario no registrado. Completá tu registro para ver premios.'
            ];
            const respuestaAleatoria = respuestasNoRegistrado[Math.floor(Math.random() * respuestasNoRegistrado.length)];
            await responderWhatsApp(telefono, respuestaAleatoria);
            await enviarMenuPrincipal(telefono);
          }
          return res.status(200).send();
        }
        
        // Detectar consultas de ecopuntos (PRIORIDAD BAJA - después de las otras)
        const esConsultaEcopuntos = mensajeLower.includes('ecopunto') || 
                                   mensajeLower.includes('punto') || 
                                   mensajeLower.includes('donde') || 
                                   mensajeLower.includes('ubicacion') || 
                                   mensajeLower.includes('ubicación') ||
                                   mensajeLower.includes('mostrame') ||
                                   mensajeLower.includes('muéstrame') ||
                                   mensajeLower.includes('ir') ||
                                   mensajeLower.includes('llevar') ||
                                   mensajeLower.includes('reciclar') ||
                                   mensajeLower.includes('queda') ||
                                   mensajeLower.includes('encuentro');
        
        console.log(`[LOG] ¿Es consulta de ecopuntos?: ${esConsultaEcopuntos}`);
        
        if (esConsultaEcopuntos) {
          console.log('[LOG] Consulta de ecopuntos detectada en Default Fallback Intent');
          const respuestasEcopuntos = [
            `🗺️ **Puntos de reciclaje más cercanos:**\n\n📍 **EcoPunto Central**\n🏠 Av. Corrientes 1234, CABA\n⏰ Lunes a Sábado 9:00-18:00\n📞 +54 11 1234-5678\n\n📍 **EcoPunto Norte**\n🏠 Av. Santa Fe 5678, CABA\n⏰ Martes a Domingo 10:00-19:00\n📞 +54 11 8765-4321\n\n📍 **EcoPunto Sur**\n🏠 Av. 9 de Julio 9012, CABA\n⏰ Lunes a Viernes 8:00-17:00\n📞 +54 11 2109-8765\n\n🗺️ Para más ubicaciones visita: ekokai.com/ecopuntos`,
            
            `📍 **¡Encontrá tu ecopunto más cercano!** 🗺️\n\n🏪 **EcoPunto Central**\n📍 Av. Corrientes 1234, CABA\n🕐 Lun-Sáb 9:00-18:00\n📱 +54 11 1234-5678\n\n🏪 **EcoPunto Norte**\n📍 Av. Santa Fe 5678, CABA\n🕐 Mar-Dom 10:00-19:00\n📱 +54 11 8765-4321\n\n🏪 **EcoPunto Sur**\n📍 Av. 9 de Julio 9012, CABA\n🕐 Lun-Vie 8:00-17:00\n📱 +54 11 2109-8765\n\n🌐 Más ubicaciones: ekokai.com/ecopuntos`,
            
            `♻️ **Ecopuntos disponibles:**\n\n🏠 **EcoPunto Central**\n📍 Corrientes 1234, CABA\n⏰ 9:00-18:00 (Lun-Sáb)\n📞 11 1234-5678\n\n🏠 **EcoPunto Norte**\n📍 Santa Fe 5678, CABA\n⏰ 10:00-19:00 (Mar-Dom)\n📞 11 8765-4321\n\n🏠 **EcoPunto Sur**\n📍 9 de Julio 9012, CABA\n⏰ 8:00-17:00 (Lun-Vie)\n📞 11 2109-8765\n\n🔗 ekokai.com/ecopuntos`
          ];
          const respuestaAleatoria = respuestasEcopuntos[Math.floor(Math.random() * respuestasEcopuntos.length)];
          await responderWhatsApp(telefono, respuestaAleatoria);
          return res.status(200).send();
        }
        

        
        console.log('[LOG] No se pudo clasificar el mensaje en Default Fallback Intent');
      }
      
      // 🔥 PRIORIDAD 3: Si hay fulfillmentText para otros intents, usarlo
      if (dialogflowIntent.fulfillmentText && dialogflowIntent.fulfillmentText.trim()) {
        console.log(`[LOG] Usando fulfillmentText de Dialogflow CX: "${dialogflowIntent.fulfillmentText}"`);
        await responderWhatsApp(telefono, dialogflowIntent.fulfillmentText);
        return res.status(200).send();
      }

      // Verificar si el usuario está registrado antes de procesar otros intents
      usuario = await obtenerUsuarioConCache(telefono);
      
      if (!usuario) {
        // Usuario NO registrado
        if (intent === 'Registrarme' || intent.includes('registro')) {
          console.log('[LOG] Intent de registro detectado para usuario NO registrado');
          registroTemporal[telefono] = { paso: 'nombre', datos: {} };
          await responderWhatsApp(telefono, '✍️ ¡Perfecto! Vamos a registrarte. Por favor envíame tu nombre:');
          return res.status(200).send();
        } else {
          // Para otros intents, mostrar mensaje de no registrado
          console.log(`[LOG] Usuario NO registrado intentó acceder a: ${intent}`);
          await responderWhatsApp(telefono, '❌ Vecino no encontrado. Debes registrarte primero para acceder a esta función.');
          await enviarMenuPrincipal(telefono);
          return res.status(200).send();
        }
      } else {
        // Usuario registrado - procesar intents
        console.log(`[LOG] Usuario registrado (${usuario.nombre}) - procesando intent: ${intent}`);
        
        if (intent === 'Registrarme' || intent.includes('registro')) {
          await responderWhatsApp(telefono, `✅ ¡Hola ${usuario.nombre}! Ya estás registrado en EKOKAI. ¿En qué puedo ayudarte hoy? 🌱`);
          await enviarMenuPrincipal(telefono, usuario.nombre);
          return res.status(200).send();
        }
        
        if (intent === 'ConsultarTokens' || intent.includes('token')) {
          const tokens = usuario.tokensAcumulados ?? 0;
          if (tokens > 0) {
            await responderWhatsApp(telefono, `🪙 ¡Hola ${usuario.nombre}! Tienes ${tokens} tokens acumulados. ¡Excelente trabajo reciclando! 🌱`);
          } else {
            await responderWhatsApp(telefono, `🪙 ¡Hola ${usuario.nombre}! Aún no tienes tokens acumulados. ¡Llevá tus residuos al ecopunto más cercano para empezar a ganar! 🌱`);
          }
          return res.status(200).send();
        }
        
        if (intent === 'HistorialEntregas' || intent.includes('historial')) {
          const entregas = await entregaRepo.buscarPorUsuario(usuario._id);
          if (!entregas || entregas.length === 0) {
            await responderWhatsApp(telefono, '📋 Aún no has registrado entregas.');
          } else {
            const ultima = entregas[entregas.length - 1];
            const totalKg = entregas.reduce((sum, e) => sum + (e.pesoKg || 0), 0);
            const totalTokens = entregas.reduce((sum, e) => sum + (e.tokensOtorgados || 0), 0);
            await responderWhatsApp(
              telefono,
              `♻️ Has hecho ${entregas.length} entregas.\n📅 Última: ${new Date(ultima.fecha).toLocaleString('es-CL')} - ${ultima.pesoKg ?? '?'} kg\n📦 Total reciclado: ${totalKg} kg\n🪙 Tokens obtenidos: ${totalTokens}`
            );
          }
          return res.status(200).send();
        }
        
        if (intent === 'CatalogoPremios' || intent.includes('catalogo') || intent.includes('premio')) {
          await responderWhatsApp(
            telefono,
            `🎁 Catálogo de premios:\n- 10 tokens: Bolsa ecológica\n- 20 tokens: Entrada a cine  \n- 30 tokens: Pack sorpresa\n- 50 tokens: Kit de jardinería\n- 100 tokens: Bicicleta ecológica`
          );
          return res.status(200).send();
        }
        
        if (intent === 'Como Reciclar' || intent.includes('reciclar') || intent.includes('ayuda')) {
          await responderWhatsApp(
            telefono,
            `♻️ **¿Cómo reciclar con EKOKAI?** 🌱\n\n` +
            `🎯 **¿Qué es EKOKAI?**\n` +
            `EKOKAI es un sistema que premia a los vecinos por reciclar correctamente. ¡Ganas tokens por cada kilo que recicles! 🪙\n\n` +
            `📋 **¿Qué materiales reciclar?**\n` +
            `• 🥤 Plásticos (botellas, envases)\n` +
            `• 🍷 Vidrios (botellas, frascos)\n` +
            `• 📰 Papel y cartón\n` +
            `• 🥫 Latas (aluminio, conservas)\n\n` +
            `⚠️ **Importante:** Los residuos deben estar limpios y secos\n\n` +
            `📍 **¿Dónde llevar los residuos?**\n` +
            `Llévalos al ecopunto más cercano. Un encargado los pesará en una balanza digital conectada a nuestra plataforma. ⚖️\n\n` +
            `📱 **¿No estás registrado?**\n` +
            `¡No hay problema! Puedes registrarte ahí mismo en el ecopunto o por WhatsApp. 👨‍💼\n\n` +
            `🎁 **¿Qué ganas?**\n` +
            `Por cada kilo entregado recibes tokens que puedes canjear por:\n` +
            `• 🛍️ Cupones en comercios locales\n` +
            `• 🎫 Beneficios especiales\n` +
            `• 🌟 Descuentos exclusivos\n\n` +
            `🌍 **Impacto ambiental**\n` +
            `Así ayudas a:\n` +
            `• ♻️ Reducir residuos\n` +
            `• 🔄 Impulsar la economía circular\n` +
            `• 🏪 Apoyar negocios comprometidos con el medioambiente\n\n` +
            `¡Únete a la revolución del reciclaje! 🌱♻️✨`
          );
          return res.status(200).send();
        }
        
        if (intent === 'PuntosReciclaje' || intent.includes('punto') || intent.includes('ecopunto')) {
          await responderWhatsApp(
            telefono,
            `🗺️ Puntos de reciclaje más cercanos:\n\n📍 EcoPunto Central\n🏠 Av. Corrientes 1234, CABA\n⏰ Lunes a Sábado 9:00-18:00\n📞 +54 11 1234-5678\n\n📍 EcoPunto Norte\n🏠 Av. Santa Fe 5678, CABA\n⏰ Martes a Domingo 10:00-19:00\n📞 +54 11 8765-4321\n\n📍 EcoPunto Sur\n🏠 Av. 9 de Julio 9012, CABA\n⏰ Lunes a Viernes 8:00-17:00\n📞 +54 11 2109-8765\n\n🗺️ Para más ubicaciones visita: ekokai.com/ecopuntos`
          );
          return res.status(200).send();
        }
      }
    }

    // 🧠 SISTEMA INTELIGENTE AVANZADO - Si Dialogflow no detectó nada, usar nuestro NLP
    console.log('[LOG] Dialogflow CX no detectó intent o confianza baja. Activando sistema inteligente local...');

    // 🔍 Buscar usuario al inicio para tenerlo disponible en todo el flujo
    usuario = await obtenerUsuarioConCache(telefono);
    console.log(`[LOG] Usuario encontrado: ${usuario ? usuario.nombre : 'No registrado'}`);

    // 🎭 PRIORIDAD 1: Detectar Easter Eggs y respuestas especiales
    const easterEgg = detectarEasterEggs(mensajeUsuario);
    if (easterEgg) {
      console.log(`[LOG] Easter Egg detectado: ${easterEgg.tipo}`);
      await responderWhatsApp(telefono, easterEgg.respuesta);
      return res.status(200).send();
    }

    // 🎯 PRIORIDAD 2: Detectar respuestas contextuales (confusión, agradecimiento)
    const respuestaContextual = generarRespuestaContextual(mensajeUsuario, usuario);
    if (respuestaContextual) {
      console.log(`[LOG] Respuesta contextual detectada: ${respuestaContextual.tipo}`);
      await responderWhatsApp(telefono, respuestaContextual.mensaje);
      return res.status(200).send();
    }

    // ⚡ PRIORIDAD 2.5: Respuestas rápidas para preguntas frecuentes
    const respuestaRapida = generarRespuestaRapida(mensajeUsuario, usuario);
    if (respuestaRapida) {
      console.log('[LOG] Respuesta rápida detectada');
      await responderWhatsApp(telefono, respuestaRapida);
      return res.status(200).send();
    }

    // 🧠 PRIORIDAD 3: Detección avanzada de intenciones
    const intencionAvanzada = detectarIntencionAvanzada(mensajeUsuario);
    if (intencionAvanzada && intencionAvanzada.confianza > 0.3) {
      console.log(`[LOG] Intención avanzada detectada: ${intencionAvanzada.intencion} (confianza: ${intencionAvanzada.confianza})`);
      
      // Registrar intención exitosa para análisis
      registrarInteraccion('intencion_exitosa', { intencion: intencionAvanzada.intencion });
      
      // Buscar usuario si no lo tenemos
      if (!usuario) {
        usuario = await obtenerUsuarioConCache(telefono);
      }
      
      switch (intencionAvanzada.intencion) {
        case 'tokens':
          if (usuario) {
            const tokens = usuario.tokensAcumulados ?? 0;
            if (tokens > 0) {
              await responderWhatsApp(telefono, `🪙 ¡Hola ${usuario.nombre}! Tienes ${tokens} tokens acumulados. ¡Excelente trabajo reciclando! 🌱`);
            } else {
              await responderWhatsApp(telefono, `🪙 ¡Hola ${usuario.nombre}! Aún no tienes tokens acumulados. ¡Llevá tus residuos al ecopunto más cercano para empezar a ganar! 🌱`);
            }
          } else {
            await responderWhatsApp(telefono, '❌ Vecino no encontrado. Debes registrarte primero para ver tus tokens.');
            await enviarMenuPrincipal(telefono);
          }
          return res.status(200).send();
          
        case 'catalogo':
          if (usuario) {
            await responderWhatsApp(
              telefono,
              `🎁 **¡Hola ${usuario.nombre}! Aquí tienes el catálogo de premios:**\n\n` +
              `🛍️ **Comercios locales:**\n` +
              `• 10 tokens: 20% descuento en panadería\n` +
              `• 15 tokens: 15% descuento en verdulería\n` +
              `• 20 tokens: 25% descuento en librería\n` +
              `• 30 tokens: 30% descuento en farmacia\n\n` +
              `🎫 **Beneficios especiales:**\n` +
              `• 25 tokens: Entrada gratis al cine\n` +
              `• 40 tokens: Clase de yoga gratuita\n` +
              `• 50 tokens: Masaje relajante\n` +
              `• 100 tokens: Día completo en spa\n\n` +
              `🌟 **Descuentos exclusivos:**\n` +
              `• 35 tokens: 50% descuento en transporte público\n` +
              `• 45 tokens: 40% descuento en gimnasio\n` +
              `• 60 tokens: 60% descuento en restaurante\n\n` +
              `💡 Para canjear, acércate al ecopunto más cercano con tu código de usuario.`
            );
          } else {
            await responderWhatsApp(telefono, '❌ Vecino no encontrado. Debes registrarte primero para ver los cupones.');
            await enviarMenuPrincipal(telefono);
          }
          return res.status(200).send();
          
        case 'ecopuntos':
          await responderWhatsApp(
            telefono,
            `🗺️ **¡Encontrá tu ecopunto más cercano!** 🗺️\n\n` +
            `🏪 **EcoPunto Central**\n` +
            `📍 Av. Corrientes 1234, CABA\n` +
            `🕐 Lun-Sáb 9:00-18:00\n` +
            `📱 +54 11 1234-5678\n\n` +
            `🏪 **EcoPunto Norte**\n` +
            `📍 Av. Santa Fe 5678, CABA\n` +
            `🕐 Mar-Dom 10:00-19:00\n` +
            `📱 +54 11 8765-4321\n\n` +
            `🏪 **EcoPunto Sur**\n` +
            `📍 Av. 9 de Julio 9012, CABA\n` +
            `🕐 Lun-Vie 8:00-17:00\n` +
            `📱 +54 11 2109-8765\n\n` +
            `🌐 Más ubicaciones: ekokai.com/ecopuntos`
          );
          return res.status(200).send();
          
        case 'registro':
          if (usuario) {
            await responderWhatsApp(telefono, `✅ ¡Hola ${usuario.nombre}! Ya estás registrado en EKOKAI. ¿En qué puedo ayudarte hoy? 🌱`);
            await enviarMenuPrincipal(telefono, usuario.nombre);
          } else {
            registroTemporal[telefono] = { paso: 'nombre', datos: {} };
            await responderWhatsApp(telefono, '✍️ ¡Perfecto! Vamos a registrarte. Por favor envíame tu nombre:');
          }
          return res.status(200).send();
          
        case 'ayuda':
          await responderWhatsApp(
            telefono,
            `🎯 **¿Cómo funciona EKOKAI?** 🌱\n\n` +
            `♻️ **El proceso es simple:**\n` +
            `1️⃣ Recolecta residuos reciclables (plástico, vidrio, papel, latas)\n` +
            `2️⃣ Llévalos limpios y secos al ecopunto más cercano\n` +
            `3️⃣ Un encargado los pesará en balanza digital\n` +
            `4️⃣ Recibes tokens automáticamente en tu cuenta\n` +
            `5️⃣ Canjea tokens por cupones y beneficios\n\n` +
            `🪙 **Sistema de tokens:**\n` +
            `• 1 kg de plástico = 5 tokens\n` +
            `• 1 kg de vidrio = 3 tokens\n` +
            `• 1 kg de papel = 2 tokens\n` +
            `• 1 kg de latas = 4 tokens\n\n` +
            `🎁 **Beneficios:**\n` +
            `• Descuentos en comercios locales\n` +
            `• Entradas gratuitas a eventos\n` +
            `• Servicios especiales\n` +
            `• Contribuyes al medioambiente\n\n` +
            `🌍 **Impacto ambiental:**\n` +
            `Cada kilo reciclado evita la emisión de CO2 y reduce la contaminación. ¡Tú haces la diferencia! ♻️✨`
          );
          return res.status(200).send();
          
        case 'motivacion':
          const respuestasMotivacion = [
            '💪 ¡Cada botella cuenta! Sigue así y ganarás más tokens que nadie ♻️',
            '🌟 ¡Tú puedes! Cada pequeño esfuerzo suma para un planeta mejor 🌱',
            '🔥 ¡Eres un héroe del reciclaje! No te rindas, el planeta te necesita 💚',
            '⚡ ¡Cada acción importa! Juntos somos más fuertes que cualquier obstáculo 🌍',
            '🎯 ¡Mira tus tokens! Cada uno representa un paso hacia un futuro mejor ♻️'
          ];
          await responderWhatsApp(telefono, respuestasMotivacion[Math.floor(Math.random() * respuestasMotivacion.length)]);
          return res.status(200).send();
      }
    }

    // 🎯 FALLBACK INTELIGENTE - Si no se detectó nada específico
    console.log('[LOG] No se detectó intención específica. Activando fallback inteligente...');
    
    // Verificar si es un saludo aunque Dialogflow no lo haya detectado
    console.log(`[LOG] Verificando si es saludo: "${mensajeLower}"`);
    const esUnSaludo = esSaludo(mensajeLower);
    console.log(`[LOG] Resultado verificación saludo: ${esUnSaludo}`);
    
    if (esUnSaludo) {
      console.log('[LOG] Mensaje identificado como saludo. Se envía menú principal.');
      // Buscar usuario para personalizar el saludo
      usuario = await obtenerUsuarioConCache(telefono);
      const nombreUsuario = usuario ? usuario.nombre : null;
      await enviarMenuPrincipal(telefono, nombreUsuario);
      return res.status(200).send();
    }
    
    // 🧠 FALLBACK AVANZADO - Generar sugerencias inteligentes
    console.log('[LOG] Generando sugerencias inteligentes para mensaje no reconocido');
    const sugerencias = generarSugerenciasInteligentes(mensajeUsuario, usuario);
    const mensajeFallback = `🤔 No estoy seguro de lo que necesitas, pero puedo ayudarte con:\n\n${sugerencias.join('\n')}\n\n💡 O simplemente escribí lo que necesitas y te ayudo 🌱`;
    
    // Registrar interacción para análisis
    registrarInteraccion('mensaje_no_reconocido', { mensaje: mensajeUsuario });
    
    await responderWhatsApp(telefono, mensajeFallback);
    return res.status(200).send();

    if (registroTemporal[telefono]) {
      console.log('[LOG] Usuario está en flujo de registro.');
      await manejarFlujoRegistro(telefono, mensajeUsuario);
      return res.status(200).send();
    }

    usuario = await obtenerUsuarioConCache(telefono);
    console.log(`[LOG] Resultado búsqueda usuario: ${usuario ? 'Usuario encontrado' : 'Usuario NO encontrado'}`);

    if (!usuario) {
      if (esOpcionRegistro(mensajeLower)) {
        console.log('[LOG] Iniciando flujo de registro para usuario NO registrado.');
        registroTemporal[telefono] = { paso: 'nombre', datos: {} };
        await responderWhatsApp(telefono, '✍️ ¡Perfecto! Vamos a registrarte. Por favor envíame tu nombre:');
        return res.status(200).send();
      }
      
      // Interpretar opción de menú con NLP
      const opcionInterpretada = interpretarOpcionMenu(mensajeLower);
      if (opcionInterpretada && ['1', '2', '3', '4', '5'].includes(opcionInterpretada)) {
        await manejarOpcionNoRegistrado(telefono, opcionInterpretada);
        return res.status(200).send();
      }
      
      console.log('[LOG] Usuario NO registrado envió mensaje no reconocido. Se muestra menú principal.');
      await enviarMenuPrincipal(telefono);
      return res.status(200).send();
    }

    // Para usuarios registrados, interpretar opción con NLP
    const opcionSeleccionada = interpretarOpcionMenu(mensajeLower);
    if (opcionSeleccionada && ['1', '2', '3', '4', '5'].includes(opcionSeleccionada)) {
      await manejarOpcionRegistrado(telefono, opcionSeleccionada, usuario);
      return res.status(200).send();
    }
    
    console.log('[LOG] Usuario registrado envió mensaje no reconocido. Se muestra menú principal.');
    await enviarMenuPrincipal(telefono, usuario.nombre);
    return res.status(200).send();

  } catch (error) {
    console.error('❌ [ERROR] en webhook WhatsApp:', error);
    await responderWhatsApp(req.body.From?.replace('whatsapp:', ''), 'Ocurrió un error. Intenta más tarde.');
    return res.status(500).send();
  }
};

async function enviarMensajeBienvenida(telefono, nombreUsuario) {
  console.log(`[LOG] Enviando mensaje de bienvenida a ${telefono} (${nombreUsuario})`);
  
  const mensajeBienvenida = `👋 ¡Bienvenido a EKOKAI!
Gracias por sumarte a la comunidad que premia el reciclaje. 🌱

📲 ¿En qué puedo ayudarte?

1️⃣ Conocer mis tokens  
2️⃣ Ver cupones para canjear  
3️⃣ Ubicación del ecopunto  
4️⃣ ¿Cómo funciona EKOKAI?

✍️ Escribí una opción o simplemente preguntame.`;
  
  await responderWhatsApp(telefono, mensajeBienvenida);
}

async function enviarMensajeReciclaje(telefono, datosReciclaje) {
  console.log(`[LOG] Enviando mensaje de reciclaje a ${telefono}`, datosReciclaje);
  
  const { tipoMaterial, peso, tokensGanados } = datosReciclaje;
  
  const mensajeReciclaje = `♻ ¡Gracias por reciclar con EKOKAI!

🧃 Entregaste: ${peso} kg de ${tipoMaterial}
🎯 Sumaste: ${tokensGanados} tokens EKOKAI 🌱

🎁 ¡Ya podés canjear cupones!  

¿Querés canjear ahora mismo? Escribí "cupones" o "premios" para ver las opciones disponibles.`;
  
  await responderWhatsApp(telefono, mensajeReciclaje);
}

async function enviarMensajeReciclajeAlternativo(telefono, datosReciclaje) {
  console.log(`[LOG] Enviando mensaje alternativo de reciclaje a ${telefono}`, datosReciclaje);
  
  const { peso, tokensGanados } = datosReciclaje;
  
  const mensajeReciclaje = `¡Tus residuos ahora valen! 🙌

Sumaste ${tokensGanados} tokens por reciclar hoy.  
🎁 ¡Ya podés usarlos para canjear descuentos y premios!

📲 Escribí "cupones" para ver premios | 🎊 Escribí "tokens" para ver tu balance`;
  
  await responderWhatsApp(telefono, mensajeReciclaje);
}

async function enviarMensajeReciclajeGratitud(telefono, datosReciclaje) {
  console.log(`[LOG] Enviando mensaje de gratitud a ${telefono}`, datosReciclaje);
  
  const { peso, tokensGanados } = datosReciclaje;
  
  const mensajeReciclaje = `🌿 EKOKAI te agradece 🙏

Entregaste ${peso} kg y ganaste ${tokensGanados} tokens  
🎁 ¡Cada token vale un cupón!  
¿Ya elegiste el tuyo?

🔎 Escribí "cupones" para ver opciones disponibles`;
  
  await responderWhatsApp(telefono, mensajeReciclaje);
}

async function registrarUsuarioDesdeEcopunto(datosUsuario) {
  console.log('[LOG] Registrando usuario desde ecopunto:', datosUsuario);
  
  try {
    const { nombre, apellido, dni, telefono, email } = datosUsuario;
    
    console.log('[LOG] Datos extraídos:', { nombre, apellido, dni, telefono, email });
    
    // Validar datos requeridos
    if (!nombre || !apellido || !dni || !telefono) {
      console.log('[LOG] Validación fallida:', { 
        nombre: !!nombre, 
        apellido: !!apellido, 
        dni: !!dni, 
        telefono: !!telefono 
      });
      throw new Error('Faltan datos requeridos para el registro');
    }
    
    console.log('[LOG] Validación de datos requeridos: ✅');
    
    // Formatear teléfono
    console.log('[LOG] Formateando teléfono:', telefono);
    const telefonoFormateado = validarYFormatearTelefono(telefono);
    console.log('[LOG] Teléfono formateado:', telefonoFormateado);
    
    if (!telefonoFormateado) {
      throw new Error('Número de teléfono inválido');
    }
    
    // Crear usuario en la base de datos
    const nuevoUsuario = {
      nombre: nombre,
      apellido: apellido,
      dni: dni,
      telefono: telefonoFormateado,
      email: email || null,
      tokens: 0,
      fechaRegistro: new Date(),
      activo: true
    };
    
    console.log('[LOG] Objeto usuario a crear:', nuevoUsuario);
    
    // Guardar en base de datos (usar el servicio existente)
    console.log('[LOG] Importando UsuarioService...');
    const UsuarioService = require('../services/usuario.service');
    console.log('[LOG] UsuarioService importado:', typeof UsuarioService.crearUsuario);
    
    console.log('[LOG] Llamando a UsuarioService.crearUsuario...');
    const usuarioGuardado = await UsuarioService.crearUsuario(nuevoUsuario);
    console.log('[LOG] Usuario guardado:', usuarioGuardado);
    
    // Enviar mensaje de bienvenida
    console.log('[LOG] Enviando mensaje de bienvenida...');
    await enviarMensajeBienvenida(telefonoFormateado, nombre);
    
    console.log(`[LOG] Usuario registrado exitosamente: ${telefonoFormateado}`);
    return usuarioGuardado;
    
  } catch (error) {
    console.error('[ERROR] Error registrando usuario desde ecopunto:', error);
    console.error('[ERROR] Stack trace:', error.stack);
    throw error;
  }
}

async function procesarReciclaje(datosReciclaje) {
  console.log('[LOG] Procesando reciclaje:', datosReciclaje);
  
  try {
    const { telefono, tipoMaterial, peso } = datosReciclaje;
    
    // Validar datos
    if (!telefono || !tipoMaterial || !peso) {
      throw new Error('Faltan datos requeridos para procesar reciclaje');
    }
    
    // Formatear teléfono
    const telefonoFormateado = validarYFormatearTelefono(telefono);
    
    // Calcular tokens (1 token por kg)
    const tokensGanados = Math.floor(peso);
    
    // Buscar usuario
    const usuario = await obtenerUsuarioConCache(telefonoFormateado);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar tokens del usuario
    const UsuarioService = require('../services/usuario.service');
    await UsuarioService.actualizarTokens(usuario._id, tokensGanados);
    
    // Limpiar cache del usuario
    delete cacheUsuarios[telefonoFormateado];
    
    // Enviar mensaje de reciclaje (versión aleatoria)
    const mensajesReciclaje = [
      () => enviarMensajeReciclaje(telefonoFormateado, { tipoMaterial, peso, tokensGanados }),
      () => enviarMensajeReciclajeAlternativo(telefonoFormateado, { peso, tokensGanados }),
      () => enviarMensajeReciclajeGratitud(telefonoFormateado, { peso, tokensGanados })
    ];
    
    const mensajeAleatorio = mensajesReciclaje[Math.floor(Math.random() * mensajesReciclaje.length)];
    await mensajeAleatorio();
    
    console.log(`[LOG] Reciclaje procesado exitosamente: ${tokensGanados} tokens para ${telefonoFormateado}`);
    return { tokensGanados, usuario: usuario.nombre };
    
  } catch (error) {
    console.error('[ERROR] Error procesando reciclaje:', error);
    throw error;
  }
}

module.exports = { 
  dialogflowWebhook,
  enviarMensajeBienvenida,
  enviarMensajeReciclaje,
  enviarMensajeReciclajeAlternativo,
  enviarMensajeReciclajeGratitud,
  registrarUsuarioDesdeEcopunto,
  procesarReciclaje
};
