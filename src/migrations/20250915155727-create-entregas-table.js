'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('entregas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      usuarioId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      ecopuntoId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ecopuntos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipoResiduoId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tiporesiduos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      pesoKg: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      cuponesGenerados: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cuponGeneradoId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'cupones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      descripcion: {
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      encargadoId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      estado: {
        type: Sequelize.ENUM('completado', 'pendiente', 'rechazado'),
        defaultValue: 'completado'
      },
      observaciones: {
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('entregas', ['usuarioId']);
    await queryInterface.addIndex('entregas', ['ecopuntoId']);
    await queryInterface.addIndex('entregas', ['fecha']);
    await queryInterface.addIndex('entregas', ['tipoResiduoId']);
    await queryInterface.addIndex('entregas', ['estado']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('entregas');
  }
};
