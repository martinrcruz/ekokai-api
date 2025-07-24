const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';
let authToken = '';

// Función para obtener token de autenticación
async function obtenerToken() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@correo.com',
      password: 'admin123'
    });
    authToken = response.data.accessToken;
    console.log('✅ Token obtenido exitosamente');
  } catch (error) {
    console.error('❌ Error al obtener token:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Función para crear un tipo de residuo
async function crearTipoResiduo() {
  try {
    const nuevoTipo = {
      nombre: 'Plástico PET',
      descripcion: 'Botellas de plástico PET reciclables',
      tokensPorKg: 50
    };
    
    const response = await axios.post(`${API_BASE}/tipos-residuo`, nuevoTipo, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Tipo de residuo creado:', response.data);
    return response.data.data._id;
  } catch (error) {
    console.error('❌ Error al crear tipo de residuo:', error.response?.data || error.message);
    return null;
  }
}

// Función para listar tipos de residuo
async function listarTiposResiduo() {
  try {
    const response = await axios.get(`${API_BASE}/tipos-residuo`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Tipos de residuo listados:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error al listar tipos de residuo:', error.response?.data || error.message);
    return [];
  }
}

// Función para actualizar un tipo de residuo
async function actualizarTipoResiduo(id) {
  try {
    const datosActualizacion = {
      nombre: 'Plástico PET Actualizado',
      descripcion: 'Botellas de plástico PET reciclables - Versión mejorada',
      tokensPorKg: 75
    };
    
    const response = await axios.put(`${API_BASE}/tipos-residuo/${id}`, datosActualizacion, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Tipo de residuo actualizado:', response.data);
  } catch (error) {
    console.error('❌ Error al actualizar tipo de residuo:', error.response?.data || error.message);
  }
}

// Función para eliminar un tipo de residuo
async function eliminarTipoResiduo(id) {
  try {
    const response = await axios.delete(`${API_BASE}/tipos-residuo/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Tipo de residuo eliminado:', response.data);
  } catch (error) {
    console.error('❌ Error al eliminar tipo de residuo:', error.response?.data || error.message);
  }
}

// Función principal de prueba
async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas de tipos de residuo...\n');
  
  // 1. Obtener token
  await obtenerToken();
  
  // 2. Listar tipos existentes
  console.log('\n📋 Listando tipos de residuo existentes...');
  await listarTiposResiduo();
  
  // 3. Crear nuevo tipo
  console.log('\n➕ Creando nuevo tipo de residuo...');
  const nuevoId = await crearTipoResiduo();
  
  if (nuevoId) {
    // 4. Actualizar tipo creado
    console.log('\n✏️ Actualizando tipo de residuo...');
    await actualizarTipoResiduo(nuevoId);
    
    // 5. Listar tipos después de actualizar
    console.log('\n📋 Listando tipos después de actualizar...');
    await listarTiposResiduo();
    
    // 6. Eliminar tipo creado
    console.log('\n🗑️ Eliminando tipo de residuo...');
    await eliminarTipoResiduo(nuevoId);
    
    // 7. Listar tipos después de eliminar
    console.log('\n📋 Listando tipos después de eliminar...');
    await listarTiposResiduo();
  }
  
  console.log('\n✅ Pruebas completadas');
}

// Ejecutar pruebas
ejecutarPruebas().catch(console.error); 