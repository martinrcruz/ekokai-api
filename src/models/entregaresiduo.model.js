const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const EntregaResiduo = sequelize.define('EntregaResiduo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuarioId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  ecopuntoId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'ecopuntos',
      key: 'id'
    }
  },
  tipoResiduoId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: {
      model: 'tiporesiduos',
      key: 'id'
    }
  },
  pesoKg: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  cuponesGenerados: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  cuponGeneradoId: { 
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'cupones',
      key: 'id'
    }
  },
  descripcion: { 
    type: DataTypes.TEXT, 
    defaultValue: '' 
  },
  fecha: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  encargadoId: { 
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  estado: { 
    type: DataTypes.ENUM('completado', 'pendiente', 'rechazado'), 
    defaultValue: 'completado' 
  },
  observaciones: { 
    type: DataTypes.TEXT, 
    defaultValue: '' 
  }
}, {
  tableName: 'entregas',
  timestamps: true,
  indexes: [
    {
      fields: ['usuarioId']
    },
    {
      fields: ['ecopuntoId']
    },
    {
      fields: ['fecha']
    },
    {
      fields: ['tipoResiduoId']
    },
    {
      fields: ['estado']
    }
  ]
});

module.exports = EntregaResiduo;