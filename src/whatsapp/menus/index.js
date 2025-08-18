// src/whatsapp/menus/index.js
console.log('[MENUS-INDEX] 🚀 Inicializando módulo de menús...');

console.log('[MENUS-INDEX] 📋 Cargando menú principal...');
const principalMenu = require('./principal.menu.js');

console.log('[MENUS-INDEX] 🏷️ Cargando menú cuponera...');
const cuponeraMenu = require('./cuponera.menu.js');

console.log('[MENUS-INDEX] ♻️ Cargando menú ecopunto...');
const ecopuntoMenu = require('./ecopunto.menu.js');

console.log('[MENUS-INDEX] 🌿 Cargando menú huella...');
const huellaMenu = require('./huella.menu.js');

console.log('[MENUS-INDEX] ℹ️ Cargando menú funcionamiento...');
const funcionamientoMenu = require('./funcionamiento.menu.js');

console.log('[MENUS-INDEX] 🧼 Cargando menú separar...');
const separarMenu = require('./separar.menu.js');

console.log('[MENUS-INDEX] 🚨 Cargando menú problemas...');
const problemaMenu = require('./problema.menu.js');

console.log('[MENUS-INDEX] ✅ Módulo de menús inicializado correctamente');

module.exports = {
  ...principalMenu,
  ...cuponeraMenu,
  ...ecopuntoMenu,
  ...huellaMenu,
  ...funcionamientoMenu,
  ...separarMenu,
  ...problemaMenu,
};
