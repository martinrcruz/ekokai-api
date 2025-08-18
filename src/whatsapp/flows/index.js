// src/whatsapp/flows/index.js
console.log('[FLOWS-INDEX] 🚀 Inicializando módulo de flujos...');

console.log('[FLOWS-INDEX] 🏷️ Cargando flujo cuponera...');
const cuponeraFlow = require('./cuponera.flow.js');

console.log('[FLOWS-INDEX] ♻️ Cargando flujo ecopunto...');
const ecopuntoFlow = require('./ecopunto.flow.js');

console.log('[FLOWS-INDEX] 🌿 Cargando flujo huella...');
const huellaFlow = require('./huella.flow.js');

console.log('[FLOWS-INDEX] ℹ️ Cargando flujo funcionamiento...');
const funcionamientoFlow = require('./funcionamiento.flow.js');

console.log('[FLOWS-INDEX] 🧼 Cargando flujo separar...');
const separarFlow = require('./separar.flow.js');

console.log('[FLOWS-INDEX] 🚨 Cargando flujo problemas...');
const problemaFlow = require('./problema.flow.js');

console.log('[FLOWS-INDEX] ✅ Módulo de flujos inicializado correctamente');

module.exports = {
  ...cuponeraFlow,
  ...ecopuntoFlow,
  ...huellaFlow,
  ...funcionamientoFlow,
  ...separarFlow,
  ...problemaFlow,
};
