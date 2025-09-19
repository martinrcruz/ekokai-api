'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Verificar y eliminar la restricción de clave foránea existente si existe
    try {
      await queryInterface.removeConstraint('canjes_recompensa', 'canjes_recompensa_recompensaId_fkey');
    } catch (error) {
      console.log('Restricción no encontrada o ya eliminada:', error.message);
    }
    
    // 2. Cambiar el tipo de dato del campo recompensaId de INTEGER a UUID usando conversión explícita
    await queryInterface.sequelize.query(`
      ALTER TABLE "canjes_recompensa" 
      ALTER COLUMN "recompensaId" TYPE UUID USING "recompensaId"::text::uuid
    `);
    
    // 3. Agregar la nueva restricción de clave foránea
    await queryInterface.addConstraint('canjes_recompensa', {
      fields: ['recompensaId'],
      type: 'foreign key',
      name: 'canjes_recompensa_recompensaId_fkey',
      references: {
        table: 'premios',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // 1. Eliminar la restricción de clave foránea
    await queryInterface.removeConstraint('canjes_recompensa', 'canjes_recompensa_recompensaId_fkey');
    
    // 2. Revertir el cambio: cambiar de UUID a INTEGER
    await queryInterface.changeColumn('canjes_recompensa', 'recompensaId', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    
    // 3. Agregar la restricción de clave foránea original
    await queryInterface.addConstraint('canjes_recompensa', {
      fields: ['recompensaId'],
      type: 'foreign key',
      name: 'canjes_recompensa_recompensaId_fkey',
      references: {
        table: 'recompensas',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
