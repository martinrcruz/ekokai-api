require('dotenv').config();
const mongoose = require('mongoose');

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

const Usuario = mongoose.model('Usuario', UsuarioSchema, 'usuarios');

const listarAdmins = async () => {
  try {
    if (!uri) {
      console.error('❌ No se encontró MONGO_URI_DB1 en el archivo .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');

    const admins = await Usuario.find({ rol: 'administrador' }).select('-password');
    
    if (admins.length === 0) {
      console.log('❌ No hay usuarios administradores');
    } else {
      console.log(`✅ Se encontraron ${admins.length} administrador(es):`);
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Administrador:`);
        console.log(`   - Nombre: ${admin.nombre} ${admin.apellido}`);
        console.log(`   - Email: ${admin.email}`);
        console.log(`   - DNI: ${admin.dni}`);
        console.log(`   - Teléfono: ${admin.telefono}`);
        console.log(`   - Activo: ${admin.activo}`);
        console.log(`   - Fecha creación: ${admin.fechaCreacion}`);
      });
    }
  } catch (err) {
    console.error('❌ Error al listar administradores:', err);
  } finally {
    mongoose.connection.close();
  }
};

listarAdmins(); 