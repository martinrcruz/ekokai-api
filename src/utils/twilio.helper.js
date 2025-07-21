const twilio = require('twilio');

console.log('[LOG] Configurando Twilio con SID:', process.env.TWILIO_ACCOUNT_SID ? 'Configurado' : 'NO CONFIGURADO');
console.log('[LOG] Auth Token configurado:', process.env.TWILIO_AUTH_TOKEN ? 'Sí' : 'NO');
console.log('[LOG] WhatsApp number:', process.env.TWILIO_WHATSAPP_NUMBER);

// Mostrar las credenciales reales que se están usando
console.log('[LOG] TWILIO_ACCOUNT_SID real:', process.env.TWILIO_ACCOUNT_SID);
console.log('[LOG] TWILIO_AUTH_TOKEN real:', process.env.TWILIO_AUTH_TOKEN ? 'Configurado' : 'NO CONFIGURADO');

// Verificar si las credenciales son LIVE o TEST
if (process.env.TWILIO_ACCOUNT_SID) {
  if (process.env.TWILIO_ACCOUNT_SID.includes('AC1be585d06467e3e11576154ba13889d7')) {
    console.log('[LOG] ✅ Usando credenciales LIVE de Twilio');
  } else if (process.env.TWILIO_ACCOUNT_SID.includes('AC7597b6c2ab32bc7f38ce0eb2768e4b58')) {
    console.log('[LOG] ⚠️ Usando credenciales TEST de Twilio');
  } else {
    console.log('[LOG] ❓ Credenciales desconocidas de Twilio');
  }
}

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
