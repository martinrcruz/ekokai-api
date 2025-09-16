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
  }
}, {
  tableName: 'ecopunto_metas',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['ecopuntoId', 'year', 'month']
    }
  ]
});

module.exports = EcopuntoMeta;


