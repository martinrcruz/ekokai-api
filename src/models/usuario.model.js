const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { getDB1 } = require('../config/database');

const UsuarioSchema = new mongoose.Schema({
  rol: { type: String, enum: ['vecino', 'encargado', 'administrador'], required: true },
  nombre: String,
  apellido: String,
  dni: String,
  email: { type: String, unique: true },
  password: String,
  fechaNacimiento: Date,
  telefono: String,
  pais: String,
  zona: String,
  direccion: String,
  tokensAcumulados: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  ultimaModificacion: { type: Date, default: Date.now },
  ultimaConexion: { type: Date, default: Date.now },
  ecopuntoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ecopunto',
    default: null,
  },
  requiereCambioPassword: { type: Boolean, default: false }
});

// Hash de contraseña antes de guardar
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar contraseñas
UsuarioSchema.methods.compararContrasena = async function (contrasenaPlano) {
  return await bcrypt.compare(contrasenaPlano, this.password);
};

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema, 'usuarios');
module.exports = Usuario;
