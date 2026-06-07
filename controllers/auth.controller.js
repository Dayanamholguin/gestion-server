const authService = require("../services/auth.service");

/**
 * POST /auth/login
 * Body: { correo, password }
 * Responde: { token, usuario }
 */
const login = async (req, res) => {
  const { correo, password } = req.body;
  if (!correo?.trim() || !password) {
    return res.status(400).json({ error: "Correo y contraseña son requeridos" });
  }

  try {
    const resultado = await authService.login(correo.trim().toLowerCase(), password);
    if (!resultado) {
      return res.status(401).json({ error: "Credenciales incorrectas o usuario inactivo" });
    }
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /auth/me  (requiere authMiddleware)
 * Retorna los datos del usuario autenticado extraídos del JWT.
 */
const me = (req, res) => {
  res.json({ usuario: req.usuario });
};

/**
 * PUT /auth/password  (requiere authMiddleware)
 * Body: { passwordActual, passwordNueva }
 * Permite al usuario cambiar su propia contraseña.
 */
const cambiarPassword = async (req, res) => {
  const { passwordActual, passwordNueva } = req.body;
  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ error: "Contraseña actual y nueva son requeridas" });
  }
  if (passwordNueva.length < 8) {
    return res.status(400).json({ error: "La contraseña nueva debe tener al menos 8 caracteres" });
  }

  try {
    // Re-verificar contraseña actual antes de cambiar
    const verificado = await authService.login(req.usuario.correo, passwordActual);
    if (!verificado) {
      return res.status(401).json({ error: "La contraseña actual es incorrecta" });
    }

    await authService.cambiarPassword(req.usuario.id, passwordNueva);
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login, me, cambiarPassword };
