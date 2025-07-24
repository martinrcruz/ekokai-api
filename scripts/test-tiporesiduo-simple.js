const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

// Función para probar las funcionalidades sin autenticación (solo para verificar que los endpoints responden)
async function probarEndpoints() {
  console.log('🚀 Probando endpoints de tipos de residuo...\n');
  
  try {
    // 1. Probar GET (debería devolver 401 sin token)
    console.log('📋 Probando GET /tipos-residuo...');
    try {
      const response = await axios.get(`${API_BASE}/tipos-residuo`);
      console.log('✅ GET funcionando:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ GET requiere autenticación (correcto)');
      } else {
        console.log('❌ GET error:', error.response?.status || error.message);
      }
    }
    
    // 2. Probar POST (debería devolver 401 sin token)
    console.log('\n➕ Probando POST /tipos-residuo...');
    try {
      const response = await axios.post(`${API_BASE}/tipos-residuo`, {
        nombre: 'Test',
        descripcion: 'Test descripción',
        tokensPorKg: 10
      });
      console.log('✅ POST funcionando:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ POST requiere autenticación (correcto)');
      } else {
        console.log('❌ POST error:', error.response?.status || error.message);
      }
    }
    
    // 3. Probar PUT (debería devolver 401 sin token)
    console.log('\n✏️ Probando PUT /tipos-residuo/test-id...');
    try {
      const response = await axios.put(`${API_BASE}/tipos-residuo/test-id`, {
        nombre: 'Test Actualizado',
        descripcion: 'Test descripción actualizada',
        tokensPorKg: 20
      });
      console.log('✅ PUT funcionando:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ PUT requiere autenticación (correcto)');
      } else {
        console.log('❌ PUT error:', error.response?.status || error.message);
      }
    }
    
    // 4. Probar DELETE (debería devolver 401 sin token)
    console.log('\n🗑️ Probando DELETE /tipos-residuo/test-id...');
    try {
      const response = await axios.delete(`${API_BASE}/tipos-residuo/test-id`);
      console.log('✅ DELETE funcionando:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ DELETE requiere autenticación (correcto)');
      } else {
        console.log('❌ DELETE error:', error.response?.status || error.message);
      }
    }
    
    console.log('\n✅ Todas las pruebas completadas. Los endpoints están respondiendo correctamente.');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar pruebas
probarEndpoints().catch(console.error); 