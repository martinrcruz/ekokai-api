const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
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

// 🔧 Configuración mejorada de Dialogflow
console.log('[LOG] Inicializando Dialogflow...');
console.log('[LOG] Project ID:', projectId);
console.log('[LOG] Client Email:', process.env.GC_CLIENT_EMAIL);

// Verificar que tenemos las credenciales necesarias
if (!process.env.GC_PRIVATE_KEY || !process.env.GC_CLIENT_EMAIL || !projectId) {
  console.error('[ERROR] Faltan credenciales de Google Cloud:');
  console.error('  - GC_PRIVATE_KEY:', process.env.GC_PRIVATE_KEY ? 'Configurado' : 'FALTA');
  console.error('  - GC_CLIENT_EMAIL:', process.env.GC_CLIENT_EMAIL ? 'Configurado' : 'FALTA');
  console.error('  - GC_PROJECT_ID:', projectId ? 'Configurado' : 'FALTA');
}

// Formatear la clave privada correctamente
let privateKey = process.env.GC_PRIVATE_KEY;
if (privateKey) {
  // Reemplazar \n literales con saltos de línea reales
  privateKey = privateKey.replace(/\\n/g, '\n');
  console.log('[LOG] Private key length:', privateKey.length);
  console.log('[LOG] Private key starts with:', privateKey.substring(0, 50) + '...');
} else {
  console.error('[ERROR] GC_PRIVATE_KEY no está configurada');
}

let sessionClient;
try {
  sessionClient = new dialogflow.SessionsClient({
    credentials: {
      private_key: privateKey,
      client_email: process.env.GC_CLIENT_EMAIL
    },
    projectId: projectId
  });
  console.log('[LOG] Dialogflow SessionsClient creado exitosamente');
} catch (error) {
  console.error('[ERROR] Error al crear SessionsClient:', error);
}

