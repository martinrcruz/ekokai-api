/**
 * Script de configuración completa de la base de datos
 * Crea tablas y carga datos iniciales en un solo comando
 */

require('dotenv').config();
const createTables = require('./create-tables.js');
const loadInitialData = require('./load-initial-data.js');

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuración completa de la base de datos...');
    
    console.log('📋 Paso 1: Creando tablas...');
    await createTables();
    console.log('✅ Paso 1 completado: Tablas creadas correctamente.');
    
    console.log('📊 Paso 2: Cargando datos iniciales...');
    await loadInitialData();
    console.log('✅ Paso 2 completado: Datos iniciales cargados correctamente.');
    
    console.log('✅ Configuración de base de datos completada exitosamente.');
    console.log('');
    console.log('🔐 Usuarios administradores creados:');
    console.log('   • Email: admin@ekokai.com - Password: admin123');
    console.log('   • Email: superadmin@ekokai.com - Password: admin123');
    console.log('');
    console.log('🏢 Ecopuntos creados: Centro, Palermo, Belgrano, Recoleta');
    console.log('♻️  Tipos de residuo: Papel, Plástico, Vidrio, Metal, Orgánico, Electrónicos');
    console.log('🏆 Premios iniciales: 5 premios disponibles');
    console.log('');
    console.log('🎉 ¡La base de datos está lista para usar!');
    
  } catch (error) {
    console.error('❌ Error en la configuración de la base de datos:', error);
    throw error;
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Script de configuración de base de datos ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script de configuración de base de datos:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;