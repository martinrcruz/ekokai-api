require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Configurar CORS - Permitir múltiples orígenes
const allowedOrigins = [
  'http://localhost:8100',
  'https://ekokai-web-jcmad.ondigitalocean.app',
  'https://ekokai-web.ondigitalocean.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS bloqueado para origen:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));

// Middlewares
app.use(express.urlencoded({ extended: true })); // 👈 NECESARIO para Twilio
app.use(express.json());
app.use(morgan('dev'));


function checkRoute(path, modulePath) {
  try {
    console.log(`🔎 [DEBUG] Cargando rutas desde: ${modulePath}`);
    const r = require(modulePath);
    console.log(`✅ [DEBUG] Ruta ${path} cargada correctamente. Tipo: ${typeof r}`);
    return r;
  } catch (err) {
    console.error(`❌ [DEBUG] Error al cargar ${modulePath}:`, err);
    throw err;
  }
}

// ======================
// Rutas
// ======================
app.use('/auth', checkRoute('/auth', './routes/auth.routes'));
app.use('/usuarios', checkRoute('/usuarios', './routes/usuario.routes'));
app.use('/ecopuntos', checkRoute('/ecopuntos', './routes/ecopunto.routes'));
app.use('/residuos', checkRoute('/residuos', './routes/entregaresiduo.routes'));
app.use('/tipos-residuo', checkRoute('/tipos-residuo', './routes/tiporesiduo.routes'));
app.use('/estadisticas', checkRoute('/estadisticas', './routes/estadisticas.routes'));
app.use('/webhook', checkRoute('/webhook', './routes/whatsapp.routes'));
app.use('/admin', checkRoute('/admin', './routes/admin.routes'));
app.use('/cupones', checkRoute('/cupones', './routes/cupon.routes'));
app.use('/canjes', checkRoute('/canjes', './routes/canje.routes'));
app.use('/articulos', checkRoute('/articulos', './routes/articulo.routes'));

// Health check endpoint para Digital Ocean
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = app;
