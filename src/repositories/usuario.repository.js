const Usuario = require('../models/usuario.model');

const crearUsuario = async (datos) => {
  console.log('🛠️ [REPOSITORY] Guardando nuevo usuario con:', datos);
  return await Usuario.create(datos);
};

const buscarUsuario = async ({ email, dni, telefono }) => {
  console.log('🔎 [REPOSITORY] Buscando usuario con email, dni o telefono:', { email, dni, telefono });
  
  const filtro = { $or: [] };
  
  if (email) filtro.$or.push({ email });
  if (dni) filtro.$or.push({ dni });
  if (telefono) filtro.$or.push({ telefono });
  
  console.log('🔎 [REPOSITORY] Filtro aplicado:', JSON.stringify(filtro));
  
  const resultado = await Usuario.findOne(filtro);
  console.log('🔎 [REPOSITORY] Resultado de búsqueda:', resultado ? 'Usuario encontrado' : 'Usuario no encontrado');
  
  return resultado;
};



const buscarPorCorreo = async (email) => {
  return await Usuario.findOne({ email });
};

const buscarPorId = async (id) => {
  return await Usuario.findById(id);
};

const listarUsuarios = async (filtro = {}) => {
  return await Usuario.find(filtro).sort({ fechaCreacion: -1 });
};

const buscarPorTelefono = async (telefono) => {
  return await Usuario.findOne({ telefono });
};


// NUEVO: actualizar tokens acumulados
const incrementarTokens = async (usuarioId, tokens) => {
    console.log(`🔁 [REPO] Sumando ${tokens} tokens al usuario ${usuarioId}`);
    return await Usuario.findByIdAndUpdate(
      usuarioId,
      { $inc: { tokensAcumulados: tokens } },
      { new: true }
    );
  };

const actualizarUsuario = async (id, datos) => {
  console.log('✏️ [REPOSITORY] Actualizando usuario', id, 'con:', datos);
  return await Usuario.findByIdAndUpdate(id, datos, { new: true });
};

const eliminarUsuario = async (id) => {
  console.log('🗑️ [REPOSITORY] Eliminando usuario', id);
  return await Usuario.findByIdAndDelete(id);
};

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