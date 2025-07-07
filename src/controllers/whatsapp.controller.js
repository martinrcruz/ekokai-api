const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const usuarioRepo = require('../repositories/usuario.repository');
const entregaRepo = require('../repositories/entregaresiduio.repository');
const { responderWhatsApp } = require('../utils/twilio.helper'); // <-- Agrega esto

// Carga del archivo de credenciales
const keyPath = path.join(__dirname, '../../keys/service-account.json');
const projectId = JSON.parse(fs.readFileSync(keyPath)).project_id;

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: keyPath
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
  
      const usuario = await usuarioRepo.buscarPorTelefono(telefono);
      if (!usuario) {
        await responderWhatsApp(telefono, 'No encontré tu cuenta. ¿Estás registrado en Ekokai?');
        return res.sendStatus(200);
      }
  
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
  
      if (intent === 'ConsultarTokens') {
        const tokens = usuario.tokensAcumulados ?? 0;
        await responderWhatsApp(telefono, `Tienes ${tokens} tokens acumulados.`);
        return res.sendStatus(200);
      }
  
      if (intent === 'HistorialEntregas') {
        const entregas = await entregaRepo.buscarPorUsuario(usuario._id);
      
        if (!entregas || entregas.length === 0) {
          await responderWhatsApp(telefono, 'Aún no has registrado entregas.');
          return res.sendStatus(200);
        }
      
        console.log(entregas);
      
        const ultima = entregas[entregas.length - 1];
      
        // Accede correctamente a pesoKg y tokensOtorgados
        const totalKg = entregas.reduce((sum, e) => sum + (e.pesoKg || 0), 0);
        const totalTokens = entregas.reduce((sum, e) => sum + (e.tokensOtorgados || 0), 0);
      
        const mensaje = `♻️ Has hecho ${entregas.length} entregas.
      📅 Última: ${new Date(ultima.fecha).toLocaleString('es-CL')} - ${ultima.pesoKg ?? '?'} kg
      📦 Total reciclado: ${totalKg} kg
      🪙 Tokens obtenidos: ${totalTokens}`;
      
        await responderWhatsApp(telefono, mensaje);
        return res.sendStatus(200);
      }
      
  
      // Respuesta por defecto
      await responderWhatsApp(telefono, fulfillmentText || 'No entendí tu solicitud. ¿Puedes repetirla?');
      return res.sendStatus(200);
  
    } catch (error) {
      console.error('❌ Error en webhook WhatsApp:', error.message);
      await responderWhatsApp(req.body.From?.replace('whatsapp:', ''), 'Ocurrió un error. Intenta más tarde.');
      return res.sendStatus(500);
    }
  };
  

module.exports = { dialogflowWebhook };