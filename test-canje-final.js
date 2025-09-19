const axios = require('axios');

async function testCanjeFinal() {
  try {
    console.log('🧪 Probando canje después de la corrección...');
    
    // Autenticarse
    const authResponse = await axios.post('http://localhost:8080/auth/login', {
      email: 'admin@ekokai.com',
      password: 'admin123'
    });
    
    const token = authResponse.data.token;
    console.log('✅ Autenticación exitosa');
    
    // Datos de prueba para el canje
    const canjeData = {
      usuarioId: '266404a8-1b21-4396-b437-2e3dd85340ae',
      codigoRecompensa: '2a63bf00-d318-4190-a037-c85e2d90ba3c',
      cupones: [],
      fecha: new Date().toISOString(),
      estado: 'completado'
    };
    
    console.log('📤 Enviando datos:', canjeData);
    
    try {
      const response = await axios.post('http://localhost:8080/canjes/recompensa', canjeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Canje exitoso:', response.data);
      
    } catch (error) {
      console.log('❌ Error en canje:');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
      
      if (error.response?.status === 400 && error.response?.data?.error?.includes('invalid input syntax')) {
        console.log('🔍 El problema de tipo de dato persiste');
      } else if (error.response?.status === 403) {
        console.log('🔍 Problema de autorización');
      } else {
        console.log('🔍 Otro tipo de error');
      }
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testCanjeFinal();
