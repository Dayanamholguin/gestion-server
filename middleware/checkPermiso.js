/**
 * checkPermiso.js
 *
 * Middleware factory: verifica que req.usuario tenga el permiso indicado.
 * Uso: router.post("/", checkPermiso("empleados:crear"), controlador)
 *
 * El comodín "*" (usuario virtual cuando AUTH_ENABLED=false) siempre pasa.
 */

const checkPermiso = (permiso) => (req, res, next) => {
  if (process.env.AUTH_ENABLED !== "true") return next();

  const permisos = req.usuario?.permisos || [];
  if (permisos.includes("*") || permisos.includes(permiso)) return next();

  return res.status(403).json({
    error: `No tienes permiso para realizar esta acción (${permiso})`,
  });
};

module.exports = checkPermiso;
