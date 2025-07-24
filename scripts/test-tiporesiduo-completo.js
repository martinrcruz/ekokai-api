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

// Función para probar todas las funcionalidades
async function probarFuncionalidadesCompletas() {
  console.log('🚀 Probando funcionalidades completas de tipos de residuo...\n');
  
  try {
    // 1. Obtener token
    await obtenerToken();
    
    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Crear tipo de residuo
    console.log('➕ Creando tipo de residuo...');
    const nuevoResiduo = {
      nombre: 'Plástico PET',
      descripcion: 'Botellas de plástico PET reciclables',
      tokensPorKg: 15
    };
    
    const crearResponse = await axios.post(`${API_BASE}/tipos-residuo`, nuevoResiduo, { headers });
    console.log('✅ Tipo de residuo creado:', crearResponse.data);
    const residuoId = crearResponse.data.data._id;
    
    // 3. Listar tipos de residuo
    console.log('\n📋 Listando tipos de residuo...');
    const listarResponse = await axios.get(`${API_BASE}/tipos-residuo`, { headers });
    console.log('✅ Tipos de residuo listados:', listarResponse.data);
    
    // 4. Actualizar tipo de residuo
    console.log('\n✏️ Actualizando tipo de residuo...');
    const datosActualizacion = {
      nombre: 'Plástico PET Actualizado',
      descripcion: 'Botellas de plástico PET reciclables - Actualizado',
      tokensPorKg: 20
    };
    
    const actualizarResponse = await axios.put(`${API_BASE}/tipos-residuo/${residuoId}`, datosActualizacion, { headers });
    console.log('✅ Tipo de residuo actualizado:', actualizarResponse.data);
    
    // 5. Verificar actualización
    console.log('\n🔍 Verificando actualización...');
    const verificarResponse = await axios.get(`${API_BASE}/tipos-residuo`, { headers });
    const residuoActualizado = verificarResponse.data.data.find(r => r._id === residuoId);
    console.log('✅ Residuo actualizado encontrado:', residuoActualizado);
    
    // 6. Eliminar tipo de residuo
    console.log('\n🗑️ Eliminando tipo de residuo...');
    const eliminarResponse = await axios.delete(`${API_BASE}/tipos-residuo/${residuoId}`, { headers });
    console.log('✅ Tipo de residuo eliminado:', eliminarResponse.data);
    
    // 7. Verificar eliminación
    console.log('\n🔍 Verificando eliminación...');
    const verificarEliminacionResponse = await axios.get(`${API_BASE}/tipos-residuo`, { headers });
    const residuoEliminado = verificarEliminacionResponse.data.data.find(r => r._id === residuoId);
    console.log('✅ Residuo eliminado (no encontrado):', residuoEliminado ? 'ERROR' : 'Correcto');
    
    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
probarFuncionalidadesCompletas().catch(console.error); 