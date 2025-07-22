const jwt = require('jsonwebtoken');
const { getDB1 } = require('../config/database');
const getUsuarioModel = require('../models/usuario.model');

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
    const db = getDB1();
    const Usuario = getUsuarioModel(db);
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
