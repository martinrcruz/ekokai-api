const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CuponMoneda = sequelize.define('CuponMoneda', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'cupon_monedas',
  timestamps: true,
  indexes: [
    {
      fields: ['usuarioId']
    },
    {
      fields: ['activo']
    }
  ]
});

// Método para obtener balance actual
CuponMoneda.prototype.obtenerBalance = function() {
  return this.cantidad;
};

module.exports = CuponMoneda;


