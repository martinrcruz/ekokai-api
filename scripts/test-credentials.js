const dialogflow = require('@google-cloud/dialogflow');
const twilio = require('twilio');

console.log('🔍 Probando credenciales...\n');

// Probar credenciales de Google Cloud
console.log('=== GOOGLE CLOUD CREDENCIALES ===');
console.log('GC_PROJECT_ID:', process.env.GC_PROJECT_ID ? '✅ Configurado' : '❌ FALTA');
console.log('GC_CLIENT_EMAIL:', process.env.GC_CLIENT_EMAIL ? '✅ Configurado' : '❌ FALTA');
console.log('GC_PRIVATE_KEY:', process.env.GC_PRIVATE_KEY ? '✅ Configurado' : '❌ FALTA');

if (process.env.GC_PRIVATE_KEY) {
  const privateKey = process.env.GC_PRIVATE_KEY.replace(/\\n/g, '\n');
  console.log('Private key length:', privateKey.length);
  console.log('Private key starts with:', privateKey.substring(0, 50) + '...');
  console.log('Private key ends with:', '...' + privateKey.substring(privateKey.length - 50));
  
  // Verificar formato de la clave
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('❌ ADVERTENCIA: La clave privada no parece tener el formato correcto');
  } else {
    console.log('✅ Formato de clave privada parece correcto');
  }
}

// Probar credenciales de Twilio
console.log('\n=== TWILIO CREDENCIALES ===');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Configurado' : '❌ FALTA');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Configurado' : '❌ FALTA');
console.log('TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER ? '✅ Configurado' : '❌ FALTA');

// Probar cliente de Dialogflow
console.log('\n=== PROBANDO DIALOGFLOW ===');
try {
  const sessionClient = new dialogflow.SessionsClient({
    credentials: {
      private_key: process.env.GC_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GC_CLIENT_EMAIL
    },
    projectId: process.env.GC_PROJECT_ID
  });
  console.log('✅ SessionsClient creado exitosamente');
} catch (error) {
  console.error('❌ Error al crear SessionsClient:', error.message);
}

// Probar cliente de Twilio
console.log('\n=== PROBANDO TWILIO ===');
try {
  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio client creado exitosamente');
} catch (error) {
  console.error('❌ Error al crear Twilio client:', error.message);
}

console.log('\n=== FIN DE PRUEBAS ==='); 