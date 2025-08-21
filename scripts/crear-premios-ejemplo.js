const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ekokai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Definir el esquema de Premio
const premioSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  imagen: String,
  puntosRequeridos: Number,
  stock: Number,
  categoria: String,
  activo: Boolean,
  destacado: Boolean,
  orden: Number
}, {
  timestamps: true
});

const Premio = mongoose.model('Premio', premioSchema);

// Datos de ejemplo para los premios
const premiosEjemplo = [
  {
    nombre: 'Auriculares Bluetooth',
    descripcion: 'Auriculares inalámbricos con cancelación de ruido y hasta 20 horas de batería',
    imagen: null,
    cuponesRequeridos: 500,
    stock: 25,
    categoria: 'Electrónicos',
    activo: true,
    destacado: true,
    orden: 1
  },
  {
    nombre: 'Botella de Agua Reutilizable',
    descripcion: 'Botella de acero inoxidable de 500ml, perfecta para mantener tu bebida fría',
    imagen: null,
    cuponesRequeridos: 100,
    stock: 50,
    categoria: 'Hogar',
    activo: true,
    destacado: false,
    orden: 2
  },
  {
    nombre: 'Pelota de Fútbol',
    descripcion: 'Pelota oficial de competición, tamaño 5, ideal para entrenamientos',
    imagen: null,
    cuponesRequeridos: 300,
    stock: 15,
    categoria: 'Deportes',
    activo: true,
    destacado: true,
    orden: 3
  },
  {
    nombre: 'Libro "Guía del Reciclaje"',
    descripcion: 'Manual completo sobre cómo reciclar correctamente y cuidar el medio ambiente',
    imagen: null,
    cuponesRequeridos: 150,
    stock: 30,
    categoria: 'Libros',
    activo: true,
    destacado: false,
    orden: 4
  },
  {
    nombre: 'Camiseta Ecológica',
    descripcion: 'Camiseta 100% algodón orgánico con diseño de la naturaleza',
    imagen: null,
    cuponesRequeridos: 200,
    stock: 40,
    categoria: 'Moda',
    activo: true,
    destacado: false,
    orden: 5
  },
  {
    nombre: 'Kit de Jardinería',
    descripcion: 'Set completo con macetas biodegradables, semillas y herramientas básicas',
    imagen: null,
    cuponesRequeridos: 250,
    stock: 20,
    categoria: 'Hogar',
    activo: true,
    destacado: true,
    orden: 6
  },
  {
    nombre: 'Power Bank Solar',
    descripcion: 'Batería externa de 10000mAh con panel solar integrado',
    imagen: null,
    cuponesRequeridos: 600,
    stock: 10,
    categoria: 'Electrónicos',
    activo: true,
    destacado: false,
    orden: 7
  },
  {
    nombre: 'Yoga Mat Ecológico',
    descripcion: 'Alfombrilla de yoga hecha con materiales reciclados y biodegradables',
    imagen: null,
    cuponesRequeridos: 180,
    stock: 35,
    categoria: 'Deportes',
    activo: true,
    destacado: false,
    orden: 8
  },
  {
    nombre: 'Set de Cubiertos de Bambú',
    descripcion: 'Cubiertos desechables biodegradables, pack de 50 unidades',
    imagen: null,
    cuponesRequeridos: 120,
    stock: 60,
    categoria: 'Hogar',
    activo: true,
    destacado: false,
    orden: 9
  },
  {
    nombre: 'Mochila Reciclada',
    descripcion: 'Mochila escolar fabricada con botellas de plástico recicladas',
    imagen: null,
    cuponesRequeridos: 400,
    stock: 18,
    categoria: 'Moda',
    activo: true,
    destacado: true,
    orden: 10
  }
];

async function crearPremiosEjemplo() {
  try {
    console.log('🚀 Iniciando creación de premios de ejemplo...');
    
    // Limpiar premios existentes (opcional)
    await Premio.deleteMany({});
    console.log('✅ Premios existentes eliminados');
    
    // Insertar premios de ejemplo
    const premiosCreados = await Premio.insertMany(premiosEjemplo);
    console.log(`✅ ${premiosCreados.length} premios creados exitosamente`);
    
    // Mostrar resumen
    console.log('\n📋 Resumen de premios creados:');
    premiosCreados.forEach(premio => {
      console.log(`   • ${premio.nombre} - ${premio.cuponesRequeridos} cupones (${premio.categoria})`);
    });
    
    console.log('\n🎉 ¡Premios de ejemplo creados exitosamente!');
    console.log('💡 Ahora puedes probar el catálogo en el frontend');
    
  } catch (error) {
    console.error('❌ Error al crear premios:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar el script
crearPremiosEjemplo();

