const { getDB1 } = require('../config/database');
const mongoose = require('mongoose');

const CanjeSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  premio: { type: mongoose.Schema.Types.ObjectId, ref: 'Premio', required: true },
  tokens: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, enum: ['Pendiente', 'Entregado'], default: 'Pendiente' }
});

module.exports = (connection) => {
  return connection.models.Canje || connection.model('Canje', CanjeSchema, 'canjes');
};