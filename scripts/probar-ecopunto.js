const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:8080/api/ecopunto';

// Datos de prueba
const usuarioPrueba = {
  nombre: 'Juan',
  apellido: 'Pérez',
  dni: '12345678',
  telefono: '+56944596955',
  email: 'juan.perez@email.com'
};

const reciclajePrueba = {
  telefono: '+56944596955',
  tipoMaterial: 'plásticos PET',
  peso: 2.3
};

// Función para probar registro
async function probarRegistro() {
  console.log('🧪 Probando registro de usuario desde ecopunto...');
  console.log('─'.repeat(50));
  
  try {
    const response = await axios.post(`${BASE_URL}/registrar`, usuarioPrueba);
    
    console.log('✅ Registro exitoso:');
    console.log(`   Usuario: ${response.data.data.nombre}`);
    console.log(`   Teléfono: ${response.data.data.telefono}`);
    console.log(`   Tokens iniciales: ${response.data.data.tokens}`);
    console.log(`   ID: ${response.data.data.id}`);
    
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('⚠️ Usuario ya existe, continuando con reciclaje...');
      return true;
    }
    console.log('❌ Error en registro:', error.response?.data || error.message);
    return false;
  }
}

// Función para probar reciclaje
async function probarReciclaje() {
  console.log('\n♻️ Probando procesamiento de reciclaje...');
  console.log('─'.repeat(50));
  
  try {
    const response = await axios.post(`${BASE_URL}/reciclar`, reciclajePrueba);
    
    console.log('✅ Reciclaje procesado exitosamente:');
    console.log(`   Material: ${response.data.data.tipoMaterial}`);
    console.log(`   Peso: ${response.data.data.peso} kg`);
    console.log(`   Tokens ganados: ${response.data.data.tokensGanados}`);
    console.log(`   Usuario: ${response.data.data.usuario}`);
    
    return true;
  } catch (error) {
    console.log('❌ Error en reciclaje:', error.response?.data || error.message);
    return false;
  }
}

// Función para verificar estado del servicio
async function verificarEstado() {
  console.log('🔍 Verificando estado del servicio...');
  console.log('─'.repeat(50));
  
  try {
    const response = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Servicio funcionando correctamente');
    console.log(`   Timestamp: ${response.data.timestamp}`);
    console.log(`   Endpoints disponibles: ${Object.keys(response.data.endpoints).length}`);
    return true;
  } catch (error) {
    console.log('❌ Error verificando estado:', error.message);
    return false;
  }
}

// Función principal
async function probarFlujoCompleto() {
  console.log('🚀 PROBANDO FLUJO COMPLETO DE ECOPUNTO');
  console.log('='.repeat(50));
  console.log(`📱 Base URL: ${BASE_URL}`);
  console.log(`👤 Usuario de prueba: ${usuarioPrueba.nombre} ${usuarioPrueba.apellido}`);
  console.log(`📞 Teléfono: ${usuarioPrueba.telefono}`);
  console.log(`♻️ Material: ${reciclajePrueba.tipoMaterial} (${reciclajePrueba.peso} kg)`);
  console.log('');

  // Verificar estado
  const estadoOk = await verificarEstado();
  if (!estadoOk) {
    console.log('❌ Servicio no disponible');
    return;
  }

  // Probar registro
  const registroOk = await probarRegistro();
  if (!registroOk) {
    console.log('❌ Error en registro, abortando');
    return;
  }

  // Esperar un momento
  console.log('\n⏳ Esperando 2 segundos...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Probar reciclaje
  const reciclajeOk = await probarReciclaje();
  if (!reciclajeOk) {
    console.log('❌ Error en reciclaje');
    return;
  }

  console.log('\n🎉 ¡Flujo completo probado exitosamente!');
  console.log('📱 Revisa WhatsApp para ver los mensajes automáticos');
}

// Ejecutar pruebas
probarFlujoCompleto().catch(console.error); 