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

// 🧠 Funciones de procesamiento de lenguaje natural
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, ' ') // Solo letras, números y espacios
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .trim();
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
  
  // Si ya tiene el código de país +54, solo validar longitud
  if (numero.startsWith('+54')) {
    const numeroSinCodigo = soloNumeros.substring(2);
    if (numeroSinCodigo.length >= 8 && numeroSinCodigo.length <= 10) {
      return `+54${numeroSinCodigo}`;
    }
  }
  
  // Si no tiene código de país, asumir que es argentino
  if (soloNumeros.length >= 8 && soloNumeros.length <= 10) {
    return `+54${soloNumeros}`;
  }
  
  // Si tiene 11 dígitos y empieza con 54, formatear
  if (soloNumeros.length === 11 && soloNumeros.startsWith('54')) {
    return `+${soloNumeros}`;
  }
  
  // Si tiene 13 dígitos y empieza con 549, formatear
  if (soloNumeros.length === 13 && soloNumeros.startsWith('549')) {
    return `+${soloNumeros}`;
  }
  
  return null; // Número inválido
}

// 📌 Función para enviar menú principal
async function enviarMenuPrincipal(telefono) {
  console.log(`[LOG] Enviando menú principal a ${telefono}`);
  const mensaje = `👋 ¡Hola! Soy el asistente de Ekokai. Elige una opción:\n\n1️⃣ Consultar tokens\n2️⃣ Ver historial  \n3️⃣ Ver catálogo\n4️⃣ 🗺️ Punto de reciclaje más cercano\n5️⃣ Registrarme\n6️⃣ 📋 Historial de canjes\n7️⃣ ♻️ ¿Cómo reciclar?\n\nResponde con el número de la opción que deseas.`;
  await responderWhatsApp(telefono, mensaje);
}

