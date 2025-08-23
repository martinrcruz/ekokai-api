const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testRoutes() {
  console.log('🧪 Probando rutas del backend...\n');

  try {
    // Probar health check
    console.log('1. Probando health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Probar ruta de premios (pública)
    console.log('\n2. Probando ruta de premios (pública)...');
    const premiosResponse = await axios.get(`${BASE_URL}/premios/catalogo`);
    console.log('✅ Premios activos:', premiosResponse.data);

    // Probar ruta de premios (protegida) - debería fallar sin token
    console.log('\n3. Probando ruta de premios (protegida) sin token...');
    try {
      await axios.get(`${BASE_URL}/premios`);
      console.log('❌ Debería haber fallado sin token');
    } catch (error) {
      console.log('✅ Correctamente protegida:', error.response?.status, error.response?.data?.error);
    }

    // Probar ruta de entregas (protegida) - debería fallar sin token
    console.log('\n4. Probando ruta de entregas (protegida) sin token...');
    try {
      await axios.get(`${BASE_URL}/entregas/historial`);
      console.log('❌ Debería haber fallado sin token');
    } catch (error) {
      console.log('✅ Correctamente protegida:', error.response?.status, error.response?.data?.error);
    }

    console.log('\n🎉 Todas las pruebas completadas!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Ejecutar pruebas
testRoutes();
