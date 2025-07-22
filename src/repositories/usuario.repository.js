const { getDB1 } = require('../config/database');
const getUsuarioModel = require('../models/usuario.model');

function getUsuario() {
  const db = getDB1();
  if (!db) throw new Error('DB1 no inicializada');
  return getUsuarioModel(db);
}

module.exports = {
  async buscarUsuario(query) {
    return getUsuario().findOne(query);
  },
  async crearUsuario(data) {
    const usuario = new (getUsuario())(data);
    return usuario.save();
  },
  async listarUsuarios() {
    return getUsuario().find();
  },
  async buscarPorCorreo(email) {
    return getUsuario().findOne({ email });
  },
  async buscarPorId(id) {
    return getUsuario().findById(id);
  },
  async actualizarUsuario(id, data) {
    return getUsuario().findByIdAndUpdate(id, data, { new: true });
  },
  async eliminarUsuario(id) {
    return getUsuario().findByIdAndDelete(id);
  },
  async buscarPorTelefono(telefono) {
    return getUsuario().findOne({ telefono });
  },
  async incrementarTokens(id, tokens) {
    return getUsuario().findByIdAndUpdate(id, { $inc: { tokensAcumulados: tokens } }, { new: true });
  },
  async listarAdministradores() {
    return getUsuario().find({ rol: 'administrador' });
  },
  async buscarAdministradorPorId(id) {
    return getUsuario().findOne({ _id: id, rol: 'administrador' });
  }
};