function esSaludo(mensaje) {
  const saludos = [
    'hola', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches', 
    'hi', 'hello', 'hey', 'buen día', 'buenas noches', 'saludos',
    // Variaciones con faltas ortográficas comunes
    'ola', 'ola k tal', 'ola que tal', 'buenas tardes', 'buenos dias',
    'buenas noches', 'buen dia', 'saludo', 'saludos cordiales'
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
    '2': ['2', 'dos', 'historial', 'ver historial', 'mis entregas', 'entregas', 'historial de entregas'],
    '3': ['3', 'tres', 'catalogo', 'catálogo', 'ver catalogo', 'ver catálogo', 'premios', 'ver premios'],
    '4': ['4', 'cuatro', 'punto', 'puntos', 'reciclaje', 'punto de reciclaje', 'ecopunto', 'ecopuntos', 'donde reciclar', 'donde puedo reciclar'],
    '5': ['5', 'cinco', 'registrarme', 'registro', 'registrarse', 'crear cuenta'],
    '6': ['6', 'seis', 'canjes', 'historial de canjes', 'ver canjes', 'mis canjes', 'premios canjeados', 'canje', 'canjeados'],
    '7': ['7', 'siete', 'como reciclar', 'cómo reciclar', 'como reciclar', 'ayuda', 'ayuda reciclaje', 'informacion', 'información', 'que reciclar', 'qué reciclar', 'que puedo reciclar', 'qué puedo reciclar', 'reciclaje', 'reciclar']
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
  await responderWhatsApp(
    telefono, 
    `❌ Vecino no encontrado. Debes registrarte primero para acceder a esta función.`
  );
  await enviarMenuPrincipal(telefono);
}

async function manejarFlujoRegistro(telefono, mensajeUsuario) {
  const estado = registroTemporal[telefono];
  console.log(`[LOG] Flujo de registro para ${telefono} | Paso actual: ${estado.paso} | Valor recibido: "${mensajeUsuario}"`);
  
  switch (estado.paso) {
    case 'nombre':
      estado.datos.nombre = mensajeUsuario;
      estado.paso = 'apellido';
      await responderWhatsApp(telefono, '✍️ Ahora envíame tu apellido:');
      break;
      
    case 'apellido':
      estado.datos.apellido = mensajeUsuario;
      estado.paso = 'dni';
      await responderWhatsApp(telefono, '🪪 Ahora envíame tu DNI:');
      break;
      
    case 'dni':
      estado.datos.dni = mensajeUsuario;
      estado.paso = 'email';
      await responderWhatsApp(telefono, '📧 Ahora envíame tu correo electrónico:');
      break;
      
    case 'email':
      estado.datos.email = mensajeUsuario;
      estado.paso = 'telefono';
      await responderWhatsApp(telefono, '📱 Finalmente envíame tu número de teléfono (ej: 1123456789 o +54 11 2345 6789):');
      break;
      
    case 'telefono':
      const telefonoFormateado = validarYFormatearTelefono(mensajeUsuario);
      
      if (!telefonoFormateado) {
        await responderWhatsApp(telefono, '❌ Número de teléfono inválido. Por favor envíame un número válido de Argentina (ej: 1123456789 o +54 11 2345 6789):');
        return;
      }
      
      estado.datos.telefono = telefonoFormateado;
      console.log(`[LOG] Teléfono formateado: "${mensajeUsuario}" -> "${telefonoFormateado}"`);
      
      try {
        const creado = await usuarioRepo.crearUsuario({
          ...estado.datos,
          rol: 'vecino',
          password: '12345678',
          requiereCambioPassword: true
        });
        delete registroTemporal[telefono];
        console.log(`[LOG] Usuario registrado exitosamente: ${JSON.stringify(creado)}`);
        await responderWhatsApp(
          telefono, 
          `✅ ¡Registro completo! Bienvenido, ${creado.nombre}.\n📱 Tu número registrado: ${telefonoFormateado}`
        );
        await enviarMenuPrincipal(telefono);
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
      await responderWhatsApp(telefono, `🪙 Tienes ${tokens} tokens acumulados.`);
      break;
    case '2':
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
      break;
    case '3':
      await responderWhatsApp(
        telefono,
        `🎁 Catálogo de premios:\n- 10 tokens: Bolsa ecológica\n- 20 tokens: Entrada a cine  \n- 30 tokens: Pack sorpresa\n- 50 tokens: Kit de jardinería\n- 100 tokens: Bicicleta ecológica`
      );
      break;
    case '4':
      await responderWhatsApp(
        telefono,
        `🗺️ Puntos de reciclaje más cercanos:\n\n📍 EcoPunto Central\n🏠 Av. Corrientes 1234, CABA\n⏰ Lunes a Sábado 9:00-18:00\n📞 +54 11 1234-5678\n\n📍 EcoPunto Norte\n🏠 Av. Santa Fe 5678, CABA\n⏰ Martes a Domingo 10:00-19:00\n📞 +54 11 8765-4321\n\n📍 EcoPunto Sur\n🏠 Av. 9 de Julio 9012, CABA\n⏰ Lunes a Viernes 8:00-17:00\n📞 +54 11 2109-8765\n\n🗺️ Para más ubicaciones visita: ekokai.com/ecopuntos`
      );
      break;
    case '6':
      // Simular historial de canjes (en un sistema real, esto vendría de la base de datos)
      const historialCanjes = [
        {
          fecha: '2024-01-15',
          premio: 'Bolsa ecológica',
          tokens: 10,
          estado: 'Entregado'
        },
        {
          fecha: '2024-02-20',
          premio: 'Entrada a cine',
          tokens: 20,
          estado: 'Pendiente'
        },
        {
          fecha: '2024-03-10',
          premio: 'Pack sorpresa',
          tokens: 30,
          estado: 'Entregado'
        }
      ];
      
      if (historialCanjes.length === 0) {
        await responderWhatsApp(telefono, '📋 Aún no has canjeado ningún premio.');
      } else {
        let mensaje = `📋 Historial de canjes:\n\n`;
        historialCanjes.forEach((canje, index) => {
          const fecha = new Date(canje.fecha).toLocaleDateString('es-CL');
          const estadoEmoji = canje.estado === 'Entregado' ? '✅' : '⏳';
          mensaje += `${estadoEmoji} ${fecha}: ${canje.premio}\n`;
          mensaje += `   🪙 ${canje.tokens} tokens | Estado: ${canje.estado}\n\n`;
        });
        mensaje += `📊 Total de canjes: ${historialCanjes.length}`;
        await responderWhatsApp(telefono, mensaje);
      }
      break;
    case '7':
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
      break;
    default:
      await enviarMenuPrincipal(telefono);
      break;
  }
}

const dialogflowWebhook = async (req, res) => {
  console.log('================ NUEVA PETICIÓN AL WEBHOOK DE WHATSAPP ================');
  console.log(`[LOG] Fecha/Hora: ${new Date().toLocaleString('es-CL')}`);
  console.log(`[LOG] IP Remota: ${req.ip}`);
  console.log(`[LOG] Headers: ${JSON.stringify(req.headers)}`);
  console.log(`[LOG] Body recibido: ${JSON.stringify(req.body)}`);

  if (!sessionClient) {
    console.error('[ERROR] SessionsClient no está disponible');
    await responderWhatsApp(req.body.From?.replace('whatsapp:', ''), 'Error interno. Intenta más tarde.');
    return res.status(500).send();
  }

  try {
    const telefono = req.body.From?.replace('whatsapp:', '');
    const mensajeUsuario = req.body.Body?.trim();
    const mensajeLower = mensajeUsuario ? mensajeUsuario.toLowerCase() : '';

    console.log(`[LOG] Teléfono extraído: ${telefono}`);
    console.log(`[LOG] Mensaje recibido: "${mensajeUsuario}"`);

    if (!telefono || !mensajeUsuario) {
      console.warn('[LOG] Teléfono o mensaje vacío. No se procesa la petición.');
      return res.status(400).send();
    }

    if (registroTemporal[telefono]) {
      console.log('[LOG] Usuario está en flujo de registro.');
      await manejarFlujoRegistro(telefono, mensajeUsuario);
      return res.status(200).send();
    }

    console.log(`[LOG] Verificando si es saludo: "${mensajeLower}"`);
    const esUnSaludo = esSaludo(mensajeLower);
    console.log(`[LOG] Resultado verificación saludo: ${esUnSaludo}`);
    
    if (esUnSaludo) {
      console.log('[LOG] Mensaje identificado como saludo. Se envía menú principal.');
      await enviarMenuPrincipal(telefono);
      return res.status(200).send();
    }

    const usuario = await usuarioRepo.buscarPorTelefono(telefono);
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
      if (opcionInterpretada && ['1', '2', '3', '4', '6', '7'].includes(opcionInterpretada)) {
        await manejarOpcionNoRegistrado(telefono, opcionInterpretada);
        return res.status(200).send();
      }
      
      console.log('[LOG] Usuario NO registrado envió mensaje no reconocido. Se muestra menú principal.');
      await enviarMenuPrincipal(telefono);
      return res.status(200).send();
    }

    // Para usuarios registrados, interpretar opción con NLP
    const opcionSeleccionada = interpretarOpcionMenu(mensajeLower);
    if (opcionSeleccionada && ['1', '2', '3', '4', '5', '6', '7'].includes(opcionSeleccionada)) {
      await manejarOpcionRegistrado(telefono, opcionSeleccionada, usuario);
      return res.status(200).send();
    }
    
    console.log('[LOG] Usuario registrado envió mensaje no reconocido. Se muestra menú principal.');
    await enviarMenuPrincipal(telefono);
    return res.status(200).send();

  } catch (error) {
    console.error('❌ [ERROR] en webhook WhatsApp:', error);
    await responderWhatsApp(req.body.From?.replace('whatsapp:', ''), 'Ocurrió un error. Intenta más tarde.');
    return res.status(500).send();
  }
};

module.exports = { dialogflowWebhook };
