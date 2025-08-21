#!/usr/bin/env node

/**
 * Script para probar las rutas del historial de reciclaje
 * Verifica que los endpoints estén funcionando correctamente
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:8080';
const ENDPOINTS = [
  '/entregas/historial',
  '/entregas/estadisticas'
];

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

async function testEndpoint(endpoint) {
  try {
    console.log(colorize(`🔍 Probando: ${endpoint}`, 'blue'));
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      timeout: 10000
    });
    
    console.log(colorize(`✅ ${endpoint} - OK`, 'green'));
    console.log(`   Status: ${response.status}`);
    console.log(`   Data:`, response.data);
    
    return true;
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(colorize(`❌ ${endpoint} - Servidor no disponible`, 'red'));
      console.log(`   Asegúrate de que el backend esté corriendo en ${BASE_URL}`);
    } else if (error.response) {
      console.log(colorize(`❌ ${endpoint} - Error HTTP ${error.response.status}`, 'red'));
      console.log(`   ${error.response.data?.message || error.message}`);
    } else {
      console.log(colorize(`❌ ${endpoint} - Error: ${error.message}`, 'red'));
    }
    return false;
  }
}

async function testAllEndpoints() {
  console.log(colorize('🚀 Iniciando pruebas de las rutas del historial', 'bright'));
  console.log(colorize('============================================', 'cyan'));
  console.log(`📍 URL Base: ${BASE_URL}\n`);
  
  let successCount = 0;
  let totalEndpoints = ENDPOINTS.length;
  
  for (const endpoint of ENDPOINTS) {
    const success = await testEndpoint(endpoint);
    if (success) successCount++;
    console.log(''); // Línea en blanco entre pruebas
  }
  
  // Resumen
  console.log(colorize('📊 Resumen de Pruebas', 'bright'));
  console.log(colorize('====================', 'cyan'));
  console.log(`✅ Endpoints exitosos: ${successCount}/${totalEndpoints}`);
  
  if (successCount === totalEndpoints) {
    console.log(colorize('\n🎉 ¡Todas las rutas del historial están funcionando correctamente!', 'green'));
    console.log(colorize('💡 El backend está listo para recibir peticiones del frontend', 'cyan'));
  } else {
    console.log(colorize('\n⚠️  Algunas rutas tienen problemas', 'yellow'));
    console.log(colorize('🔧 Revisa los errores anteriores y asegúrate de que:', 'cyan'));
    console.log('   1. El servidor esté corriendo');
    console.log('   2. Las rutas estén registradas correctamente en app.js');
    console.log('   3. Los controladores estén funcionando');
    console.log('   4. La base de datos esté conectada');
  }
  
  console.log(colorize('\n💡 Para probar el frontend:', 'cyan'));
  console.log('   1. Navega a /administrador/historial-reciclaje');
  console.log('   2. Verifica que se carguen los datos');
  console.log('   3. Prueba los filtros y estadísticas');
}

// Ejecutar pruebas
if (require.main === module) {
  testAllEndpoints().catch(error => {
    console.error(colorize('❌ Error fatal en las pruebas:', 'red'), error);
    process.exit(1);
  });
}

module.exports = { testAllEndpoints };
