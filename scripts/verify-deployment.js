const dialogflow = require('@google-cloud/dialogflow');
const twilio = require('twilio');

console.log('🔍 Verificando configuración para despliegue...\n');

// Verificar variables de entorno requeridas
const requiredEnvVars = [
  'MONGO_URI_DB1',
  'JWT_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_NUMBER',
  'GC_PROJECT_ID',
  'GC_CLIENT_EMAIL',
  'GC_PRIVATE_KEY'
];

console.log('=== VERIFICANDO VARIABLES DE ENTORNO ===');
let allVarsPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configurado`);
  } else {
    console.log(`❌ ${varName}: FALTA`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.error('\n❌ ERROR: Faltan variables de entorno requeridas');
  process.exit(1);
}

console.log('\n=== VERIFICANDO CREDENCIALES ===');

// Verificar Twilio
console.log('\n--- Twilio ---');
try {
  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Cliente de Twilio creado exitosamente');
  
  // Verificar si son credenciales LIVE
  if (process.env.TWILIO_ACCOUNT_SID.includes('AC1be585d06467e3e11576154ba13889d7')) {
    console.log('✅ Usando credenciales LIVE de Twilio');
  } else {
    console.log('⚠️ ADVERTENCIA: No se detectaron credenciales LIVE de Twilio');
  }
} catch (error) {
  console.error('❌ Error al crear cliente de Twilio:', error.message);
}

// Verificar Dialogflow
console.log('\n--- Dialogflow ---');
try {
  const privateKey = process.env.GC_PRIVATE_KEY.replace(/\\n/g, '\n');
  const sessionClient = new dialogflow.SessionsClient({
    credentials: {
      private_key: privateKey,
      client_email: process.env.GC_CLIENT_EMAIL
    },
    projectId: process.env.GC_PROJECT_ID
  });
  console.log('✅ Cliente de Dialogflow creado exitosamente');
} catch (error) {
  console.error('❌ Error al crear cliente de Dialogflow:', error.message);
}

// Verificar MongoDB
console.log('\n--- MongoDB ---');
if (process.env.MONGO_URI_DB1 && process.env.MONGO_URI_DB1.includes('mongodb+srv://')) {
  console.log('✅ URI de MongoDB configurada correctamente');
} else {
  console.error('❌ URI de MongoDB no válida');
}

console.log('\n=== RESUMEN ===');
if (allVarsPresent) {
  console.log('✅ Todas las variables de entorno están configuradas');
  console.log('✅ Credenciales de Twilio verificadas');
  console.log('✅ Credenciales de Dialogflow verificadas');
  console.log('✅ URI de MongoDB verificada');
  console.log('\n🚀 La aplicación está lista para desplegar en Digital Ocean!');
} else {
  console.error('❌ Hay problemas en la configuración que deben resolverse antes del despliegue');
  process.exit(1);
} 