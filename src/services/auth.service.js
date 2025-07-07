const bcrypt = require('bcrypt');
const usuarioRepo = require('../repositories/usuario.repository');
const { generarToken } = require('../utils/jwt.utils');

const login = async (email, passwordPlano) => {
  console.log('🔎 Buscando usuario con correo:', email);
  const usuario = await usuarioRepo.buscarPorCorreo(email);

  if (!usuario) {
    console.warn('⚠️ Usuario no encontrado con ese correo');
    throw new Error('Correo o contraseña incorrectos');
  }

  console.log('👤 Usuario encontrado:', usuario.email);
  console.log('🔐 Comparando password plano:', passwordPlano);
  console.log('🔐 Contra encriptada en BD:', usuario.password);

  const coincide = await bcrypt.compare(passwordPlano, usuario.password);

  if (!coincide) {
    console.warn('⚠️ Contraseña incorrecta para:', usuario.email);
    throw new Error('Correo o contraseña incorrectos');
  }

  console.log('✅ Contraseña válida. Generando token...');
  const token = generarToken(usuario);

  return { token, usuario };
};

module.exports = {
  login
};
