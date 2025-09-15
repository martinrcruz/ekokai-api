const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const CuponUso = sequelize.define('CuponUso', {
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
  fechaUso: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cupon_usos',
  timestamps: false
});

module.exports = CuponUso;
