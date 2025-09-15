'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar foreign key de usuarios a ecopuntos
    await queryInterface.addConstraint('usuarios', {
      fields: ['ecopuntoId'],
      type: 'foreign key',
      name: 'usuarios_ecopuntoId_fkey',
      references: {
        table: 'ecopuntos',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign key de ecopuntos a usuarios (encargado)
    await queryInterface.addConstraint('ecopuntos', {
      fields: ['encargadoId'],
      type: 'foreign key',
      name: 'ecopuntos_encargadoId_fkey',
      references: {
        table: 'usuarios',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Agregar foreign key de cupones a tiporesiduos
    await queryInterface.addConstraint('cupones', {
      fields: ['tipoResiduoGeneradorId'],
      type: 'foreign key',
      name: 'cupones_tipoResiduoGeneradorId_fkey',
      references: {
        table: 'tiporesiduos',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar foreign keys
    try {
      await queryInterface.removeConstraint('usuarios', 'usuarios_ecopuntoId_fkey');
    } catch (error) {
      // Ignorar si no existe
    }

    try {
      await queryInterface.removeConstraint('ecopuntos', 'ecopuntos_encargadoId_fkey');
    } catch (error) {
      // Ignorar si no existe
    }

    try {
      await queryInterface.removeConstraint('cupones', 'cupones_tipoResiduoGeneradorId_fkey');
    } catch (error) {
      // Ignorar si no existe
    }
  }
};
