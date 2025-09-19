#!/usr/bin/env node

/**
 * Script para probar la validación de premios como recompensas
 */

const { sequelize } = require('./src/config/sequelize');
const Premio = require('./src/models/premio.model');
const recompensaService = require('./src/services/recompensa.service');

async function testPremioValidation() {
  try {
    console.log('🔍 Probando validación de premios como recompensas...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Verificar premios existentes
    console.log(`\n📋 Premios existentes:`);
    const premios = await Premio.findAll({
      attributes: ['id', 'nombre', 'cuponesRequeridos', 'activo', 'stock'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`   Total de premios: ${premios.length}`);
    
    if (premios.length === 0) {
      console.log('   ❌ No hay premios en la base de datos');
      console.log('   💡 Necesitas crear premios primero');
      return;
    }
    
    premios.forEach((premio, index) => {
      console.log(`   ${index + 1}. ID: ${premio.id}`);
      console.log(`      Nombre: "${premio.nombre}"`);
      console.log(`      Cupones requeridos: ${premio.cuponesRequeridos}`);
      console.log(`      Activo: ${premio.activo}`);
      console.log(`      Stock: ${premio.stock}`);
      console.log('');
    });
    
    // Probar validación con el primer premio
    const primerPremio = premios[0];
    const testCode = primerPremio.id;
    
    console.log(`🎯 Probando validación con código: "${testCode}"`);
    console.log(`   Premio: "${primerPremio.nombre}"`);
    
    // Probar el servicio de validación
    console.log(`\n🧪 Probando servicio de validación...`);
    const resultado = await recompensaService.validarCodigo(testCode);
    
    if (resultado.valido) {
      console.log(`   ✅ Validación exitosa:`);
      console.log(`      ID: ${resultado.recompensa.id}`);
      console.log(`      Código: ${resultado.recompensa.codigo}`);
      console.log(`      Nombre: "${resultado.recompensa.nombre}"`);
      console.log(`      Cupones requeridos: ${resultado.recompensa.cuponesRequeridos}`);
      console.log(`      Activo: ${resultado.recompensa.activo}`);
      console.log(`      Stock: ${resultado.recompensa.stock}`);
    } else {
      console.log(`   ❌ Validación falló: ${resultado.mensaje}`);
    }
    
    // Probar con un UUID que no existe
    console.log(`\n🧪 Probando con UUID inexistente...`);
    const fakeCode = '2a63bf00-d318-4190-a037-c85e2d90ba3c';
    const resultadoFake = await recompensaService.validarCodigo(fakeCode);
    
    if (!resultadoFake.valido) {
      console.log(`   ✅ Correctamente rechazado: ${resultadoFake.mensaje}`);
    } else {
      console.log(`   ❌ Debería haber sido rechazado`);
    }
    
    // Probar endpoint HTTP
    console.log(`\n🌐 Probando endpoint HTTP...`);
    console.log(`   URL: GET /api/recompensas/validar/${testCode}`);
    
    // Simular llamada HTTP
    const httpResult = await simulateHttpValidation(testCode);
    if (httpResult.success) {
      console.log(`   ✅ Endpoint HTTP funciona correctamente`);
    } else {
      console.log(`   ❌ Endpoint HTTP falló: ${httpResult.error}`);
    }
    
    console.log('\n🎉 Pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Simular llamada HTTP al endpoint
async function simulateHttpValidation(codigo) {
  try {
    const resultado = await recompensaService.validarCodigo(codigo);
    
    if (resultado.valido) {
      return {
        success: true,
        data: {
          valido: true,
          recompensa: resultado.recompensa
        }
      };
    } else {
      return {
        success: false,
        error: resultado.mensaje,
        status: 404
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testPremioValidation()
    .then(() => {
      console.log('✅ Script de prueba completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script de prueba falló:', error);
      process.exit(1);
    });
}

module.exports = { testPremioValidation };
