const { getDB1 } = require('../config/database');
const getEcopuntoModel = require('../models/ecopunto.model');
const Usuario = require('../models/usuario.model');
const mongoose = require('mongoose');
const getEcopuntoMetaModel = require('../models/ecopuntoMeta.model');

function getEcopunto() {
  const db = getDB1();
  if (!db) throw new Error('DB1 no inicializada');
  return getEcopuntoModel(db);
}

async function _getEntregasCollection() {
  const db = getDB1();
  if (!db) throw new Error('DB1 no inicializada');
  // Acceso directo a la colección nativa (sin modelo)
  return db.collection('entregas'); // usa el nombre real que tengas
}

async function calcularTotalKgPorEcopuntoId(ecopuntoId) {
  const entregas = await _getEntregasCollection();
  const _id = new mongoose.Types.ObjectId(ecopuntoId);

  const pipeline = [
    // El esquema real usa el campo `ecopunto` y `pesoKg`
    { $match: { ecopunto: _id } },
    {
      $group: {
        _id: null,
        totalKg: {
          $sum: {
            // Coerción defensiva por si existen documentos antiguos con `peso`
            $toDouble: { $ifNull: ['$pesoKg', '$peso'] }
          }
        }
      }
    }
  ];

  const res = await entregas.aggregate(pipeline).toArray();
  return res[0]?.totalKg || 0;
}

async function calcularTotalKgPorNombre(nombre) {
  // busca el ecopunto por nombre (case-insensitive) y delega al sumatorio por id
  const Ecopunto = getEcopuntoModel(getDB1());
  const ecopunto = await Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  if (!ecopunto) return { totalKg: 0, ecopunto: null };

  const totalKg = await calcularTotalKgPorEcopuntoId(ecopunto._id);
  return { totalKg, ecopunto };
}

async function calcularTotalKgMensualPorEcopuntoId(ecopuntoId) {
  const entregas = await _getEntregasCollection();
  const _id = new mongoose.Types.ObjectId(ecopuntoId);

  const pipeline = [
    { $match: { ecopunto: _id } },
    {
      $group: {
        _id: {
          year: { $year: '$fecha' },
          month: { $month: '$fecha' }
        },
        totalKg: { $sum: { $toDouble: { $ifNull: ['$pesoKg', '$peso'] } } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalKg: 1
      }
    }
  ];

  return entregas.aggregate(pipeline).toArray();
}

async function calcularTotalKgMensualPorNombre(nombre) {
  const Ecopunto = getEcopuntoModel(getDB1());
  const ecopunto = await Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  if (!ecopunto) return { series: [], ecopunto: null };
  const series = await calcularTotalKgMensualPorEcopuntoId(ecopunto._id);
  return { series, ecopunto };
}

async function contarVecinosPorEcopuntoId(ecopuntoId) {
  const _id = new mongoose.Types.ObjectId(ecopuntoId);
  const totalVecinos = await Usuario.countDocuments({ ecopuntoId: _id, rol: 'vecino' });
  return totalVecinos;
}

async function contarVecinosPorNombre(nombre) {
  const Ecopunto = getEcopuntoModel(getDB1());
  const ecopunto = await Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  if (!ecopunto) return { totalVecinos: 0, ecopunto: null };
  const totalVecinos = await contarVecinosPorEcopuntoId(ecopunto._id);
  return { totalVecinos, ecopunto };
}

async function listarEntregasDetalladasPorEcopuntoId(ecopuntoId, { desde, hasta, limit } = {}) {
  const entregas = await _getEntregasCollection();
  const _id = new mongoose.Types.ObjectId(ecopuntoId);

  const match = { ecopunto: _id };
  if (desde || hasta) {
    match.fecha = {};
    if (desde) match.fecha.$gte = new Date(desde);
    if (hasta) match.fecha.$lte = new Date(hasta);
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'usuarios',
        localField: 'usuario',
        foreignField: '_id',
        as: 'vecino'
      }
    },
    { $unwind: { path: '$vecino', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        fecha: { $dateToString: { date: '$fecha', format: '%Y-%m-%d' } },
        hora: { $dateToString: { date: '$fecha', format: '%H:%M:%S' } },
        pesoKg: { $toDouble: { $ifNull: ['$pesoKg', '$peso'] } },
        nombreVecino: {
          $trim: { input: { $concat: [ { $ifNull: ['$vecino.nombre', ''] }, ' ', { $ifNull: ['$vecino.apellido', ''] } ] } }
        },
        usuarioId: '$vecino._id'
      }
    },
    { $sort: { fecha: -1, hora: -1 } },
  ];

  const max = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(500, Number(limit))) : 100;
  pipeline.push({ $limit: max });

  return entregas.aggregate(pipeline).toArray();
}

