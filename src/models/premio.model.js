const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Premio = sequelize.define('Premio', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cuponesRequeridos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'premios',
  timestamps: true,
  indexes: [
    {
      fields: ['activo']
    },
    {
      fields: ['categoria']
    },
    {
      fields: ['destacado']
    },
    {
      fields: ['orden']
    }
  ]
});

module.exports = Premio;

