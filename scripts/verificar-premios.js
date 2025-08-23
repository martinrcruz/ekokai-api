const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGO_URI_DB1 || 'mongodb://localhost:27017/ekokai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Importar el modelo
const Premio = require('../src/models/premio.model');

async function verificarPremios() {
  try {
    console.log('🔍 Verificando premios en la base de datos...');
    
    // Verificar conexión
    await mongoose.connection.asPromise();
    console.log('✅ Conexión establecida');
    
    // Contar total de premios
    const totalPremios = await Premio.countDocuments();
    console.log(`📊 Total de premios en la base de datos: ${totalPremios}`);
    
    if (totalPremios === 0) {
      console.log('❌ No hay premios en la base de datos');
      return;
    }
    
    // Obtener premios activos
    const premiosActivos = await Premio.countDocuments({ activo: true });
    console.log(`✅ Premios activos: ${premiosActivos}`);
    
    // Obtener premios destacados
    const premiosDestacados = await Premio.countDocuments({ destacado: true });
    console.log(`⭐ Premios destacados: ${premiosDestacados}`);
    
    // Resumen por categoría
    console.log('\n📋 Resumen por categoría:');
    const categorias = await Premio.aggregate([
      { $group: { _id: '$categoria', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    categorias.forEach(cat => {
      console.log(`   • ${cat._id}: ${cat.count} premios`);
    });
    
    // Mostrar algunos premios de ejemplo
    console.log('\n🎁 Ejemplos de premios:');
    const premiosEjemplo = await Premio.find({ activo: true })
      .select('nombre categoria stock destacado')
      .limit(10)
      .sort({ orden: 1 });
    
    premiosEjemplo.forEach(premio => {
      const destacado = premio.destacado ? '⭐' : '  ';
      console.log(`   ${destacado} ${premio.nombre} (${premio.categoria}) - Stock: ${premio.stock}`);
    });
    
    // Verificar que todos los premios tengan 1 cupón requerido
    const premiosConCuponCorrecto = await Premio.countDocuments({ cuponesRequeridos: 1 });
    console.log(`\n🎫 Premios con 1 cupón requerido: ${premiosConCuponCorrecto}/${totalPremios}`);
    
    if (premiosConCuponCorrecto === totalPremios) {
      console.log('✅ Todos los premios tienen el cupón requerido correcto');
    } else {
      console.log('⚠️  Algunos premios no tienen 1 cupón requerido');
    }
    
    // Verificar stock
    const premiosSinStock = await Premio.countDocuments({ stock: 0 });
    const premiosConStock = await Premio.countDocuments({ stock: { $gt: 0 } });
    
    console.log(`📦 Premios con stock disponible: ${premiosConStock}`);
    console.log(`🚫 Premios sin stock: ${premiosSinStock}`);
    
    console.log('\n🎉 Verificación completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al verificar premios:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar el script
verificarPremios();
