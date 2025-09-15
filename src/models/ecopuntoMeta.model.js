const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const EcopuntoMeta = sequelize.define('EcopuntoMeta', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ecopuntoId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'ecopuntos',
      key: 'id'
    }
  },
  year: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  month: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  objetivoKg: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  creadoEn: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  actualizadoEn: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: 'ecopunto_metas',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['ecopuntoId', 'year', 'month']
    }
  ],
  hooks: {
    beforeUpdate: (meta) => {
      meta.actualizadoEn = new Date();
    }
  }
});

module.exports = EcopuntoMeta;


