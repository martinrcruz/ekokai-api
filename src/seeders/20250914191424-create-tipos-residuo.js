'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tiporesiduos', [
      {
        id: '00000000-0000-0000-0000-000000000101',
        nombre: 'Papel',
        descripcion: 'Papel blanco, periódicos, revistas, cartón',
        categoria: 'reciclable',
        unidad: 'kilos',
        tokensPorKg: 5,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000102',
        nombre: 'Plástico',
        descripcion: 'Botellas de plástico, envases, bolsas',
        categoria: 'reciclable',
        unidad: 'kilos',
        tokensPorKg: 8,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000103',
        nombre: 'Vidrio',
        descripcion: 'Botellas de vidrio, frascos, vasos',
        categoria: 'reciclable',
        unidad: 'kilos',
        tokensPorKg: 6,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000104',
        nombre: 'Metal',
        descripcion: 'Latas de aluminio, envases de metal',
        categoria: 'reciclable',
        unidad: 'kilos',
        tokensPorKg: 10,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000105',
        nombre: 'Orgánico',
        descripcion: 'Restos de comida, cáscaras, residuos orgánicos',
        categoria: 'compostable',
        unidad: 'kilos',
        tokensPorKg: 3,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000106',
        nombre: 'Electrónicos',
        descripcion: 'Dispositivos electrónicos, baterías, cables',
        categoria: 'especial',
        unidad: 'kilos',
        tokensPorKg: 15,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tiporesiduos', {
      nombre: ['Papel', 'Plástico', 'Vidrio', 'Metal', 'Orgánico', 'Electrónicos']
    }, {});
  }
};
