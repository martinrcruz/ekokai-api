const axios = require('axios');

const WEBHOOK_URL = 'http://localhost:8080/webhook/whatsapp';
const TELEFONO = '+56944596955';

async function probarOpcion(opcion) {
  try {
    console.log(`🧪 Probando opción: "${opcion}"`);
    console.log('─'.repeat(50));
    
    const response = await axios.post(WEBHOOK_URL, {
      From: `whatsapp:${TELEFONO}`,
      Body: opcion
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📤 Respuesta enviada correctamente`);
    console.log('');
    
    // Esperar un poco entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error(`❌ Error probando "${opcion}":`, error.message);
  }
}

async function probarMenuNumerico() {
  console.log('🤖 PROBANDO MENÚ NUMÉRICO EKOKAI');
  console.log('==================================================');
  console.log(`📱 Webhook: ${WEBHOOK_URL}`);
  console.log(`📞 Teléfono: ${TELEFONO}`);
  console.log(`🎯 Opciones a probar: 4`);
  console.log('');

  // Probar cada opción numérica
  const opciones = ['1', '2', '3', '4'];
  
  for (const opcion of opciones) {
    await probarOpcion(opcion);
  }

  console.log('🎉 Pruebas del menú numérico completadas!');
  console.log('📊 Revisa los logs del servidor para ver las respuestas del bot');
}

probarMenuNumerico().catch(console.error); 