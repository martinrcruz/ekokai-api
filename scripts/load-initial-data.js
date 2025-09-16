/**
 * Script para cargar datos iniciales en la base de datos
 * Este script reemplaza los seeders de Sequelize y carga la información inicial necesaria
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('../src/config/sequelize');

// Importar todos los modelos
const {
  Usuario,
  Ecopunto,
  TipoResiduo,
  Premio
} = require('../src/models');

async function loadInitialData() {
  try {
    console.log('🚀 Iniciando carga de datos iniciales...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    console.log('📊 Cargando tipos de residuo...');
    await loadTiposResiduo();
    console.log('✅ Tipos de residuo cargados correctamente.');

    console.log('👥 Cargando usuarios administradores...');
    await loadAdminUsers();
    console.log('✅ Usuarios administradores cargados correctamente.');

    console.log('🏢 Cargando ecopuntos iniciales...');
    await loadEcopuntos();
    console.log('✅ Ecopuntos iniciales cargados correctamente.');

    console.log('🏆 Cargando premios iniciales...');
    await loadPremios();
    console.log('✅ Premios iniciales cargados correctamente.');

    console.log('✅ Carga de datos iniciales completada exitosamente.');
    
  } catch (error) {
    console.error('❌ Error cargando datos iniciales:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function loadTiposResiduo() {
  const tiposResiduo = [
    {
      id: '00000000-0000-0000-0000-000000000101',
      nombre: 'Papel',
      descripcion: 'Papel blanco, periódicos, revistas, cartón',
      categoria: 'reciclable',
      unidad: 'kilos',
      tokensPorKg: 5,
      activo: true
    },
    {
      id: '00000000-0000-0000-0000-000000000102',
      nombre: 'Plástico',
      descripcion: 'Botellas de plástico, envases, bolsas',
      categoria: 'reciclable',
      unidad: 'kilos',
      tokensPorKg: 8,
      activo: true
    },
    {
      id: '00000000-0000-0000-0000-000000000103',
      nombre: 'Vidrio',
      descripcion: 'Botellas de vidrio, frascos, vasos',
      categoria: 'reciclable',
      unidad: 'kilos',
      tokensPorKg: 6,
      activo: true
    },
    {
      id: '00000000-0000-0000-0000-000000000104',
      nombre: 'Metal',
      descripcion: 'Latas de aluminio, envases de metal',
      categoria: 'reciclable',
      unidad: 'kilos',
      tokensPorKg: 10,
      activo: true
    },
    {
      id: '00000000-0000-0000-0000-000000000105',
      nombre: 'Orgánico',
      descripcion: 'Restos de comida, cáscaras, residuos orgánicos',
      categoria: 'compostable',
      unidad: 'kilos',
      tokensPorKg: 3,
      activo: true
    },
    {
      id: '00000000-0000-0000-0000-000000000106',
      nombre: 'Electrónicos',
      descripcion: 'Dispositivos electrónicos, baterías, cables',
      categoria: 'especial',
      unidad: 'kilos',
      tokensPorKg: 15,
      activo: true
    }
  ];

  for (const tipoResiduo of tiposResiduo) {
    await TipoResiduo.findOrCreate({
      where: { id: tipoResiduo.id },
      defaults: tipoResiduo
    });
  }
}

async function loadAdminUsers() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUsers = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      rol: 'administrador',
      nombre: 'Admin',
      apellido: 'Ekokai',
      email: 'admin@ekokai.com',
      password: hashedPassword,
      telefono: '+5491123456789',
      pais: 'Argentina',
      zona: 'CABA',
      direccion: 'Av. Corrientes 1234',
      tokensAcumulados: 0,
      activo: true,
      requiereCambioPassword: false
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      rol: 'administrador',
      nombre: 'Super',
      apellido: 'Admin',
      email: 'superadmin@ekokai.com',
      password: hashedPassword,
      telefono: '+5491123456790',
      pais: 'Argentina',
      zona: 'CABA',
      direccion: 'Av. Santa Fe 5678',
      tokensAcumulados: 0,
      activo: true,
      requiereCambioPassword: false
    }
  ];

  for (const adminUser of adminUsers) {
    await Usuario.findOrCreate({
      where: { id: adminUser.id },
      defaults: adminUser
    });
  }
}

async function loadEcopuntos() {
  const ecopuntos = [
    {
      id: '00000000-0000-0000-0000-000000000301',
      nombre: 'Ecopunto Centro',
      direccion: 'Av. Corrientes 1234, CABA',
      zona: 'Centro',
      descripcion: 'Punto de reciclaje principal en el centro de la ciudad',
      horarioApertura: '08:00',
      horarioCierre: '20:00',
      capacidadMaxima: 1000,
      encargadoId: '00000000-0000-0000-0000-000000000001',
      activo: true
    },
    {
      id: '00000000-0000-0000-0000-000000000302',
      nombre: 'Ecopunto Palermo',
      direccion: 'Av. Santa Fe 5678, CABA',
      zona: 'Palermo',
      descripcion: 'Punto de reciclaje en el barrio de Palermo',
      horarioApertura: '09:00',
      horarioCierre: '19:00',
      capacidadMaxima: 800,
      encargadoId: '00000000-0000-0000-0000-000000000002',
      activo: true
    },
    {
      id: '00000000-0000-0000-0000-000000000303',
      nombre: 'Ecopunto Belgrano',
      direccion: 'Av. Cabildo 9012, CABA',
      zona: 'Belgrano',
      descripcion: 'Punto de reciclaje en el barrio de Belgrano',
      horarioApertura: '08:30',
      horarioCierre: '20:30',
      capacidadMaxima: 1200,
      encargadoId: null,
      activo: true
    },
    {
      id: '00000000-0000-0000-0000-000000000304',
      nombre: 'Ecopunto Recoleta',
      direccion: 'Av. Callao 3456, CABA',
      zona: 'Recoleta',
      descripcion: 'Punto de reciclaje en el barrio de Recoleta',
      horarioApertura: '10:00',
      horarioCierre: '18:00',
      capacidadMaxima: 600,
      encargadoId: null,
      activo: true
    }
  ];

  for (const ecopunto of ecopuntos) {
    await Ecopunto.findOrCreate({
      where: { id: ecopunto.id },
      defaults: ecopunto
    });
  }
}

async function loadPremios() {
  const premios = [
    {
      id: '00000000-0000-0000-0000-000000000201',
      nombre: 'Descuento 10% en Supermercado',
      descripcion: 'Descuento del 10% en tu próxima compra en supermercados participantes',
      imagen: 'descuento-supermercado.svg',
      cuponesRequeridos: 5,
      stock: 100,
      categoria: 'descuentos',
      activo: true,
      destacado: true,
      orden: 1
    },
    {
      id: '00000000-0000-0000-0000-000000000202',
      nombre: 'Café Gratis',
      descripcion: 'Una taza de café gratis en cafeterías participantes',
      imagen: 'cafe.svg',
      cuponesRequeridos: 3,
      stock: 50,
      categoria: 'bebidas',
      activo: true,
      destacado: false,
      orden: 2
    },
    {
      id: '00000000-0000-0000-0000-000000000203',
      nombre: 'Plantita Ecológica',
      descripcion: 'Una pequeña planta para tu hogar',
      imagen: 'planta.svg',
      cuponesRequeridos: 8,
      stock: 25,
      categoria: 'hogar',
      activo: true,
      destacado: true,
      orden: 3
    },
    {
      id: '00000000-0000-0000-0000-000000000204',
      nombre: 'Libro Sostenible',
      descripcion: 'Un libro sobre sostenibilidad y cuidado del medio ambiente',
      imagen: 'libro.svg',
      cuponesRequeridos: 12,
      stock: 15,
      categoria: 'educacion',
      activo: true,
      destacado: false,
      orden: 4
    },
    {
      id: '00000000-0000-0000-0000-000000000205',
      nombre: 'Bolsa Reutilizable',
      descripcion: 'Bolsa de tela reutilizable para tus compras',
      imagen: 'mochila.svg',
      cuponesRequeridos: 4,
      stock: 75,
      categoria: 'accesorios',
      activo: true,
      destacado: false,
      orden: 5
    }
  ];

  for (const premio of premios) {
    await Premio.findOrCreate({
      where: { id: premio.id },
      defaults: premio
    });
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  loadInitialData()
    .then(() => {
      console.log('✅ Script de carga de datos iniciales ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script de carga de datos iniciales:', error);
      process.exit(1);
    });
}

module.exports = loadInitialData;