#!/usr/bin/env node

/**
 * Script para sincronizar cupones existentes con el sistema CuponMoneda
 * 
 * Este script corrige la inconsistencia donde los cupones de reciclaje
 * fueron creados pero no se actualizó el saldo en CuponMoneda
 */

const { sequelize } = require('./src/config/sequelize');
const Cupon = require('./src/models/cupon.model');
const CuponMoneda = require('./src/models/cupon-moneda.model');
const Usuario = require('./src/models/usuario.model');
const CanjeReciclaje = require('./src/models/canjeReciclaje.model');

async function syncExistingCoupons() {
  try {
    console.log('🔄 Iniciando sincronización de cupones existentes...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Buscar todos los canjes de reciclaje completados que tienen cupón generado
    const canjesReciclaje = await CanjeReciclaje.findAll({
      where: {
        estado: 'completado',
        cuponGeneradoId: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    });
    
    console.log(`📊 Encontrados ${canjesReciclaje.length} canjes de reciclaje completados`);
    
    // Agrupar por usuario
    const cuponesPorUsuario = {};
    canjesReciclaje.forEach(canje => {
      const userId = canje.usuarioId;
      if (!cuponesPorUsuario[userId]) {
        cuponesPorUsuario[userId] = [];
      }
      cuponesPorUsuario[userId].push(canje);
    });
    
    console.log(`👥 Cupones distribuidos entre ${Object.keys(cuponesPorUsuario).length} usuarios`);
    
    // Procesar cada usuario
    let usuariosActualizados = 0;
    let cuponesSincronizados = 0;
    
    for (const [userId, cupones] of Object.entries(cuponesPorUsuario)) {
      try {
        // Buscar o crear CuponMoneda para este usuario
        let cuponMoneda = await CuponMoneda.findOne({
          where: { usuarioId: userId }
        });
        
        if (!cuponMoneda) {
          // Crear CuponMoneda si no existe
          cuponMoneda = await CuponMoneda.create({
            usuarioId: userId,
            cantidad: 0,
            activo: true
          });
          console.log(`🆕 CuponMoneda creado para usuario ${userId}`);
        }
        
        // Calcular cuántos cupones debería tener este usuario
        const cuponesActuales = cuponMoneda.cantidad;
        const cuponesReciclaje = cupones.length;
        const cuponesTotales = cuponesActuales + cuponesReciclaje;
        
        // Actualizar la cantidad
        await cuponMoneda.update({
          cantidad: cuponesTotales
        });
        
        usuariosActualizados++;
        cuponesSincronizados += cuponesReciclaje;
        
        console.log(`✅ Usuario ${userId}: ${cuponesActuales} → ${cuponesTotales} cupones (+${cuponesReciclaje})`);
        
      } catch (error) {
        console.error(`❌ Error procesando usuario ${userId}:`, error.message);
      }
    }
    
    console.log('\n📈 Resumen de sincronización:');
    console.log(`👥 Usuarios actualizados: ${usuariosActualizados}`);
    console.log(`🎟️ Cupones sincronizados: ${cuponesSincronizados}`);
    console.log('✅ Sincronización completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  syncExistingCoupons()
    .then(() => {
      console.log('🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script falló:', error);
      process.exit(1);
    });
}

module.exports = { syncExistingCoupons };