async function listarEntregasDetalladasPorNombre(nombre, opts = {}) {
  const Ecopunto = getEcopuntoModel(getDB1());
  const ecopunto = await Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  if (!ecopunto) return { entregas: [], ecopunto: null };
  const entregas = await listarEntregasDetalladasPorEcopuntoId(ecopunto._id, opts);
  return { entregas, ecopunto };
}


module.exports = {
  async crearEcopunto(data) {
    const ecopunto = new (getEcopunto())(data);
    return ecopunto.save();
  },
  async obtenerPorId(id) {
    return getEcopunto().findById(id);
  },
  async obtenerPorNombre(nombre) {
    return getEcopunto().findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  },
  async listarEcopuntosConDetalle() {
    return getEcopunto().find().populate('encargado').populate('vecinos');
  },
  async buscarPorEncargado(encargadoId) {
    return getEcopunto().findOne({ encargado: encargadoId });
  },
  async actualizarEncargado(ecopuntoId, encargadoId) {
    return getEcopunto().findByIdAndUpdate(ecopuntoId, { encargado: encargadoId }, { new: true });
  },
  async actualizarEcopunto(ecopuntoId, datos) {
    return getEcopunto().findByIdAndUpdate(ecopuntoId, datos, { new: true });
  },
  async eliminarEcopunto(ecopuntoId) {
    return getEcopunto().findByIdAndDelete(ecopuntoId);
  },

  calcularTotalKgPorEcopuntoId,
  calcularTotalKgPorNombre,
  calcularTotalKgMensualPorEcopuntoId,
  calcularTotalKgMensualPorNombre,
  contarVecinosPorEcopuntoId,
  contarVecinosPorNombre,
  listarEntregasDetalladasPorEcopuntoId,
  listarEntregasDetalladasPorNombre,

  // === Metas mensuales ===
  async upsertMetaMensual({ ecopuntoId, year, month, objetivoKg }) {
    const db = getDB1();
    const EcopuntoMeta = getEcopuntoMetaModel(db);
    const filter = { ecopunto: new mongoose.Types.ObjectId(ecopuntoId), year, month };
    const update = { $set: { objetivoKg, actualizadoEn: new Date() }, $setOnInsert: { creadoEn: new Date() } };
    const options = { upsert: true, new: true, returnDocument: 'after' };
    const res = await EcopuntoMeta.findOneAndUpdate(filter, update, options);
    return res;
  },
  async obtenerMetaMensual({ ecopuntoId, year, month }) {
    const db = getDB1();
    const EcopuntoMeta = getEcopuntoMetaModel(db);
    return EcopuntoMeta.findOne({ ecopunto: new mongoose.Types.ObjectId(ecopuntoId), year, month });
  },
  async eliminarMetaMensual({ ecopuntoId, year, month }) {
    const db = getDB1();
    const EcopuntoMeta = getEcopuntoMetaModel(db);
    return EcopuntoMeta.findOneAndDelete({ ecopunto: new mongoose.Types.ObjectId(ecopuntoId), year, month });
  }

};