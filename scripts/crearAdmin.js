require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const uri = process.env.MONGO_URI_DB1;

const UsuarioSchema = new mongoose.Schema({
  rol: { type: String, enum: ['vecino', 'encargado', 'administrador'], required: true },
  nombre: String,
  apellido: String,
  dni: String,
  email: { type: String, unique: true },
  password: String,
  fechaNacimiento: Date,
  telefono: String,
  pais: String,
  zona: String,
  direccion: String,
  tokensAcumulados: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now },
  ultimaModificacion: { type: Date, default: Date.now },
  ultimaConexion: { type: Date, default: Date.now },
  ecopuntoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ecopunto',
    default: null,
  },
});

// Hashear password antes de guardar
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Usuario = mongoose.model('Usuario', UsuarioSchema, 'usuarios');

const crearAdmin = async () => {
  try {
    if (!uri) {
      console.error('❌ No se encontró MONGO_URI_DB1 en el archivo .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    const existe = await Usuario.findOne({ rol: 'administrador' });
    if (existe) {
      console.log('⚠️ Ya existe un administrador. Abortando.');
      process.exit();
    }

    const admin = new Usuario({
      nombre: 'Admin',
      apellido: 'Sistema',
      dni: '99999999-9',
      email: 'admin@correo.com',
      password: 'admin123',
      rol: 'administrador',
      telefono: '+56999999999',
      pais: 'Chile',
      zona: 'Central',
      direccion: 'Oficina Principal'
    });

    await admin.save();
    console.log('✅ Usuario administrador creado con éxito.');
  } catch (err) {
    console.error('❌ Error al crear administrador:', err);
  } finally {
    mongoose.connection.close();
  }
};

crearAdmin();
