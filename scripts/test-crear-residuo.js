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

// Función para probar la creación de tipos de residuo
async function probarCrearResiduos() {
  console.log('🚀 Probando creación de tipos de residuo...\n');
  
  try {
    // 1. Obtener token
    await obtenerToken();
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Listar tipos existentes
    console.log('📋 Listando tipos de residuo existentes...');
    const listarResponse = await axios.get(`${API_BASE}/tipos-residuo`, { headers });
    console.log('✅ Tipos existentes:', listarResponse.data.data.length);
    
    // 3. Crear diferentes tipos de residuo
    const tiposResiduo = [
      {
        nombre: 'Plástico PET',
        descripcion: 'Botellas de plástico PET reciclables',
        tokensPorKg: 15.5
      },
      {
        nombre: 'Papel y Cartón',
        descripcion: 'Papel blanco, periódicos y cartón limpio',
        tokensPorKg: 8.0
      },
      {
        nombre: 'Vidrio',
        descripcion: 'Botellas y frascos de vidrio transparente y de color',
        tokensPorKg: 12.0
      },
      {
        nombre: 'Aluminio',
        descripcion: 'Latas de aluminio y otros metales ligeros',
        tokensPorKg: 25.0
      },
      {
        nombre: 'Tetra Pak',
        descripcion: 'Envases de cartón para bebidas y alimentos',
        tokensPorKg: 10.5
      }
    ];
    
    for (let i = 0; i < tiposResiduo.length; i++) {
      const residuo = tiposResiduo[i];
      console.log(`\n➕ Creando tipo de residuo ${i + 1}/${tiposResiduo.length}: ${residuo.nombre}`);
      
      try {
        const crearResponse = await axios.post(`${API_BASE}/tipos-residuo`, residuo, { headers });
        console.log('✅ Creado exitosamente:', crearResponse.data);
      } catch (error) {
        console.error('❌ Error al crear:', error.response?.data || error.message);
      }
    }
    
    // 4. Verificar tipos creados
    console.log('\n📋 Verificando tipos de residuo creados...');
    const verificarResponse = await axios.get(`${API_BASE}/tipos-residuo`, { headers });
    console.log('✅ Total de tipos de residuo:', verificarResponse.data.data.length);
    
    // 5. Mostrar estadísticas
    const residuos = verificarResponse.data.data;
    if (residuos.length > 0) {
      const tokens = residuos.map(r => r.tokensPorKg || 0);
      const promedio = tokens.reduce((sum, token) => sum + token, 0) / tokens.length;
      const maximo = Math.max(...tokens);
      
      console.log('\n📊 Estadísticas:');
      console.log(`- Total tipos: ${residuos.length}`);
      console.log(`- Promedio tokens/kg: ${promedio.toFixed(1)}`);
      console.log(`- Máximo tokens/kg: ${maximo}`);
    }
    
    console.log('\n🎉 Pruebas de creación completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
probarCrearResiduos().catch(console.error); 