const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Canje = sequelize.define('Canje', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cuponId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'cupones',
      key: 'id'
    }
  },
  usuarioId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  comercioId: { 
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tokensGastados: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  fechaCanje: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  estado: { 
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'completado'), 
    defaultValue: 'pendiente' 
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aprobadoPorId: { 
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fechaAprobacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'canjes',
  timestamps: false,
  indexes: [
    {
      fields: ['cuponId', 'fechaCanje']
    },
    {
      fields: ['usuarioId', 'fechaCanje']
    },
    {
      fields: ['comercioId', 'fechaCanje']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = Canje;