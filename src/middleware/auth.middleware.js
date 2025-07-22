const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

const authMiddleware = async (req, res, next) => {
  console.log('[authMiddleware] Headers recibidos:', req.headers);
  const token = req.headers.authorization?.split(' ')[1];
  console.log('[authMiddleware] Token extraído:', token);
  if (!token) {
    console.log('[authMiddleware] Token no proporcionado');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[authMiddleware] Payload JWT:', payload);
    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      console.log('[authMiddleware] Usuario no válido para id:', payload.id);
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    console.log('[authMiddleware] Error al verificar token:', err);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado: permiso insuficiente' });
    }
    next();
  };
};

const verificarToken = async (req, res, next) => {
  console.log('[verificarToken] Headers recibidos:', req.headers);
  const token = req.headers.authorization?.split(' ')[1];
  console.log('[verificarToken] Token extraído:', token);
  if (!token) {
    console.log('[verificarToken] Token no proporcionado');
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[verificarToken] Payload JWT:', payload);
    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      console.log('[verificarToken] Usuario no válido para id:', payload.id);
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    req.usuario = usuario;
    next();
  } catch (err) {
    console.log('[verificarToken] Error al verificar token:', err);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = {
  authMiddleware,
  permitirRoles,
  verificarToken
};
