'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cupones', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tokensRequeridos: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fechaExpiracion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      codigo: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('descuento', 'producto', 'servicio'),
        allowNull: false
      },
      valorDescuento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      porcentajeDescuento: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      establecimiento: {
        type: Sequelize.STRING,
        allowNull: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fechaActualizacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      tipoResiduoGeneradorId: {
        type: Sequelize.UUID,
        allowNull: true
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
    await queryInterface.dropTable('cupones');
  }
};
