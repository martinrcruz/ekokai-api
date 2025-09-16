'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('premios', [
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
        orden: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
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
        orden: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
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
        orden: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
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
        orden: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
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
        orden: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('premios', {
      nombre: [
        'Descuento 10% en Supermercado',
        'Café Gratis',
        'Plantita Ecológica',
        'Libro Sostenible',
        'Bolsa Reutilizable'
      ]
    }, {});
  }
};
