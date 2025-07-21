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

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    private_key: serviceAccount.private_key,
    client_email: serviceAccount.client_email
  },
  projectId: serviceAccount.project_id
});

const dialogflowWebhook = async (req, res) => {
  console.log('🔔 Webhook alcanzado en /webhook/whatsapp');

  try {
    const telefono = req.body.From?.replace('whatsapp:', '');
    const mensajeUsuario = req.body.Body?.trim();

    if (!telefono || !mensajeUsuario) {
      console.warn('⚠️ Teléfono o mensaje vacío');
      return res.sendStatus(400);
    }

    console.log(`📨 Mensaje recibido: "${mensajeUsuario}" de ${telefono}`);

    // ✅ Buscar usuario en base de datos
    const usuario = await usuarioRepo.buscarPorTelefono(telefono);
    if (!usuario) {
      await responderWhatsApp(
        telefono,
        'No encontré tu cuenta. ¿Estás registrado en Ekokai?'
      );
      return res.sendStatus(200);
    }

    // ✅ Enviar mensaje a Dialogflow
    const sessionId = uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: { text: mensajeUsuario, languageCode: 'es' },
      },
    };

    console.log('🧠 Enviando mensaje a Dialogflow...');
    
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    const intent = result.intent?.displayName || 'Sin intent';
    const fulfillmentText = result.fulfillmentText || '';

    console.log(`🎯 Intent detectado: ${intent}`);
    console.log(`🗣️ Fulfillment: ${fulfillmentText}`);

    // ✅ Intent SALUDO → responder con menú
    if (intent === 'Saludo') {
      await responderWhatsApp(
        telefono,
        `👋 ¡Hola! Soy el asistente de Ekokai. Por favor elige una opción:\n1️⃣ Consultar tokens\n2️⃣ Ver historial\n3️⃣ Ver catálogo`
      );
      return res.sendStatus(200);
    }

    // ✅ Intent OPCIONUNO o CONSULTARTOKENS
    if (intent === 'OpcionUno' || intent === 'ConsultarTokens') {
      const tokens = usuario.tokensAcumulados ?? 0;
      await responderWhatsApp(telefono, `Tienes ${tokens} tokens acumulados.`);
      return res.sendStatus(200);
    }

    // ✅ Intent OPCIONDOS o HISTORIA LENTREGAS
    if (intent === 'OpcionDos' || intent === 'HistorialEntregas') {
      const entregas = await entregaRepo.buscarPorUsuario(usuario._id);

      if (!entregas || entregas.length === 0) {
        await responderWhatsApp(telefono, 'Aún no has registrado entregas.');
        return res.sendStatus(200);
      }

      const ultima = entregas[entregas.length - 1];

      const totalKg = entregas.reduce((sum, e) => sum + (e.pesoKg || 0), 0);
      const totalTokens = entregas.reduce((sum, e) => sum + (e.tokensOtorgados || 0), 0);

      const mensajeHistorial = `♻️ Has hecho ${entregas.length} entregas.\n📅 Última: ${new Date(ultima.fecha).toLocaleString('es-CL')} - ${ultima.pesoKg ?? '?'} kg\n📦 Total reciclado: ${totalKg} kg\n🪙 Tokens obtenidos: ${totalTokens}`;
      await responderWhatsApp(telefono, mensajeHistorial);
      return res.sendStatus(200);
    }

    // ✅ Intent OPCIONTRES o CATALOGO PREMIOS
    if (intent === 'OpcionTres' || intent === 'CatalogoPremios') {
      await responderWhatsApp(
        telefono,
        `🎁 Catálogo de premios:\n- 10 tokens: Bolsa ecológica\n- 20 tokens: Entrada a cine\n- 30 tokens: Pack sorpresa`
      );
      return res.sendStatus(200);
    }

    // ✅ Intent Fallback → respuesta por defecto
    await responderWhatsApp(
      telefono,
      `❌ Lo siento, no entendí. Por favor elige:\n1️⃣ Consultar tokens\n2️⃣ Ver historial\n3️⃣ Ver catálogo`
    );
    return res.sendStatus(200);

  } catch (error) {
    console.error('❌ Error en webhook WhatsApp:', error.message);
    await responderWhatsApp(
      req.body.From?.replace('whatsapp:', ''),
      'Ocurrió un error. Intenta más tarde.'
    );
    return res.sendStatus(500);
  }
};

module.exports = { dialogflowWebhook };
