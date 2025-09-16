require('dotenv').config();
const { sequelize } = require('./config/sequelize');

const startServer = async () => {
  try {
    // Conectar a PostgreSQL
    console.log('🔄 Conectando a PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');
    
    // Importar todos los modelos ANTES de cargar app.js
    console.log('📚 Importando modelos de Sequelize...');
    require('./models');
    console.log('✅ Modelos importados correctamente');
    
    const app = require('./app');
    const PORT = process.env.PORT || 8080;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌐 Accesible desde: http://192.168.4.156:${PORT}`);
      console.log(`📱 QR URL: http://192.168.4.156:${PORT}/registro`);
    });
  } catch (err) {
    console.error('❌ Error al conectar con PostgreSQL:', err.message);
  }
};

startServer();