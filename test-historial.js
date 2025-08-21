const mongoose = require('mongoose');
require('dotenv').config();

// Función para probar la conexión a la base de datos
async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI_DB1, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conexión a MongoDB exitosa');
    
    // Verificar que las colecciones existan
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Colecciones disponibles:', collections.map(c => c.name));
    
    // Verificar usuarios
    const Usuario = mongoose.model('Usuario', new mongoose.Schema({}), 'usuarios');
    const usuarios = await Usuario.find().limit(1);
    console.log('👥 Usuarios encontrados:', usuarios.length);
    
    // Verificar entregas
    const EntregaResiduo = mongoose.model('EntregaResiduo', new mongoose.Schema({}), 'entregas');
    const entregas = await EntregaResiduo.find().limit(1);
    console.log('📦 Entregas encontradas:', entregas.length);
    
    // Verificar canjes
    const Canje = mongoose.model('Canje', new mongoose.Schema({}), 'canjes');
    const canjes = await Canje.find().limit(1);
    console.log('🎁 Canjes encontrados:', canjes.length);
    
    await mongoose.disconnect();
    console.log('✅ Desconexión exitosa');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();

