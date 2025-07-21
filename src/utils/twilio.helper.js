const twilio = require('twilio');

console.log('[LOG] Configurando Twilio con SID:', process.env.TWILIO_ACCOUNT_SID ? 'Configurado' : 'NO CONFIGURADO');
console.log('[LOG] Auth Token configurado:', process.env.TWILIO_AUTH_TOKEN ? 'Sí' : 'NO');
console.log('[LOG] WhatsApp number:', process.env.TWILIO_WHATSAPP_NUMBER);

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function responderWhatsApp(to, mensaje) {
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  const toFormatted = `whatsapp:${to}`;

  console.log('📤 Enviando mensaje con Twilio...');
  console.log('🔢 From:', from);
  console.log('🔢 To:', toFormatted);
  console.log('💬 Mensaje:', mensaje);

  try {
    const message = await client.messages.create({
      body: mensaje,
      from,
      to: toFormatted,
    });

    console.log('✅ Mensaje enviado. SID:', message.sid);
  } catch (error) {
    console.error('❌ Error al enviar mensaje por WhatsApp:', error.message);
    console.error('🔍 Error completo:', error);
    if (error?.code) console.error('🔍 Twilio Error Code:', error.code);
    if (error?.moreInfo) console.error('ℹ️ Más información:', error.moreInfo);
    
    // Log adicional para errores de autenticación
    if (error.code === 20003) {
      console.error('🔐 Error de autenticación de Twilio. Verifica:');
      console.error('   - TWILIO_ACCOUNT_SID');
      console.error('   - TWILIO_AUTH_TOKEN');
    }
  }
}

module.exports = { responderWhatsApp };
