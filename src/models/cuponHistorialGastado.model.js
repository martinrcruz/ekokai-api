const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CuponHistorialGastado = sequelize.define('CuponHistorialGastado', {
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
  premioId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'premios',
      key: 'id'
    }
  },
  premioNombre: {
    type: DataTypes.STRING,
    allowNull: true
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
  tableName: 'cupon_historial_gastados',
  timestamps: false,
  indexes: [
    {
      fields: ['cuponMonedaId', 'fecha']
    }
  ]
});

module.exports = CuponHistorialGastado;
