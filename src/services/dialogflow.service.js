const { detectIntentFromMessage } = require('../services/dialogflow.service');

async function webhookWhatsApp(req, res) {
  const { mensaje, telefono } = req.body; // ajusta según lo que envías desde WhatsApp

  try {
    const respuestaBot = await detectIntentFromMessage(mensaje, telefono);
    
    // Aquí puedes devolver respuesta al frontend o a Twilio/360Dialog/etc.
    console.log('🤖 Respuesta generada:', respuestaBot);

    res.status(200).json({
      success: true,
      respuesta: respuestaBot,
    });

  } catch (error) {
    console.error('🚨 Error en webhook WhatsApp:', error.message);

    res.status(500).json({
      success: false,
      mensaje: 'Error procesando mensaje. Intente más tarde.',
    });
  }
}
module.exports = { webhookWhatsApp };

