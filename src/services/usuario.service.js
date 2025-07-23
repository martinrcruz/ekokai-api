const usuarioRepo = require('../repositories/usuario.repository');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('../utils/jwt.utils');

const registrarConRol = async (datos, rol = 'vecino') => {
  console.log(`🟡 [SERVICE] Iniciando registro de usuario con rol: ${rol}`);
  console.log('📥 [SERVICE] Datos recibidos:', datos);

  const { email, dni } = datos;

  if (!email || !dni) {
    console.error('❌ [SERVICE] Faltan campos obligatorios: email o dni');
    throw new Error('Email y DNI son obligatorios');
  }

  const existente = await usuarioRepo.buscarUsuario({ email, dni });
  if (existente) {
    console.warn('⚠️ [SERVICE] Usuario ya existe con ese email o DNI');
    throw new Error('Usuario ya existe con ese email o DNI');
  }

  const claveTemporal = datos.password || require('crypto').randomBytes(16).toString('hex');
  console.log('🔐 [SERVICE] Clave temporal generada:', claveTemporal);
  datos.password = claveTemporal; // Se encriptará automáticamente en el pre('save')

  datos.rol = rol;
  datos.requiereCambioPassword = true;

  console.log('📦 [SERVICE] Datos que se enviarán al repositorio:', datos);

  const usuario = await usuarioRepo.crearUsuario(datos);

  const accessTokenTemporal = jwt.generarToken({ id: usuario._id, rol: usuario.rol });

  console.log('✅ [SERVICE] Usuario creado correctamente:', usuario.email);

  return { usuario, accessTokenTemporal };
};


const registrarVecino = async (datos) => {
  const existente = await usuarioRepo.buscarUsuario({ email: datos.email, dni: datos.dni });
  if (existente) throw new Error('Usuario ya existe con ese correo o DNI');
  datos.rol = 'vecino';
  return await usuarioRepo.crearUsuario(datos);
};

const obtenerTodos = async () => {
  return await usuarioRepo.listarUsuarios();
};

const obtenerPorId = async (id) => {
  return await usuarioRepo.buscarPorId(id);
};

const actualizarUsuario = async (id, datos) => {
  return await usuarioRepo.actualizarUsuario(id, datos);
};

const eliminarUsuario = async (id) => {
  return await usuarioRepo.eliminarUsuario(id);
};

const crearUsuario = async (datos) => {
  console.log('🟡 [SERVICE] Creando usuario desde ecopunto:', datos);
  
  // Validar datos requeridos
  if (!datos.nombre || !datos.apellido || !datos.dni || !datos.telefono) {
    throw new Error('Nombre, apellido, DNI y teléfono son obligatorios');
  }
  
  // Verificar si ya existe
  console.log('🔍 [SERVICE] Verificando si el usuario ya existe...');
  const existente = await usuarioRepo.buscarUsuario({ 
    dni: datos.dni, 
    telefono: datos.telefono 
  });
  
  if (existente) {
    throw new Error('Usuario ya existe con ese DNI o teléfono');
  }
  
  // Preparar datos del usuario
  const datosUsuario = {
    ...datos,
    rol: 'vecino',
    tokens: 0,
    activo: true,
    fechaRegistro: new Date(),
    requiereCambioPassword: false // No necesita password para registro por QR
  };
  
  const usuario = await usuarioRepo.crearUsuario(datosUsuario);
  console.log('✅ [SERVICE] Usuario creado exitosamente:', usuario.nombre);
  
  return usuario;
};

const actualizarTokens = async (id, tokensGanados) => {
  console.log(`🟡 [SERVICE] Actualizando tokens para usuario ${id}: +${tokensGanados}`);
  
  const usuario = await usuarioRepo.buscarPorId(id);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }
  
  const nuevosTokens = (usuario.tokens || 0) + tokensGanados;
  const usuarioActualizado = await usuarioRepo.actualizarUsuario(id, { tokens: nuevosTokens });
  
  console.log(`✅ [SERVICE] Tokens actualizados: ${usuario.tokens} → ${nuevosTokens}`);
  
  return usuarioActualizado;
};

module.exports = {
  registrarVecino,
  obtenerTodos,
  obtenerPorId,
  registrarConRol,
  actualizarUsuario,
  eliminarUsuario,
  crearUsuario,
  actualizarTokens
};
