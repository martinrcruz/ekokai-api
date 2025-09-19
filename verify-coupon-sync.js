#!/usr/bin/env node

/**
 * Script para verificar que la sincronización de cupones funcionó correctamente
 */

const { sequelize } = require('./src/config/sequelize');
const CuponMoneda = require('./src/models/cupon-moneda.model');
const CanjeReciclaje = require('./src/models/canjeReciclaje.model');
const Usuario = require('./src/models/usuario.model');

async function verifyCouponSync() {
  try {
    console.log('🔍 Verificando sincronización de cupones...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Obtener todos los usuarios que tienen CuponMoneda
    const cuponesMoneda = await CuponMoneda.findAll();
    
    console.log(`\n📊 Usuarios con CuponMoneda: ${cuponesMoneda.length}`);
    
    for (const cuponMoneda of cuponesMoneda) {
      const userId = cuponMoneda.usuarioId;
      const usuario = await Usuario.findByPk(userId);
      
      // Contar canjes de reciclaje completados para este usuario
      const canjesCompletados = await CanjeReciclaje.count({
        where: {
          usuarioId: userId,
          estado: 'completado',
          cuponGeneradoId: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      });
      
      const saldoCuponMoneda = cuponMoneda.cantidad;
      
      console.log(`\n👤 Usuario: ${usuario.nombre} ${usuario.apellido} (${usuario.telefono})`);
      console.log(`   🎟️ Saldo en CuponMoneda: ${saldoCuponMoneda}`);
      console.log(`   ♻️ Canjes de reciclaje completados: ${canjesCompletados}`);
      
      if (saldoCuponMoneda === canjesCompletados) {
        console.log(`   ✅ ¡SINCRONIZACIÓN CORRECTA!`);
      } else {
        console.log(`   ❌ ¡DESINCRONIZACIÓN DETECTADA!`);
        console.log(`   📊 Diferencia: ${Math.abs(saldoCuponMoneda - canjesCompletados)} cupones`);
      }
    }
    
    // Verificar usuarios que tienen canjes pero no CuponMoneda
    console.log(`\n🔍 Verificando usuarios con canjes pero sin CuponMoneda...`);
    
    const usuariosConCanjes = await CanjeReciclaje.findAll({
      attributes: ['usuarioId'],
      where: {
        estado: 'completado',
        cuponGeneradoId: {
          [sequelize.Sequelize.Op.ne]: null
        }
      },
      group: ['usuarioId']
    });
    
    for (const canje of usuariosConCanjes) {
      const userId = canje.usuarioId;
      
      const tieneCuponMoneda = await CuponMoneda.findOne({
        where: { usuarioId: userId }
      });
      
      if (!tieneCuponMoneda) {
        const usuario = await Usuario.findByPk(userId);
        const canjesCount = await CanjeReciclaje.count({
          where: {
            usuarioId: userId,
            estado: 'completado',
            cuponGeneradoId: {
              [sequelize.Sequelize.Op.ne]: null
            }
          }
        });
        
        console.log(`❌ Usuario ${usuario?.nombre || userId} tiene ${canjesCount} canjes pero NO tiene CuponMoneda`);
      }
    }
    
    console.log('\n🎉 Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyCouponSync()
    .then(() => {
      console.log('✅ Script de verificación completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script de verificación falló:', error);
      process.exit(1);
    });
}

module.exports = { verifyCouponSync };
