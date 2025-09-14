require('dotenv').config();
const { connectDB1 } = require('./config/database'); // conectamos de forma asíncrona
const { testSequelizeConnection, syncSequelizeModels } = require('./config/sequelize');

const startServer = async () => {
  try {
    await connectDB1(); // esperamos conexión
    
    // Conectar y sincronizar Sequelize
    await testSequelizeConnection();
    await syncSequelizeModels();
    
    // Importar todos los modelos ANTES de cargar app.js
    console.log('📚 Importando modelos de Mongoose...');
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
    console.error('❌ Error al conectar con MongoDB DB1:', err.message);
  }
};

startServer();