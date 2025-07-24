const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

// Credenciales de administrador
const ADMIN_CREDENTIALS = {
  email: 'admin@correo.com',
  password: 'admin123'
};

let authToken = '';

// Función para obtener token de autenticación
async function obtenerToken() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    const response = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
    authToken = response.data.token;
    console.log('✅ Token obtenido exitosamente');
    return authToken;
  } catch (error) {
    console.error('❌ Error al obtener token:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar la creación
async function probarCreacion() {
  console.log('🚀 Probando creación de tipo de residuo...\n');
  
  try {
    // 1. Obtener token
    await obtenerToken();
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Crear tipo de residuo
    const nuevoResiduo = {
      nombre: 'Test Modal',
      descripcion: 'Tipo de residuo de prueba para el modal',
      tokensPorKg: 10.5
    };
    
    console.log('➕ Creando tipo de residuo:', nuevoResiduo);
    const crearResponse = await axios.post(`${API_BASE}/tipos-residuo`, nuevoResiduo, { headers });
    console.log('✅ Creado exitosamente:', crearResponse.data);
    
    // 3. Verificar que se creó
    console.log('\n📋 Verificando tipos de residuo...');
    const listarResponse = await axios.get(`${API_BASE}/tipos-residuo`, { headers });
    console.log('✅ Total de tipos:', listarResponse.data.data.length);
    
    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
probarCreacion().catch(console.error); 