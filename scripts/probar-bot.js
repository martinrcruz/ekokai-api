const axios = require('axios');

// Configuración
const WEBHOOK_URL = 'http://localhost:8080/webhook/whatsapp';
const TEST_PHONE = '+56944596955';

// Frases de prueba que antes no funcionaban
const frasesPrueba = [
  'hols',           // Antes: Default Fallback Intent
  'ke premios hay', // Antes: No reconocía
  'kantos tokens tengo', // Antes: No reconocía
  'donde hay ecopuntos', // Antes: No reconocía
  'komo funciona',  // Antes: No reconocía
  'decime mis tokens', // Antes: No reconocía
  'ke es ekokai',   // Antes: No reconocía
  'hola',           // Debería funcionar
  'mis tokens',     // Debería funcionar
  'premios',        // Debería funcionar
  'ecopuntos',      // Debería funcionar
  'ayuda'           // Debería funcionar
];

// Función para simular un mensaje de WhatsApp
async function simularMensaje(mensaje) {
  const payload = {
    SmsMessageSid: `SM${Date.now()}`,
    NumMedia: '0',
    ProfileName: 'TestUser',
    MessageType: 'text',
    SmsSid: `SM${Date.now()}`,
    WaId: TEST_PHONE,
    SmsStatus: 'received',
    Body: mensaje,
    To: 'whatsapp:+17017604112',
    MessagingServiceSid: 'MG4597d5a5bc2ec678d426decff86cf59b',
    NumSegments: '1',
    ReferralNumMedia: '0',
    MessageSid: `SM${Date.now()}`,
    AccountSid: 'AC1be585d06467e3e11576154ba13889d7',
    ChannelMetadata: JSON.stringify({
      type: 'whatsapp',
      data: {
        context: {
          ProfileName: 'TestUser',
          WaId: TEST_PHONE
        }
      }
    }),
    From: `whatsapp:${TEST_PHONE}`,
    ApiVersion: '2010-04-01'
  };

  try {
    console.log(`\n🧪 Probando: "${mensaje}"`);
    console.log('─'.repeat(50));
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'TestBot/1.0'
      }
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📤 Respuesta enviada correctamente`);
    
    // Pequeña pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

// Función principal
async function probarBot() {
  console.log('🤖 PROBANDO BOT EKOKAI');
  console.log('='.repeat(50));
  console.log(`📱 Webhook: ${WEBHOOK_URL}`);
  console.log(`📞 Teléfono: ${TEST_PHONE}`);
  console.log(`🎯 Frases a probar: ${frasesPrueba.length}`);
  console.log('');

  for (const frase of frasesPrueba) {
    await simularMensaje(frase);
  }

  console.log('\n🎉 Pruebas completadas!');
  console.log('📊 Revisa los logs del servidor para ver las respuestas del bot');
}

// Ejecutar pruebas
probarBot().catch(console.error); 