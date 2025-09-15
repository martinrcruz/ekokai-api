'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ecopuntos', [
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
        activo: true,
        fechaCreacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
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
        activo: true,
        fechaCreacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
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
        activo: true,
        fechaCreacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
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
        activo: true,
        fechaCreacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ecopuntos', {
      nombre: [
        'Ecopunto Centro',
        'Ecopunto Palermo',
        'Ecopunto Belgrano',
        'Ecopunto Recoleta'
      ]
    }, {});
  }
};
