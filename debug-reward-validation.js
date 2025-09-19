#!/usr/bin/env node

/**
 * Script para debuggear la validación de recompensas
 */

const { sequelize } = require('./src/config/sequelize');
const Recompensa = require('./src/models/recompensa.model');

async function debugRewardValidation() {
  try {
    console.log('🔍 Debuggeando validación de recompensas...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    const testCode = '2a63bf00-d318-4190-a037-c85e2d90ba3c';
    console.log(`\n🎯 Probando código: "${testCode}"`);
    console.log(`📏 Longitud del código: ${testCode.length} caracteres`);
    
    // Verificar si el código es demasiado largo para el campo
    console.log(`\n📊 Información del campo 'codigo':`);
    console.log(`   Tipo: STRING(50)`);
    console.log(`   Longitud máxima: 50 caracteres`);
    console.log(`   Longitud del UUID: ${testCode.length} caracteres`);
    
    if (testCode.length > 50) {
      console.log(`   ❌ PROBLEMA: El UUID es más largo que el campo (${testCode.length} > 50)`);
    } else {
      console.log(`   ✅ El UUID cabe en el campo`);
    }
    
    // Buscar todas las recompensas para ver qué códigos existen
    console.log(`\n📋 Recompensas existentes:`);
    const recompensas = await Recompensa.findAll({
      attributes: ['id', 'codigo', 'nombre', 'activo'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`   Total de recompensas: ${recompensas.length}`);
    
    recompensas.forEach((recompensa, index) => {
      console.log(`   ${index + 1}. ID: ${recompensa.id}, Código: "${recompensa.codigo}", Nombre: "${recompensa.nombre}", Activo: ${recompensa.activo}`);
    });
    
    // Buscar específicamente el código de prueba
    console.log(`\n🔍 Buscando código específico: "${testCode}"`);
    const recompensaEncontrada = await Recompensa.findOne({
      where: { codigo: testCode }
    });
    
    if (recompensaEncontrada) {
      console.log(`   ✅ Recompensa encontrada:`);
      console.log(`      ID: ${recompensaEncontrada.id}`);
      console.log(`      Código: "${recompensaEncontrada.codigo}"`);
      console.log(`      Nombre: "${recompensaEncontrada.nombre}"`);
      console.log(`      Activo: ${recompensaEncontrada.activo}`);
      console.log(`      Cupones requeridos: ${recompensaEncontrada.cuponesRequeridos}`);
      
      if (recompensaEncontrada.fechaExpiracion) {
        console.log(`      Fecha expiración: ${recompensaEncontrada.fechaExpiracion}`);
        const isExpired = new Date() > new Date(recompensaEncontrada.fechaExpiracion);
        console.log(`      ¿Expirado?: ${isExpired}`);
      }
    } else {
      console.log(`   ❌ Recompensa NO encontrada`);
      
      // Buscar códigos similares
      console.log(`\n🔍 Buscando códigos similares...`);
      const codigosSimilares = await Recompensa.findAll({
        where: {
          codigo: {
            [sequelize.Sequelize.Op.like]: `%${testCode.substring(0, 8)}%`
          }
        },
        attributes: ['id', 'codigo', 'nombre']
      });
      
      if (codigosSimilares.length > 0) {
        console.log(`   📋 Códigos similares encontrados:`);
        codigosSimilares.forEach((r, index) => {
          console.log(`      ${index + 1}. "${r.codigo}" - "${r.nombre}"`);
        });
      } else {
        console.log(`   📋 No se encontraron códigos similares`);
      }
    }
    
    // Probar búsqueda con diferentes métodos
    console.log(`\n🧪 Probando diferentes métodos de búsqueda:`);
    
    // 1. Búsqueda exacta
    const exacta = await Recompensa.findOne({
      where: { codigo: testCode }
    });
    console.log(`   1. Búsqueda exacta: ${exacta ? '✅ Encontrada' : '❌ No encontrada'}`);
    
    // 2. Búsqueda con LIKE
    const like = await Recompensa.findOne({
      where: {
        codigo: {
          [sequelize.Sequelize.Op.like]: testCode
        }
      }
    });
    console.log(`   2. Búsqueda LIKE: ${like ? '✅ Encontrada' : '❌ No encontrada'}`);
    
    // 3. Búsqueda con ILIKE (case insensitive)
    const ilike = await Recompensa.findOne({
      where: {
        codigo: {
          [sequelize.Sequelize.Op.iLike]: testCode
        }
      }
    });
    console.log(`   3. Búsqueda ILIKE: ${ilike ? '✅ Encontrada' : '❌ No encontrada'}`);
    
    // 4. Búsqueda con REGEXP
    try {
      const regexp = await Recompensa.findOne({
        where: {
          codigo: {
            [sequelize.Sequelize.Op.regexp]: testCode
          }
        }
      });
      console.log(`   4. Búsqueda REGEXP: ${regexp ? '✅ Encontrada' : '❌ No encontrada'}`);
    } catch (error) {
      console.log(`   4. Búsqueda REGEXP: ❌ Error - ${error.message}`);
    }
    
    console.log('\n🎉 Debug completado');
    
  } catch (error) {
    console.error('❌ Error durante el debug:', error);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugRewardValidation()
    .then(() => {
      console.log('✅ Script de debug completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script de debug falló:', error);
      process.exit(1);
    });
}

module.exports = { debugRewardValidation };
