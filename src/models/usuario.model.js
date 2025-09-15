const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  rol: { 
    type: DataTypes.ENUM('vecino', 'encargado', 'administrador'), 
    allowNull: false 
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dni: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pais: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zona: {
    type: DataTypes.STRING,
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tokensAcumulados: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  activo: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  ecopuntoId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Ecopuntos',
      key: 'id'
    }
  },
  requiereCambioPassword: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'fechaCreacion',
  updatedAt: 'ultimaModificacion',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        usuario.password = await bcrypt.hash(usuario.password, 10);
      }
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.compararContrasena = async function (contrasenaPlano) {
  return await bcrypt.compare(contrasenaPlano, this.password);
};

module.exports = Usuario;