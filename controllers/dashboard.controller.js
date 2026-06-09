const { getStats } = require("../services/dashboard.service");

const stats = async (req, res) => {
  const u = req.usuario;
  const puedeVer = u.permisos.includes("*") || u.permisos.includes("empleados:listar");
  if (!puedeVer) return res.status(403).json({ error: "Acceso denegado" });
  try {
    const sedeId = req.query.sede_id ? Number(req.query.sede_id) : null;
    res.json(await getStats(sedeId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { stats };
