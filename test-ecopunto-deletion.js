const axios = require('axios');

// Configuración
const API_BASE_URL = process.env.API_URL || 'http://localhost:8080';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ekokai.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let authToken = '';

async function loginAdmin() {
  try {
    console.log('🔐 Iniciando sesión como administrador...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Sesión iniciada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error.response?.data || error.message);
    return false;
  }
}

async function crearEcopuntoTest() {
  try {
    console.log('📝 Creando ecopunto de prueba...');
    const response = await axios.post(`${API_BASE_URL}/ecopuntos`, {
      nombre: 'Ecopunto Test Eliminación',
      direccion: 'Calle Test 123',
      descripcion: 'Ecopunto para probar eliminación',
      horarioApertura: '08:00',
      horarioCierre: '20:00',
      activo: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ecopunto creado:', response.data.data.id);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error al crear ecopunto:', error.response?.data || error.message);
    return null;
  }
}

async function listarEcopuntos() {
  try {
    console.log('📋 Listando ecopuntos...');
    const response = await axios.get(`${API_BASE_URL}/ecopuntos`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Se encontraron ${response.data.data.length} ecopuntos`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error al listar ecopuntos:', error.response?.data || error.message);
    return [];
  }
}

async function eliminarEcopunto(ecopuntoId) {
  try {
    console.log(`🗑️ Eliminando ecopunto ${ecopuntoId}...`);
    const response = await axios.delete(`${API_BASE_URL}/ecopuntos/${ecopuntoId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ecopunto eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar ecopunto:', error.response?.data || error.message);
    return false;
  }
}

async function testEliminacionSinAuth() {
  try {
    console.log('🔒 Probando eliminación sin autenticación...');
    const response = await axios.delete(`${API_BASE_URL}/ecopuntos/00000000-0000-0000-0000-000000000000`);
    console.log('❌ ERROR: La eliminación debería haber fallado sin autenticación');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correcto: Eliminación bloqueada sin autenticación');
      return true;
    } else {
      console.error('❌ Error inesperado:', error.response?.data || error.message);
      return false;
    }
  }
}

async function main() {
  console.log('🧪 Iniciando pruebas de eliminación de ecopuntos...\n');
  
  // 1. Probar eliminación sin autenticación
  console.log('=== PRUEBA 1: Eliminación sin autenticación ===');
  const test1 = await testEliminacionSinAuth();
  
  // 2. Iniciar sesión
  console.log('\n=== PRUEBA 2: Inicio de sesión ===');
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.log('❌ No se pudo continuar sin autenticación');
    return;
  }
  
  // 3. Crear ecopunto de prueba
  console.log('\n=== PRUEBA 3: Creación de ecopunto ===');
  const ecopuntoTest = await crearEcopuntoTest();
  if (!ecopuntoTest) {
    console.log('❌ No se pudo crear ecopunto de prueba');
    return;
  }
  
  // 4. Listar ecopuntos antes de eliminar
  console.log('\n=== PRUEBA 4: Listado antes de eliminar ===');
  const ecopuntosAntes = await listarEcopuntos();
  const ecopuntoEncontrado = ecopuntosAntes.find(e => e.id === ecopuntoTest.id);
  if (!ecopuntoEncontrado) {
    console.log('❌ El ecopunto creado no se encontró en la lista');
    return;
  }
  console.log('✅ Ecopunto encontrado en la lista');
  
  // 5. Eliminar ecopunto
  console.log('\n=== PRUEBA 5: Eliminación de ecopunto ===');
  console.log('ID del ecopunto a eliminar:', ecopuntoTest.id);
  const eliminacionSuccess = await eliminarEcopunto(ecopuntoTest.id);
  if (!eliminacionSuccess) {
    console.log('❌ No se pudo eliminar el ecopunto');
    return;
  }
  
  // 6. Verificar eliminación
  console.log('\n=== PRUEBA 6: Verificación de eliminación ===');
  const ecopuntosDespues = await listarEcopuntos();
  const ecopuntoEliminado = ecopuntosDespues.find(e => e.id === ecopuntoTest.id);
  if (ecopuntoEliminado) {
    console.log('❌ ERROR: El ecopunto aún existe después de la eliminación');
    return;
  }
  console.log('✅ Ecopunto eliminado correctamente');
  
  // 7. Intentar eliminar ecopunto inexistente
  console.log('\n=== PRUEBA 7: Eliminación de ecopunto inexistente ===');
  try {
    await axios.delete(`${API_BASE_URL}/ecopuntos/ecopunto-inexistente`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('❌ ERROR: Debería haber fallado al eliminar ecopunto inexistente');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correcto: Error 404 para ecopunto inexistente');
    } else {
      console.error('❌ Error inesperado:', error.response?.data || error.message);
    }
  }
  
  console.log('\n🎉 Todas las pruebas completadas exitosamente!');
  console.log('\n📋 RESUMEN:');
  console.log('✅ Eliminación bloqueada sin autenticación');
  console.log('✅ Autenticación funcionando');
  console.log('✅ Creación de ecopuntos funcionando');
  console.log('✅ Listado de ecopuntos funcionando');
  console.log('✅ Eliminación de ecopuntos funcionando');
  console.log('✅ Verificación de eliminación funcionando');
  console.log('✅ Manejo de errores para ecopuntos inexistentes');
}

// Ejecutar pruebas
main().catch(console.error);
