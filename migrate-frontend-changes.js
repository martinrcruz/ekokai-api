const { sequelize } = require('./src/config/sequelize');
const { QueryTypes } = require('sequelize');

async function migrateFrontendChanges() {
  console.log('🚀 Iniciando migración de cambios del frontend...');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // 1. Eliminar columnas zona y capacidadMaxima de la tabla ecopuntos
    console.log('📝 Eliminando columnas zona y capacidadMaxima de ecopuntos...');
    
    try {
      await sequelize.query('ALTER TABLE ecopuntos DROP COLUMN IF EXISTS zona;', { type: QueryTypes.RAW });
      console.log('✅ Columna zona eliminada');
    } catch (error) {
      console.log('⚠️ Columna zona no existía o ya fue eliminada');
    }
    
    try {
      await sequelize.query('ALTER TABLE ecopuntos DROP COLUMN IF EXISTS capacidadMaxima;', { type: QueryTypes.RAW });
      console.log('✅ Columna capacidadMaxima eliminada');
    } catch (error) {
      console.log('⚠️ Columna capacidadMaxima no existía o ya fue eliminada');
    }

    // 2. Actualizar tabla premios
    console.log('📝 Actualizando tabla premios...');
    
    // Cambiar tipo de columna imagen a TEXT para soportar base64
    try {
      await sequelize.query('ALTER TABLE premios ALTER COLUMN imagen TYPE TEXT;', { type: QueryTypes.RAW });
      console.log('✅ Columna imagen actualizada a TEXT');
    } catch (error) {
      console.log('⚠️ Error actualizando columna imagen:', error.message);
    }
    
    // Eliminar columna orden
    try {
      await sequelize.query('ALTER TABLE premios DROP COLUMN IF EXISTS orden;', { type: QueryTypes.RAW });
      console.log('✅ Columna orden eliminada');
    } catch (error) {
      console.log('⚠️ Columna orden no existía o ya fue eliminada');
    }
    
    // Actualizar cuponesRequeridos para tener valor por defecto 1
    try {
      await sequelize.query('ALTER TABLE premios ALTER COLUMN "cuponesRequeridos" SET DEFAULT 1;', { type: QueryTypes.RAW });
      console.log('✅ Valor por defecto de cuponesRequeridos establecido en 1');
    } catch (error) {
      console.log('⚠️ Error estableciendo valor por defecto:', error.message);
    }
    
    // Actualizar registros existentes que tengan cuponesRequeridos = 0
    try {
      await sequelize.query('UPDATE premios SET "cuponesRequeridos" = 1 WHERE "cuponesRequeridos" = 0;', { type: QueryTypes.RAW });
      console.log('✅ Registros con cuponesRequeridos = 0 actualizados a 1');
    } catch (error) {
      console.log('⚠️ Error actualizando registros existentes:', error.message);
    }

    // 3. Eliminar índices relacionados con orden
    try {
      await sequelize.query('DROP INDEX IF EXISTS "premios_orden";', { type: QueryTypes.RAW });
      console.log('✅ Índice de orden eliminado');
    } catch (error) {
      console.log('⚠️ Índice de orden no existía o ya fue eliminado');
    }

    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateFrontendChanges()
    .then(() => {
      console.log('✅ Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = migrateFrontendChanges;
