const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CuponHistorialGanado = sequelize.define('CuponHistorialGanado', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cuponMonedaId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'cupon_monedas',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipoResiduoId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'tiporesiduos',
      key: 'id'
    }
  },
  pesoReciclado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  ecopuntoId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ecopuntos',
      key: 'id'
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cupon_historial_ganados',
  timestamps: false,
  indexes: [
    {
      fields: ['cuponMonedaId', 'fecha']
    }
  ]
});

module.exports = CuponHistorialGanado;
