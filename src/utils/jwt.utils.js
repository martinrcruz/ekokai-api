const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'clave_secreta';

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
};

const verificarToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

module.exports = {
  generarToken,
  verificarToken
};
