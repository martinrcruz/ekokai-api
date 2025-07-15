const usuarioRepo = require('../repositories/usuario.repository');
const entregaRepo = require('../repositories/entregaresiduio.repository');
const premioService = require('../services/premio.service');

// Listar usuarios
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioRepo.listarUsuarios();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

// Historial de un usuario
const historialUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await entregaRepo.historialPorUsuario(id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// Métricas de un ecopunto
const metricasEcopunto = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await entregaRepo.metricasPorEcopunto(id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
};

// CRUD premios
const crearPremio = async (req, res) => {
  try {
    const creado = await premioService.crearPremio(req.body);
    res.status(201).json(creado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listarPremios = async (req, res) => {
  try {
    const lista = await premioService.listarPremios();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar premios' });
  }
};

const actualizarPremio = async (req, res) => {
  try {
    const actualizado = await premioService.actualizarPremio(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const eliminarPremio = async (req, res) => {
  try {
    await premioService.eliminarPremio(req.params.id);
    res.json({ mensaje: 'Premio eliminado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  listarUsuarios,
  historialUsuario,
  metricasEcopunto,
  crearPremio,
  listarPremios,
  actualizarPremio,
  eliminarPremio
};
