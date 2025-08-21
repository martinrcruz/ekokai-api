#!/usr/bin/env node

/**
 * Script para probar las rutas de estadísticas
 * Verifica que los endpoints estén funcionando correctamente
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:8080';
const ENDPOINTS = [
  '/estadisticas/total-kilos',
  '/estadisticas/sucursal-top',
  '/estadisticas/kilos-por-mes',
  '/estadisticas/meta-mensual'
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
    console.log(`   Data:`, JSON.stringify(response.data, null, 2));
    
    return true;
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(colorize(`❌ ${endpoint} - Servidor no disponible`, 'red'));
      console.log(`   Asegúrate de que el backend esté corriendo en ${BASE_URL}`);
    } else if (error.response) {
      if (error.response.status === 401) {
        console.log(colorize(`❌ ${endpoint} - No autorizado (401)`, 'yellow'));
        console.log(`   Se requiere autenticación`);
      } else if (error.response.status === 500) {
        console.log(colorize(`❌ ${endpoint} - Error interno del servidor (500)`, 'red'));
        console.log(`   Error: ${error.response.data?.error || error.response.data?.message || 'Error desconocido'}`);
        
        // Si es el error del modelo, lo destacamos
        if (error.response.data?.error?.includes('aggregate is not a function')) {
          console.log(colorize(`   🔍 PROBLEMA IDENTIFICADO: Modelo no registrado o función aggregate no disponible`, 'red'));
          console.log(`   💡 Solución: Verificar que el modelo EntregaResiduo esté correctamente importado`);
        }
      } else {
        console.log(colorize(`❌ ${endpoint} - Error HTTP ${error.response.status}`, 'red'));
        console.log(`   ${error.response.data?.message || error.message}`);
      }
    } else {
      console.log(colorize(`❌ ${endpoint} - Error: ${error.message}`, 'red'));
    }
    return false;
  }
}

async function testAllEndpoints() {
  console.log(colorize('🚀 Iniciando pruebas de las rutas de estadísticas', 'bright'));
  console.log(colorize('==============================================', 'cyan'));
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
    console.log(colorize('\n🎉 ¡Todas las rutas de estadísticas están funcionando correctamente!', 'green'));
    console.log(colorize('💡 El dashboard debería funcionar sin problemas', 'cyan'));
  } else if (successCount === 0) {
    console.log(colorize('\n⚠️  Todas las rutas tienen problemas', 'yellow'));
    console.log(colorize('🔧 Revisa los errores anteriores:', 'cyan'));
    console.log('   1. Verificar que los modelos estén registrados en Mongoose');
    console.log('   2. Verificar que la base de datos esté conectada');
    console.log('   3. Verificar que los servicios estén funcionando');
  } else {
    console.log(colorize('\n⚠️  Algunas rutas tienen problemas', 'yellow'));
    console.log(colorize('🔧 Revisa los errores anteriores', 'cyan'));
  }
  
  console.log(colorize('\n💡 Para probar el frontend:', 'cyan'));
  console.log('   1. Navega al dashboard del administrador');
  console.log('   2. Verifica que se carguen las estadísticas');
  console.log('   3. Prueba los gráficos y métricas');
}

// Ejecutar pruebas
if (require.main === module) {
  testAllEndpoints().catch(error => {
    console.error(colorize('❌ Error fatal en las pruebas:', 'red'), error);
    process.exit(1);
  });
}

module.exports = { testAllEndpoints };
