const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: console.log
});

(async () => {
  try {
    console.log('🔧 Aplicando cambios de timestamps...');
    
    // Eliminar columnas duplicadas si existen
    const tables = [
      { table: 'usuarios', columns: ['fechaCreacion', 'ultimaModificacion'] },
      { table: 'ecopuntos', columns: ['fechaCreacion'] },
      { table: 'cupones', columns: ['fechaCreacion', 'fechaActualizacion'] },
      { table: 'recompensas', columns: ['fechaCreacion', 'fechaActualizacion'] },
      { table: 'canjes_recompensa', columns: ['fechaCreacion', 'fechaActualizacion'] },
      { table: 'premios', columns: ['createdDate', 'updatedDate'] },
      { table: 'cupon_monedas', columns: ['fechaUltimaActualizacion'] },
      { table: 'qr_reciclajes', columns: ['fechaCreacion'] }
    ];
    
    for (const tableInfo of tables) {
      for (const column of tableInfo.columns) {
        try {
          await sequelize.query(`ALTER TABLE "${tableInfo.table}" DROP COLUMN IF EXISTS "${column}" CASCADE`);
          console.log(`✅ Eliminada columna ${column} de ${tableInfo.table}`);
        } catch (error) {
          console.log(`⚠️  Columna ${column} no existe en ${tableInfo.table} o ya fue eliminada`);
        }
      }
    }
    
    // Agregar createdAt y updatedAt a qr_reciclajes si no existen
    try {
      await sequelize.query(`ALTER TABLE "qr_reciclajes" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()`);
      await sequelize.query(`ALTER TABLE "qr_reciclajes" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()`);
      console.log('✅ Agregadas columnas createdAt/updatedAt a qr_reciclajes');
    } catch (error) {
      console.log('⚠️  Columnas createdAt/updatedAt ya existen en qr_reciclajes');
    }
    
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
