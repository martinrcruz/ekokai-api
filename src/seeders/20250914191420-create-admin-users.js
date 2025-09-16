'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('usuarios', [
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
        requiereCambioPassword: false,
        createdAt: new Date(),
        updatedAt: new Date()
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
        requiereCambioPassword: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      email: ['admin@ekokai.com', 'superadmin@ekokai.com']
    }, {});
  }
};
