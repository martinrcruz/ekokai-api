/**
 * Script para crear todas las tablas de la base de datos sin usar migraciones
 * Este script reemplaza todas las migraciones y crea las tablas directamente usando Sequelize sync
 */

require('dotenv').config();
const { sequelize } = require('../src/config/sequelize');

// Importar todos los modelos para asegurar que estén registrados
require('../src/models');

async function createTables() {
  try {
    console.log('🚀 Iniciando creación de tablas...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Crear todas las tablas sin forzar recreación
    console.log('📋 Creando tablas...');
    await sequelize.sync();
    console.log('✅ Todas las tablas han sido creadas correctamente.');
    
    console.log('✅ Proceso completado exitosamente.');
    
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('✅ Script de creación de tablas ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script de creación de tablas:', error);
      process.exit(1);
    });
}

module.exports = createTables;