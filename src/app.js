require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:8100',
  credentials: true
}));

// Middlewares
app.use(express.urlencoded({ extended: true })); // 👈 NECESARIO para Twilio
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/auth', require('./routes/auth.routes'));
app.use('/usuarios', require('./routes/usuario.routes'));
app.use('/ecopuntos', require('./routes/ecopunto.routes'));
app.use('/residuos', require('./routes/entregaresiduo.routes'));
app.use('/tipos-residuo', require('./routes/tiporesiduo.routes'));
app.use('/estadisticas', require('./routes/estadisticas.routes'));
app.use('/webhook', require('./routes/whatsapp.routes'));

module.exports = app;
