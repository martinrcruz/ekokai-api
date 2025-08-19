// src/whatsapp/index.js

const coreHelpers = require('./core/twilio.helper.js');
const dfcxUtils = require('./core/dfcx.utils.js');

console.log('[WHATSAPP-INDEX] 🍔 Cargando menús...');
const menus = require('./menus/index.js');

console.log('[WHATSAPP-INDEX] 🔄 Cargando flujos...');
const flows = require('./flows/index.js');

console.log('[WHATSAPP-INDEX] 🛣️ Cargando router...');
const router = require('./router/handler.js');

console.log('[WHATSAPP-INDEX] ✅ Módulo WhatsApp inicializado correctamente');

module.exports = {
  // Helpers Twilio + CX
  ...coreHelpers,
  ...dfcxUtils,

  // Menús
  ...menus,

  // Flujos (starters, no router)
  ...flows,

  // Router (Twilio → texto entrante)
  ...router,
};
