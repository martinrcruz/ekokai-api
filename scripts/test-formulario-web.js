const axios = require('axios');

const API_BASE_URL = 'https://39f601a5249b.ngrok-free.app/api/ecopunto';

async function testFormularioWeb() {
  console.log('🧪 Probando formulario web...');
  
  const datos = {
    nombre: 'Ana',
    apellido: 'Martínez',
    dni: '77777777',
    telefono: '+56977777777',
    email: 'ana@test.com'
  };
  
  console.log('📋 Datos a enviar:', datos);
  
  try {
    console.log('📤 Enviando POST a:', `${API_BASE_URL}/registrar`);
    
    const response = await axios.post(`${API_BASE_URL}/registrar`, datos, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ Respuesta exitosa:', response.status);
    console.log('📄 Datos de respuesta:', response.data);
    
    if (response.data.success) {
      console.log('🎉 ¡Usuario registrado exitosamente!');
      console.log('👤 ID:', response.data.data.id);
      console.log('📱 Teléfono:', response.data.data.telefono);
      console.log('🎁 Tokens iniciales:', response.data.data.tokens);
    } else {
      console.log('❌ Error en la respuesta:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error en la petición:');
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Datos de error:', error.response.data);
    } else if (error.request) {
      console.error('🌐 Error de red:', error.message);
    } else {
      console.error('🔧 Error:', error.message);
    }
  }
}

// Ejecutar prueba
testFormularioWeb(); 