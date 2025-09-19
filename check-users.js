const axios = require('axios');

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    const baseURL = 'http://localhost:8080';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE4MWRkNDY3LWRjM2ItNDJjZC1hZmEwLTUyNzBiNTBiMTkwMiIsImVtYWlsIjoiYWRtaW5AZWtva2FpLmNvbSIsInJvbCI6ImFkbWluaXN0cmFkb3IiLCJpYXQiOjE3NTgyNTIyMjAsImV4cCI6MTc1ODg1NzAyMH0.VuLZmQXxqCm0yNrav4NvzRMrKuKfsQ3rQaFzxOE4Qsc';
    
    const response = await axios.get(`${baseURL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Usuarios encontrados:', response.data.usuarios?.length || 0);
    
    if (response.data.usuarios && response.data.usuarios.length > 0) {
      console.log('\n📋 Usuarios registrados:');
      response.data.usuarios.forEach((usuario, index) => {
        console.log(`${index + 1}. ${usuario.nombre} ${usuario.apellido}`);
        console.log(`   Email: ${usuario.email}`);
        console.log(`   Teléfono: ${usuario.telefono}`);
        console.log(`   Rol: ${usuario.rol}`);
        console.log(`   Activo: ${usuario.activo}`);
        console.log('');
      });
      
      // Probar detección con los números reales
      console.log('🧪 Probando detección con números reales...');
      for (const usuario of response.data.usuarios.slice(0, 2)) {
        if (usuario.telefono) {
          console.log(`\n📞 Probando detección para: ${usuario.telefono}`);
          
          try {
            const phoneResponse = await axios.get(`${baseURL}/usuarios/buscar-telefono`, {
              params: { telefono: usuario.telefono },
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('✅ Detección exitosa:', JSON.stringify(phoneResponse.data, null, 2));
            
          } catch (error) {
            console.log('❌ Error en detección:', error.response?.data || error.message);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error verificando usuarios:', error.response?.data || error.message);
  }
}

checkUsers();
