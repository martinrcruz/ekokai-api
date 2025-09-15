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
console.log('[APP-MIDDLEWARE] 🔧 Configurando middlewares...');
app.use(express.urlencoded({ extended: true })); // 👈 NECESARIO para Twilio
console.log('[APP-MIDDLEWARE] ✅ urlencoded configurado (extended: true)');
app.use(express.json());
console.log('[APP-MIDDLEWARE] ✅ json parser configurado');
app.use(morgan('dev'));
console.log('[APP-MIDDLEWARE] ✅ morgan logger configurado');


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
app.use('/usuarios', checkRoute('/usuarios', './routes/usuario.routes.test'));
app.use('/ecopuntos', checkRoute('/ecopuntos', './routes/ecopunto.routes'));
app.use('/entregas', checkRoute('/entregas', './routes/entregaresiduo.routes'));
app.use('/tipos-residuo', checkRoute('/tipos-residuo', './routes/tiporesiduo.routes'));
app.use('/estadisticas', checkRoute('/estadisticas', './routes/estadisticas.routes'));
app.use('/admin', checkRoute('/admin', './routes/admin.routes'));
app.use('/cupones', checkRoute('/cupones', './routes/cupon.routes'));
app.use('/canjes', checkRoute('/canjes', './routes/canje.routes'));
app.use('/canjes', checkRoute('/canjes-reciclaje', './routes/canjeReciclaje.routes'));
app.use('/recompensas', checkRoute('/recompensas', './routes/recompensa.routes'));
app.use('/premios', checkRoute('/premios', './routes/premio.routes'));
app.use('/qr', checkRoute('/qr', './routes/qr.routes'));
app.use('/trazabilidad', checkRoute('/trazabilidad', './routes/trazabilidad.routes'));

// Health check endpoint para Digital Ocean
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ RUTA DE PRUEBA DIRECTA EN APP
app.get('/test-directo', (req, res) => {
  res.json({ message: 'Ruta directa funcionando', timestamp: new Date().toISOString() });
});

module.exports = app;
