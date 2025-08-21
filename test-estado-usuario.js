const https = require('https');
const http = require('http');

// Configuración
const config = {
  local: 'http://localhost:8080',
  credentials: {
    email: 'admin@correo.com',
    password: 'admin123'
  }
};

async function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, success: true });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, success: true });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message, success: false });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ error: 'Timeout', success: false });
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testEstadoUsuario() {
  console.log('🔍 Probando endpoint de cambio de estado...\n');
  
  // 1. Probar login
  const loginData = JSON.stringify(config.credentials);
  const loginResult = await makeRequest(`${config.local}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: loginData
  });

  if (loginResult.success && loginResult.status === 200) {
    console.log('✅ Login exitoso');
    console.log('📝 Token obtenido:', loginResult.data.token ? 'SÍ' : 'NO');
    
    if (loginResult.data.token) {
      // 2. Probar endpoint de cambio de estado
      const estadoData = JSON.stringify({ activo: false });
      const estadoResult = await makeRequest(`${config.local}/usuarios/689a0ae4bff609b46e20c3e4/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginResult.data.token}`,
          'Accept': 'application/json'
        },
        body: estadoData
      });

      if (estadoResult.success) {
        if (estadoResult.status === 200) {
          console.log('✅ Endpoint de cambio de estado funciona');
          console.log('📊 Respuesta:', estadoResult.data);
        } else {
          console.log(`❌ Endpoint de cambio de estado falló - Status: ${estadoResult.status}`);
          console.log('📊 Respuesta:', estadoResult.data);
        }
      } else {
        console.log('❌ Error en endpoint de cambio de estado:', estadoResult.error);
      }
    }
  } else {
    console.log('❌ Login falló');
    if (loginResult.error) {
      console.log('📝 Error:', loginResult.error);
    } else if (loginResult.data) {
      console.log('📝 Respuesta:', loginResult.data);
    }
  }
}

async function main() {
  console.log('🔍 Probando endpoint de cambio de estado de usuario...\n');
  await testEstadoUsuario();
  
  console.log('\n📋 Resumen:');
  console.log('- Si ves ✅ en login, la autenticación funciona');
  console.log('- Si ves ✅ en cambio de estado, el endpoint funciona');
  console.log('- Si ves ❌, hay problemas de configuración');
}

main().catch(console.error);
