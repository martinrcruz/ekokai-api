const jwt = require('../utils/jwt.utils');
const bcrypt = require('bcrypt');
const usuarioRepo = require('../repositories/usuario.repository');
const ecopuntoRepo = require('../repositories/ecopunto.repository')
const usuarioService = require('../services/usuario.service')
// Admin registra encargado

const registrarConRol = async (req, res) => {
  console.log('🟢 [CONTROLLER] Solicitud para registrar encargado recibida');
  console.log('📥 [CONTROLLER] Body recibido:', req.body);

  try {
    const { usuario, accessTokenTemporal } = await usuarioService.registrarConRol(req.body, 'encargado');
    console.log('✅ [CONTROLLER] Encargado creado con éxito:', usuario.email);
    res.status(201).json({ mensaje: 'Encargado creado', usuario, accessTokenTemporal });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error al crear encargado:', err.message);
    res.status(400).json({ error: err.message });
  }
};
  const registrarVecino = async (req, res) => {
    try {
      const datos = req.body;
      const rolUsuario = req.usuario.rol;
      console.log('🔵 [registrarVecino] Body recibido:', datos);
      console.log('🔵 [registrarVecino] Rol usuario autenticado:', rolUsuario);

      let ecopuntoId = null;
      if (rolUsuario === 'encargado') {
        const encargadoId = req.usuario.id;
        console.log('🟢 [registrarVecino] Buscando ecopunto para encargado:', encargadoId);
        const ecopunto = await ecopuntoRepo.buscarPorEncargado(encargadoId);
        if (ecopunto) {
          ecopuntoId = ecopunto._id;
          console.log('🟢 [registrarVecino] Ecopunto encontrado para encargado:', ecopuntoId);
        } else {
          console.warn('🟠 [registrarVecino] No se encontró ecopunto para encargado, se creará vecino sin ecopuntoId');
        }
      } else if (rolUsuario === 'administrador') {
        if (datos.ecopuntoId) {
          ecopuntoId = datos.ecopuntoId;
          console.log('🟡 [registrarVecino] Admin usará ecopuntoId:', ecopuntoId);
        } else {
          console.warn('🟠 [registrarVecino] Admin no envió ecopuntoId, se creará vecino sin ecopuntoId');
        }
      } else {
        console.error('🔴 [registrarVecino] Rol no autorizado:', rolUsuario);
        return res.status(403).json({ error: 'Solo administradores o encargados pueden crear vecinos' });
      }

      datos.ecopuntoId = ecopuntoId;
      console.log('🔵 [registrarVecino] Datos finales para crear vecino:', datos);
      const nuevoVecino = await usuarioService.registrarConRol(datos, 'vecino');
      console.log('✅ [registrarVecino] Vecino creado:', nuevoVecino);
      res.status(201).json(nuevoVecino);
    } catch (err) {
      console.error('❌ [registrarVecino] Error al registrar vecino:', err);
      res.status(500).json({ error: err.message });
    }
  };
  

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerTodos();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const datos = req.body;
    console.log('✏️ [CONTROLLER] Actualizando usuario', id, 'con:', datos);
    const actualizado = await usuarioService.actualizarUsuario(id, datos);
    if (!actualizado) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(actualizado);
  } catch (err) {
    console.error('❌ [actualizarUsuario] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('🗑️ [CONTROLLER] Eliminando usuario', id);
    const eliminado = await usuarioService.eliminarUsuario(id);
    if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    console.error('❌ [eliminarUsuario] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registrarVecino,
  listarUsuarios,
  obtenerUsuario,
  registrarConRol,
  actualizarUsuario,
  eliminarUsuario
};
