const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('[AUTH] Authorization header:', authHeader);
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.log('[AUTH] Token no proporcionado');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    console.log('[AUTH] Verificando token con JWT_SECRET:', process.env.JWT_SECRET);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Payload decodificado:', payload);
    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      console.log('[AUTH] Usuario no válido para ID:', payload.id);
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    req.usuario = usuario;
    console.log('[AUTH] Usuario autenticado:', usuario.email, usuario.rol);
    next();
  } catch (err) {
    console.log('[AUTH] Error al verificar token:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      console.log('[AUTH] Acceso denegado. Rol requerido:', rolesPermitidos, 'Rol usuario:', req.usuario?.rol);
      return res.status(403).json({ error: 'Acceso denegado: permiso insuficiente' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  permitirRoles
};