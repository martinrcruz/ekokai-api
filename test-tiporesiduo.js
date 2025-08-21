const axios = require('axios');

const API_BASE = 'http://localhost:8080';

async function testTiposResiduo() {
  try {
    console.log('🧪 Probando endpoint de tipos de residuo...');
    
    // Primero obtener token de autenticación (necesario para endpoints protegidos)
    const authResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ekokai.com', // Ajusta según tu usuario admin
      password: 'admin123' // Ajusta según tu contraseña
    });
    
    const token = authResponse.data.accessToken;
    console.log('✅ Token obtenido:', token ? 'SÍ' : 'NO');
    
    // Configurar headers con token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Probar endpoint de tipos de residuo
    console.log('🔍 Probando GET /tipos-residuo...');
    const tiposResponse = await axios.get(`${API_BASE}/tipos-residuo`, { headers });
    
    console.log('✅ Tipos de residuo obtenidos:', tiposResponse.data);
    console.log('📊 Cantidad de tipos:', tiposResponse.data.data?.length || 0);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Headers:', error.response.headers);
    }
  }
}

async function testBuscarVecinos() {
  try {
    console.log('\n🧪 Probando endpoint de búsqueda de vecinos...');
    
    // Primero obtener token de autenticación
    const authResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ekokai.com', // Ajusta según tu usuario admin
      password: 'admin123' // Ajusta según tu contraseña
    });
    
    const token = authResponse.data.accessToken;
    console.log('✅ Token obtenido:', token ? 'SÍ' : 'NO');
    
    // Configurar headers con token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Probar endpoint de búsqueda de vecinos
    console.log('🔍 Probando GET /usuarios/buscar-vecinos?telefono=948894523...');
    const vecinosResponse = await axios.get(`${API_BASE}/usuarios/buscar-vecinos?telefono=948894523`, { headers });
    
    console.log('✅ Vecinos encontrados:', vecinosResponse.data);
    console.log('📊 Cantidad de vecinos:', vecinosResponse.data.length || 0);
    
  } catch (error) {
    console.error('❌ Error en la prueba de búsqueda de vecinos:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Headers:', error.response.headers);
    }
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de la API...\n');
  
  await testTiposResiduo();
  await testBuscarVecinos();
  
  console.log('\n✨ Pruebas completadas');
}

runTests().catch(console.error);
