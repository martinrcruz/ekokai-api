'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Eliminar columnas duplicadas de timestamps
    
    // Tabla usuarios - eliminar fechaCreacion y ultimaModificacion
    try {
      await queryInterface.removeColumn('usuarios', 'fechaCreacion');
    } catch (error) {
      console.log('Column fechaCreacion does not exist in usuarios table');
    }
    
    try {
      await queryInterface.removeColumn('usuarios', 'ultimaModificacion');
    } catch (error) {
      console.log('Column ultimaModificacion does not exist in usuarios table');
    }

    // Tabla ecopuntos - eliminar fechaCreacion
    try {
      await queryInterface.removeColumn('ecopuntos', 'fechaCreacion');
    } catch (error) {
      console.log('Column fechaCreacion does not exist in ecopuntos table');
    }

    // Tabla cupones - eliminar fechaCreacion y fechaActualizacion
    try {
      await queryInterface.removeColumn('cupones', 'fechaCreacion');
    } catch (error) {
      console.log('Column fechaCreacion does not exist in cupones table');
    }
    
    try {
      await queryInterface.removeColumn('cupones', 'fechaActualizacion');
    } catch (error) {
      console.log('Column fechaActualizacion does not exist in cupones table');
    }

    // Tabla recompensas - eliminar fechaCreacion y fechaActualizacion
    try {
      await queryInterface.removeColumn('recompensas', 'fechaCreacion');
    } catch (error) {
      console.log('Column fechaCreacion does not exist in recompensas table');
    }
    
    try {
      await queryInterface.removeColumn('recompensas', 'fechaActualizacion');
    } catch (error) {
      console.log('Column fechaActualizacion does not exist in recompensas table');
    }

    // Tabla canjes_recompensa - eliminar fechaCreacion y fechaActualizacion
    try {
      await queryInterface.removeColumn('canjes_recompensa', 'fechaCreacion');
    } catch (error) {
      console.log('Column fechaCreacion does not exist in canjes_recompensa table');
    }
    
    try {
      await queryInterface.removeColumn('canjes_recompensa', 'fechaActualizacion');
    } catch (error) {
      console.log('Column fechaActualizacion does not exist in canjes_recompensa table');
    }

    // Tabla premios - eliminar createdDate y updatedDate
    try {
      await queryInterface.removeColumn('premios', 'createdDate');
    } catch (error) {
      console.log('Column createdDate does not exist in premios table');
    }
    
    try {
      await queryInterface.removeColumn('premios', 'updatedDate');
    } catch (error) {
      console.log('Column updatedDate does not exist in premios table');
    }

    // Tabla cupon_monedas - eliminar fechaUltimaActualizacion
    try {
      await queryInterface.removeColumn('cupon_monedas', 'fechaUltimaActualizacion');
    } catch (error) {
      console.log('Column fechaUltimaActualizacion does not exist in cupon_monedas table');
    }

    // Tabla qr_reciclajes - eliminar fechaCreacion y agregar createdAt/updatedAt
    try {
      await queryInterface.removeColumn('qr_reciclajes', 'fechaCreacion');
    } catch (error) {
      console.log('Column fechaCreacion does not exist in qr_reciclajes table');
    }
    
    // Agregar createdAt y updatedAt a qr_reciclajes si no existen
    try {
      await queryInterface.addColumn('qr_reciclajes', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });
    } catch (error) {
      console.log('Column createdAt already exists in qr_reciclajes table');
    }
    
    try {
      await queryInterface.addColumn('qr_reciclajes', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });
    } catch (error) {
      console.log('Column updatedAt already exists in qr_reciclajes table');
    }
  },

  async down (queryInterface, Sequelize) {
    // Revertir cambios - agregar de vuelta las columnas eliminadas
    
    // Tabla usuarios
    await queryInterface.addColumn('usuarios', 'fechaCreacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.addColumn('usuarios', 'ultimaModificacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    // Tabla ecopuntos
    await queryInterface.addColumn('ecopuntos', 'fechaCreacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    // Tabla cupones
    await queryInterface.addColumn('cupones', 'fechaCreacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.addColumn('cupones', 'fechaActualizacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    // Tabla recompensas
    await queryInterface.addColumn('recompensas', 'fechaCreacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.addColumn('recompensas', 'fechaActualizacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    // Tabla canjes_recompensa
    await queryInterface.addColumn('canjes_recompensa', 'fechaCreacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.addColumn('canjes_recompensa', 'fechaActualizacion', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    // Tabla premios
    await queryInterface.addColumn('premios', 'createdDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.addColumn('premios', 'updatedDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });

    // Tabla cupon_monedas
    await queryInterface.addColumn('cupon_monedas', 'fechaUltimaActualizacion', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });

    // Tabla qr_reciclajes
    await queryInterface.addColumn('qr_reciclajes', 'fechaCreacion', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.removeColumn('qr_reciclajes', 'createdAt');
    await queryInterface.removeColumn('qr_reciclajes', 'updatedAt');
  }
};
