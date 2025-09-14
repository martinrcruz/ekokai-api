const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Recompensa = sequelize.define('Recompensa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Código único de la recompensa'
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nombre de la recompensa'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada de la recompensa'
  },
  cuponesRequeridos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Número de cupones requeridos para canjear'
  },
  establecimiento: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Establecimiento donde se puede canjear'
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección del establecimiento'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Teléfono del establecimiento'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Estado activo/inactivo de la recompensa'
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de inicio de validez'
  },
  fechaExpiracion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de expiración'
  },
  stockDisponible: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Stock disponible (null = ilimitado)'
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Categoría de la recompensa'
  },
  imagenUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la imagen de la recompensa'
  },
  terminos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Términos y condiciones'
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de creación del registro'
  },
  fechaActualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de última actualización'
  }
}, {
  tableName: 'recompensas',
  timestamps: true,
  createdAt: 'fechaCreacion',
  updatedAt: 'fechaActualizacion',
  indexes: [
    {
      unique: true,
      fields: ['codigo']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['categoria']
    },
    {
      fields: ['fechaExpiracion']
    }
  ]
});

module.exports = Recompensa;
