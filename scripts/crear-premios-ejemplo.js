const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGO_URI_DB1 || 'mongodb://localhost:27017/ekokai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Importar el modelo correcto
const Premio = require('../src/models/premio.model');

// Datos de ejemplo para los premios - 20 premios de distintas categorías
const premiosEjemplo = [
  // ELECTRÓNICOS
  {
    nombre: 'Auriculares Bluetooth Premium',
    descripcion: 'Auriculares inalámbricos con cancelación de ruido activa, hasta 30 horas de batería y sonido envolvente',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 15,
    categoria: 'Electrónicos',
    activo: true,
    destacado: true,
    orden: 1
  },
  {
    nombre: 'Power Bank Solar 20000mAh',
    descripcion: 'Batería externa de alta capacidad con panel solar integrado, carga rápida y múltiples puertos USB',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 12,
    categoria: 'Electrónicos',
    activo: true,
    destacado: false,
    orden: 2
  },
  {
    nombre: 'Smartwatch Ecológico',
    descripcion: 'Reloj inteligente con monitor de actividad física, fabricado con materiales reciclados',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 8,
    categoria: 'Electrónicos',
    activo: true,
    destacado: true,
    orden: 3
  },

  // HOGAR
  {
    nombre: 'Kit de Jardinería Completo',
    descripcion: 'Set completo con macetas biodegradables, semillas orgánicas, herramientas y guía de cultivo',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 25,
    categoria: 'Hogar',
    activo: true,
    destacado: true,
    orden: 4
  },
  {
    nombre: 'Botellas de Agua Reutilizables (Pack x3)',
    descripcion: 'Pack de 3 botellas de acero inoxidable de diferentes tamaños, perfectas para toda la familia',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 30,
    categoria: 'Hogar',
    activo: true,
    destacado: false,
    orden: 5
  },
  {
    nombre: 'Set de Cubiertos de Bambú (Pack x100)',
    descripcion: 'Cubiertos desechables 100% biodegradables, ideales para eventos y picnics',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 50,
    categoria: 'Hogar',
    activo: true,
    destacado: false,
    orden: 6
  },

  // DEPORTES
  {
    nombre: 'Pelota de Fútbol Profesional',
    descripcion: 'Pelota oficial de competición, tamaño 5, con tecnología de última generación',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 20,
    categoria: 'Deportes',
    activo: true,
    destacado: true,
    orden: 7
  },
  {
    nombre: 'Yoga Mat Ecológico Premium',
    descripcion: 'Alfombrilla de yoga extra gruesa hecha con materiales reciclados y biodegradables',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 35,
    categoria: 'Deportes',
    activo: true,
    destacado: false,
    orden: 8
  },
  {
    nombre: 'Set de Pesas Recicladas',
    descripcion: 'Pesas de 2kg y 5kg fabricadas con materiales reciclados, ideales para entrenamiento en casa',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 18,
    categoria: 'Deportes',
    activo: true,
    destacado: false,
    orden: 9
  },

  // MODA
  {
    nombre: 'Camiseta Ecológica Premium',
    descripcion: 'Camiseta 100% algodón orgánico con diseño exclusivo de la naturaleza, talles S a XXL',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 40,
    categoria: 'Moda',
    activo: true,
    destacado: true,
    orden: 10
  },
  {
    nombre: 'Mochila Escolar Reciclada',
    descripcion: 'Mochila escolar fabricada con botellas de plástico recicladas, múltiples compartimentos',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 22,
    categoria: 'Moda',
    activo: true,
    destacado: false,
    orden: 11
  },
  {
    nombre: 'Gorras de Sol Ecológicas (Pack x2)',
    descripcion: 'Pack de 2 gorras fabricadas con materiales reciclados, protección UV y diseño moderno',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 28,
    categoria: 'Moda',
    activo: true,
    destacado: false,
    orden: 12
  },

  // LIBROS
  {
    nombre: 'Libro "Guía Completa del Reciclaje"',
    descripcion: 'Manual exhaustivo sobre cómo reciclar correctamente, cuidar el medio ambiente y vivir de forma sostenible',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 45,
    categoria: 'Libros',
    activo: true,
    destacado: true,
    orden: 13
  },
  {
    nombre: 'Colección "Cuentos Ecológicos" (Pack x3)',
    descripcion: 'Pack de 3 libros infantiles sobre ecología y cuidado del medio ambiente, perfectos para niños',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 30,
    categoria: 'Libros',
    activo: true,
    destacado: false,
    orden: 14
  },

  // ALIMENTACIÓN
  {
    nombre: 'Kit de Cultivo de Hierbas Aromáticas',
    descripcion: 'Set completo para cultivar albahaca, romero y menta en casa, con macetas y semillas orgánicas',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 25,
    categoria: 'Alimentación',
    activo: true,
    destacado: false,
    orden: 15
  },
  {
    nombre: 'Pack de Tés Orgánicos (Variedad x6)',
    descripcion: 'Selección de 6 tés orgánicos diferentes, empaquetados de forma sostenible',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 35,
    categoria: 'Alimentación',
    activo: true,
    destacado: false,
    orden: 16
  },

  // BELLEZA
  {
    nombre: 'Kit de Cuidado Facial Natural',
    descripcion: 'Set completo con jabón facial, crema hidratante y exfoliante, todos con ingredientes naturales',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 20,
    categoria: 'Belleza',
    activo: true,
    destacado: true,
    orden: 17
  },

  // JUGUETES
  {
    nombre: 'Set de Construcción Ecológico',
    descripcion: 'Bloques de construcción fabricados con materiales reciclados, perfectos para desarrollar la creatividad',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 18,
    categoria: 'Juguetes',
    activo: true,
    destacado: false,
    orden: 18
  },

  // MÚSICA
  {
    nombre: 'Instrumento Musical Reciclado',
    descripcion: 'Instrumento musical fabricado con materiales reciclados, ideal para iniciarse en la música',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 12,
    categoria: 'Música',
    activo: true,
    destacado: false,
    orden: 19
  },

  // ARTE
  {
    nombre: 'Kit de Arte Ecológico',
    descripcion: 'Set completo con pinturas naturales, pinceles de bambú y lienzos de algodón orgánico',
    imagen: null,
    cuponesRequeridos: 1,
    stock: 15,
    categoria: 'Arte',
    activo: true,
    destacado: false,
    orden: 20
  }
];

