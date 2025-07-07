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
      const encargadoId = req.usuario.id;
  
      // Buscar ecopunto del encargado
      const ecopunto = await ecopuntoRepo.buscarPorEncargado(encargadoId);
      if (!ecopunto) {
        return res.status(400).json({ error: 'No se encontró ecopunto para este encargado' });
      }
  
      datos.ecopuntoId = ecopunto._id;
  
      const nuevoVecino = await usuarioService.registrarConRol(datos, 'vecino');
      res.status(201).json(nuevoVecino);
    } catch (err) {
      console.error('❌ Error al registrar vecino:', err);
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

module.exports = {
  registrarVecino,
  listarUsuarios,
  obtenerUsuario,
  registrarConRol
};
