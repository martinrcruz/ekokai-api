'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      rol: {
        type: Sequelize.ENUM('vecino', 'encargado', 'administrador'),
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dni: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fechaNacimiento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true
      },
      pais: {
        type: Sequelize.STRING,
        allowNull: true
      },
      zona: {
        type: Sequelize.STRING,
        allowNull: true
      },
      direccion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tokensAcumulados: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      ecopuntoId: {
        type: Sequelize.UUID,
        allowNull: true
      },
      requiereCambioPassword: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ultimaModificacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};