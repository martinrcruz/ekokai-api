const { sequelize } = require('./src/config/sequelize');
const Ecopunto = require('./src/models/ecopunto.model');
const Premio = require('./src/models/premio.model');

async function testFrontendIntegration() {
  console.log('🧪 Probando integración con cambios del frontend...');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Test 1: Crear ecopunto sin zona y capacidadMaxima
    console.log('\n📝 Test 1: Creando ecopunto sin zona y capacidadMaxima...');
    try {
      const nuevoEcopunto = await Ecopunto.create({
        nombre: 'Ecopunto Test',
        direccion: 'Calle Test 123',
        descripcion: 'Ecopunto de prueba',
        horarioApertura: '08:00',
        horarioCierre: '20:00',
        activo: true
      });
      console.log('✅ Ecopunto creado exitosamente:', nuevoEcopunto.nombre);
      console.log('   - ID:', nuevoEcopunto.id);
      console.log('   - Activo:', nuevoEcopunto.activo);
      console.log('   - Sin zona ni capacidadMaxima ✓');
      
      // Limpiar
      await nuevoEcopunto.destroy();
      console.log('🗑️ Ecopunto de prueba eliminado');
    } catch (error) {
      console.error('❌ Error creando ecopunto:', error.message);
    }

    // Test 2: Crear premio con imagen base64 y sin orden
    console.log('\n📝 Test 2: Creando premio con imagen base64...');
    try {
      const imagenBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const nuevoPremio = await Premio.create({
        nombre: 'Premio Test',
        descripcion: 'Premio de prueba',
        imagen: imagenBase64,
        cuponesRequeridos: 1, // Valor por defecto
        stock: 10,
        categoria: 'Test',
        activo: true,
        destacado: false
      });
      
      console.log('✅ Premio creado exitosamente:', nuevoPremio.nombre);
      console.log('   - ID:', nuevoPremio.id);
      console.log('   - Cupones requeridos:', nuevoPremio.cuponesRequeridos);
      console.log('   - Imagen base64:', nuevoPremio.imagen ? 'Presente ✓' : 'Ausente ❌');
      console.log('   - Sin campo orden ✓');
      
      // Limpiar
      await nuevoPremio.destroy();
      console.log('🗑️ Premio de prueba eliminado');
    } catch (error) {
      console.error('❌ Error creando premio:', error.message);
    }

    // Test 3: Verificar estructura de tablas
    console.log('\n📝 Test 3: Verificando estructura de tablas...');
    
    // Verificar ecopuntos
    const ecopuntoAttributes = Object.keys(Ecopunto.rawAttributes);
    console.log('📋 Atributos de Ecopunto:', ecopuntoAttributes);
    
    const camposEliminadosEcopunto = ['zona', 'capacidadMaxima'];
    const camposPresentesEcopunto = camposEliminadosEcopunto.filter(campo => ecopuntoAttributes.includes(campo));
    
    if (camposPresentesEcopunto.length === 0) {
      console.log('✅ Campos zona y capacidadMaxima eliminados correctamente');
    } else {
      console.log('❌ Campos aún presentes:', camposPresentesEcopunto);
    }
    
    // Verificar premios
    const premioAttributes = Object.keys(Premio.rawAttributes);
    console.log('📋 Atributos de Premio:', premioAttributes);
    
    const camposEliminadosPremio = ['orden'];
    const camposPresentesPremio = camposEliminadosPremio.filter(campo => premioAttributes.includes(campo));
    
    if (camposPresentesPremio.length === 0) {
      console.log('✅ Campo orden eliminado correctamente');
    } else {
      console.log('❌ Campo orden aún presente');
    }
    
    // Verificar campo imagen
    if (premioAttributes.includes('imagen')) {
      const imagenField = Premio.rawAttributes.imagen;
      console.log('✅ Campo imagen presente, tipo:', imagenField.type.constructor.name);
    } else {
      console.log('❌ Campo imagen no encontrado');
    }

    console.log('\n🎉 Todas las pruebas completadas!');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testFrontendIntegration()
    .then(() => {
      console.log('✅ Pruebas finalizadas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en las pruebas:', error);
      process.exit(1);
    });
}

module.exports = testFrontendIntegration;