const dialogflowWebhook = async (req, res) => {
  console.log('🔔 Webhook alcanzado en /webhook/whatsapp');

  // Verificar que el cliente de Dialogflow esté disponible
  if (!sessionClient) {
    console.error('[ERROR] SessionsClient no está disponible');
    await responderWhatsApp(
      req.body.From?.replace('whatsapp:', ''),
      'Error de configuración del servicio. Contacta al administrador.'
    );
    return res.sendStatus(500);
  }

  try {
    const telefono = req.body.From?.replace('whatsapp:', '');
    const mensajeUsuario = req.body.Body?.trim();

    console.log(`[LOG] Teléfono recibido:`, telefono);
    console.log(`[LOG] Mensaje recibido:`, mensajeUsuario);

    if (!telefono || !mensajeUsuario) {
      console.warn('⚠️ Teléfono o mensaje vacío', { telefono, mensajeUsuario });
      return res.sendStatus(400);
    }

    console.log(`📨 Mensaje recibido: "${mensajeUsuario}" de ${telefono}`);

    // ✅ Buscar usuario en base de datos
    console.log('[LOG] Buscando usuario en la base de datos...');
    const usuario = await usuarioRepo.buscarPorTelefono(telefono);
    if (!usuario) {
      console.warn('[LOG] Usuario no encontrado en la base de datos:', telefono);
      await responderWhatsApp(
        telefono,
        'No encontré tu cuenta. ¿Estás registrado en Ekokai?'
      );
      return res.sendStatus(200);
    }
    console.log('[LOG] Usuario encontrado:', usuario._id);

    // ✅ Enviar mensaje a Dialogflow
    const sessionId = uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: { text: mensajeUsuario, languageCode: 'es' },
      },
    };

    console.log('[LOG] Enviando mensaje a Dialogflow con request:', request);
    
    let responses;
    try {
      responses = await sessionClient.detectIntent(request);
    } catch (err) {
      console.error('[ERROR] Error al consultar Dialogflow:', err);
      console.error('[ERROR] Detalles del error:', {
        message: err.message,
        code: err.code,
        details: err.details
      });
      await responderWhatsApp(telefono, 'Ocurrió un error al procesar tu mensaje. Intenta más tarde.');
      return res.sendStatus(500);
    }
    const result = responses[0].queryResult;

    const intent = result.intent?.displayName || 'Sin intent';
    const fulfillmentText = result.fulfillmentText || '';

    console.log(`[LOG] Intent detectado: ${intent}`);
    console.log(`[LOG] Fulfillment: ${fulfillmentText}`);

    // ✅ Intent SALUDO → responder con menú
    if (intent === 'Saludo') {
      console.log('[LOG] Respondiendo a intent Saludo');
      await responderWhatsApp(
        telefono,
        `👋 ¡Hola! Soy el asistente de Ekokai. Por favor elige una opción:\n1️⃣ Consultar tokens\n2️⃣ Ver historial\n3️⃣ Ver catálogo`
      );
      return res.sendStatus(200);
    }

    // ✅ Intent OPCIONUNO o CONSULTARTOKENS
    if (intent === 'OpcionUno' || intent === 'ConsultarTokens') {
      const tokens = usuario.tokensAcumulados ?? 0;
      console.log(`[LOG] Consultando tokens para usuario ${usuario._id}: ${tokens}`);
      await responderWhatsApp(telefono, `Tienes ${tokens} tokens acumulados.`);
      return res.sendStatus(200);
    }

    // ✅ Intent OPCIONDOS o HISTORIA LENTREGAS
    if (intent === 'OpcionDos' || intent === 'HistorialEntregas') {
      console.log(`[LOG] Consultando historial de entregas para usuario ${usuario._id}`);
      let entregas;
      try {
        entregas = await entregaRepo.buscarPorUsuario(usuario._id);
      } catch (err) {
        console.error('[ERROR] Error al consultar entregas:', err);
        await responderWhatsApp(telefono, 'No se pudo consultar tu historial. Intenta más tarde.');
        return res.sendStatus(500);
      }

      if (!entregas || entregas.length === 0) {
        console.log('[LOG] El usuario no tiene entregas registradas');
        await responderWhatsApp(telefono, 'Aún no has registrado entregas.');
        return res.sendStatus(200);
      }

      const ultima = entregas[entregas.length - 1];
      const totalKg = entregas.reduce((sum, e) => sum + (e.pesoKg || 0), 0);
      const totalTokens = entregas.reduce((sum, e) => sum + (e.tokensOtorgados || 0), 0);

      const mensajeHistorial = `♻️ Has hecho ${entregas.length} entregas.\n📅 Última: ${new Date(ultima.fecha).toLocaleString('es-CL')} - ${ultima.pesoKg ?? '?'} kg\n📦 Total reciclado: ${totalKg} kg\n🪙 Tokens obtenidos: ${totalTokens}`;
      console.log('[LOG] Enviando historial:', mensajeHistorial);
      await responderWhatsApp(telefono, mensajeHistorial);
      return res.sendStatus(200);
    }

    // ✅ Intent OPCIONTRES o CATALOGO PREMIOS
    if (intent === 'OpcionTres' || intent === 'CatalogoPremios') {
      console.log('[LOG] Mostrando catálogo de premios');
      await responderWhatsApp(
        telefono,
        `🎁 Catálogo de premios:\n- 10 tokens: Bolsa ecológica\n- 20 tokens: Entrada a cine\n- 30 tokens: Pack sorpresa`
      );
      return res.sendStatus(200);
    }

    // ✅ Intent Fallback → respuesta por defecto
    console.log('[LOG] Intent no reconocido, enviando fallback');
    await responderWhatsApp(
      telefono,
      `❌ Lo siento, no entendí. Por favor elige:\n1️⃣ Consultar tokens\n2️⃣ Ver historial\n3️⃣ Ver catálogo`
    );
    return res.sendStatus(200);

  } catch (error) {
    console.error('❌ Error en webhook WhatsApp:', error.message, error);
    await responderWhatsApp(
      req.body.From?.replace('whatsapp:', ''),
      'Ocurrió un error. Intenta más tarde.'
    );
    return res.sendStatus(500);
  }
};

module.exports = { dialogflowWebhook };
