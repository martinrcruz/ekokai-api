require('dotenv').config();
const { sequelize, QRWhatsapp } = require('../src/models');

async function createQRWhatsappTable() {
  try {
    console.log('🔄 Iniciando creación de tabla QR WhatsApp...');
    
    // Sincronizar el modelo con la base de datos
    await QRWhatsapp.sync({ force: false });
    console.log('✅ Tabla qr_whatsapp creada/verificada exitosamente');
    
    // Verificar que la tabla existe
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'qr_whatsapp' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura de la tabla qr_whatsapp:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    console.log('🎉 Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando tabla QR WhatsApp:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  createQRWhatsappTable();
}

module.exports = createQRWhatsappTable;