async function crearPremiosEjemplo() {
  try {
    console.log('🚀 Iniciando creación de premios de ejemplo...');
    
    // Verificar conexión
    console.log('📡 Conectando a la base de datos...');
    await mongoose.connection.asPromise();
    console.log('✅ Conexión establecida');
    
    // Limpiar premios existentes (opcional)
    const premiosExistentes = await Premio.countDocuments();
    if (premiosExistentes > 0) {
      console.log(`🗑️  Eliminando ${premiosExistentes} premios existentes...`);
      await Premio.deleteMany({});
      console.log('✅ Premios existentes eliminados');
    }
    
    // Insertar premios de ejemplo
    console.log('📦 Insertando 20 premios de ejemplo...');
    const premiosCreados = await Premio.insertMany(premiosEjemplo);
    console.log(`✅ ${premiosCreados.length} premios creados exitosamente`);
    
    // Mostrar resumen por categoría
    console.log('\n📋 Resumen de premios creados por categoría:');
    const resumenCategorias = {};
    premiosCreados.forEach(premio => {
      if (!resumenCategorias[premio.categoria]) {
        resumenCategorias[premio.categoria] = 0;
      }
      resumenCategorias[premio.categoria]++;
    });
    
    Object.entries(resumenCategorias).forEach(([categoria, cantidad]) => {
      console.log(`   • ${categoria}: ${cantidad} premios`);
    });
    
    console.log('\n🎯 Premios destacados:');
    premiosCreados.filter(p => p.destacado).forEach(premio => {
      console.log(`   ⭐ ${premio.nombre} (${premio.categoria})`);
    });
    
    console.log('\n🎉 ¡Premios de ejemplo creados exitosamente!');
    console.log('💡 Ahora puedes probar el catálogo en el frontend');
    console.log('🔗 URL del catálogo: /catalogo-premios');
    
  } catch (error) {
    console.error('❌ Error al crear premios:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar el script
crearPremiosEjemplo();

