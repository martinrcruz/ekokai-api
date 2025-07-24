require('dotenv').config();
const { connectDB1 } = require('./config/database'); // conectamos de forma asíncrona

const startServer = async () => {
  try {
    await connectDB1(); // esperamos conexión
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