/**
 * authMiddleware.js
 *
 * Verifica el JWT en cada solicitud y expone req.usuario.
 * Cuando AUTH_ENABLED=false (valor por defecto), asigna un usuario
 * virtual ADMIN con permisos totales para no romper el sistema actual.
 */

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // ── Bypass: AUTH desactivado (Fase 2 de transición) ─────────────────────
  if (process.env.AUTH_ENABLED !== "true") {
    req.usuario = { id: null, rol: "ADMIN", permisos: ["*"], empleado_id: null };
    return next();
  }

  // ── Verificar header Authorization ───────────────────────────────────────
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Autenticación requerida" });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Sesión expirada" : "Token inválido";
    return res.status(401).json({ error: msg });
  }
};

module.exports = authMiddleware;
