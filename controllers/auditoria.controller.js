const auditoriaService = require("../services/auditoria.service");

const listarAuditoria = async (req, res) => {
  const { tabla, accion, usuario_id, fecha_desde, fecha_hasta } = req.query;
  try {
    const registros = await auditoriaService.listar({
      tabla:      tabla      || null,
      accion:     accion     || null,
      usuarioId:  usuario_id || null,
      fechaDesde: fecha_desde || null,
      fechaHasta: fecha_hasta || null,
    });
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listarAuditoria };
