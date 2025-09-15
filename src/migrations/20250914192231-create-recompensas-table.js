'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('recompensas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cuponesRequeridos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      establecimiento: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fechaExpiracion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      stockDisponible: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      categoria: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      imagenUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      terminos: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fechaActualizacion: {
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
    await queryInterface.dropTable('recompensas');
  }
};