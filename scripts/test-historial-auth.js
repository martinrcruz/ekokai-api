#!/usr/bin/env node

/**
 * Script para probar las rutas del historial de reciclaje con autenticación
 * Verifica que los endpoints funcionen correctamente con un token válido
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:8080';

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

async function obtenerTokenAdmin() {
  try {
    console.log(colorize('🔑 Obteniendo token de administrador...', 'blue'));
    
    // Primero necesitamos crear un usuario administrador o usar uno existente
    // Por ahora, vamos a intentar hacer login con credenciales por defecto
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ekokai.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.token) {
      console.log(colorize('✅ Token obtenido correctamente', 'green'));
      return loginResponse.data.token;
    }
    
  } catch (error) {
    console.log(colorize('❌ No se pudo obtener token automáticamente', 'red'));
    console.log('   Error:', error.response?.data?.message || error.message);
    console.log(colorize('\n💡 Para probar manualmente:', 'cyan'));
    console.log('   1. Haz login en el frontend como administrador');
    console.log('   2. Copia el token del localStorage');
    console.log('   3. Úsalo en las pruebas');
  }
  
  return null;
}

async function testEndpoint(endpoint, token) {
  try {
    console.log(colorize(`🔍 Probando: ${endpoint}`, 'blue'));
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers,
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
        console.log(`   Se requiere autenticación. Token: ${token ? '✅ Presente' : '❌ Ausente'}`);
      } else if (error.response.status === 500) {
        console.log(colorize(`❌ ${endpoint} - Error interno del servidor (500)`, 'red'));
        console.log(`   Error: ${error.response.data?.error || error.response.data?.message || 'Error desconocido'}`);
        
        // Si es el error del modelo, lo destacamos
        if (error.response.data?.error?.includes('Schema hasn\'t been registered')) {
          console.log(colorize(`   🔍 PROBLEMA IDENTIFICADO: Modelo no registrado en Mongoose`, 'red'));
          console.log(`   💡 Solución: Verificar que todos los modelos estén importados antes de las rutas`);
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
  console.log(colorize('🚀 Iniciando pruebas de las rutas del historial con autenticación', 'bright'));
  console.log(colorize('================================================================', 'cyan'));
  console.log(`📍 URL Base: ${BASE_URL}\n`);
  
  // Intentar obtener token
  const token = await obtenerTokenAdmin();
  
  if (!token) {
    console.log(colorize('\n⚠️  Continuando sin token - las rutas devolverán 401', 'yellow'));
  }
  
  const ENDPOINTS = [
    '/entregas/historial',
    '/entregas/estadisticas'
  ];
  
  let successCount = 0;
  let totalEndpoints = ENDPOINTS.length;
  
  for (const endpoint of ENDPOINTS) {
    const success = await testEndpoint(endpoint, token);
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
  } else if (successCount === 0 && token) {
    console.log(colorize('\n⚠️  Las rutas requieren autenticación pero hay problemas técnicos', 'yellow'));
    console.log(colorize('🔧 Revisa los errores anteriores:', 'cyan'));
    console.log('   1. Verificar que los modelos estén registrados en Mongoose');
    console.log('   2. Verificar que la base de datos esté conectada');
    console.log('   3. Verificar que los controladores estén funcionando');
  } else {
    console.log(colorize('\n⚠️  Algunas rutas tienen problemas', 'yellow'));
    console.log(colorize('🔧 Revisa los errores anteriores', 'cyan'));
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


