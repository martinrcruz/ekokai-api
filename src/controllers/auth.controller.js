const authService = require('../services/auth.service');

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('el req es :', req.body);

  console.log('🔐 Intentando login con:', email);

  try {
    const { token, usuario } = await authService.login(email, password);
    console.log('✅ Login exitoso para:', usuario.email);

    res.json({ token, usuario });
  } catch (err) {
    console.error('❌ Error en login:', err.message);
    res.status(401).json({ error: err.message });
  }
};

module.exports = {
  login
};
