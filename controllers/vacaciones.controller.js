const vacacionesService = require("../services/vacaciones.service");
const auditoria         = require("../services/auditoria.service");

const esGestor = (usuario) =>
  usuario.permisos.includes("*") ||
  usuario.permisos.includes("vacaciones:gestionar") ||
  usuario.rol === "ADMIN" ||
  usuario.rol === "RRHH";

// GET /vacaciones
// Gestor → todas; Empleado → solo las propias
const listar = async (req, res) => {
  try {
    const filtros = {};
    if (!esGestor(req.usuario)) {
      if (!req.usuario.empleado_id) {
        return res.status(403).json({ error: "No tienes un empleado vinculado a tu cuenta" });
      }
      filtros.empleado_id = req.usuario.empleado_id;
    } else {
      if (req.query.empleado_id) filtros.empleado_id = Number(req.query.empleado_id);
    }
    if (req.query.estado) filtros.estado = req.query.estado;

    const registros = await vacacionesService.listar(filtros);
    res.json(registros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /vacaciones
// Cualquier usuario con empleado_id puede crear su propia solicitud
const crear = async (req, res) => {
  try {
    const empleado_id = req.usuario.empleado_id;
    if (!empleado_id) {
      return res.status(403).json({ error: "No tienes un empleado vinculado a tu cuenta" });
    }

    const { fecha_inicio, fecha_fin, observaciones } = req.body;
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: "Las fechas de inicio y fin son requeridas" });
    }
    if (fecha_fin <= fecha_inicio) {
      return res.status(400).json({ error: "La fecha de fin debe ser posterior a la de inicio" });
    }

    const id = await vacacionesService.crear({ empleado_id, fecha_inicio, fecha_fin, observaciones });

    auditoria.registrar({
      tabla:     "tb_vacaciones",
      registroId: id,
      accion:    "CREATE",
      antes:     null,
      despues:   { empleado_id, fecha_inicio, fecha_fin, observaciones: observaciones || null, estado: "Pendiente" },
      usuarioId: req.usuario.id,
      ip:        req.ip,
    });

    res.status(201).json({ id, message: "Solicitud creada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /vacaciones/:id/estado
// Solo ADMIN / RRHH pueden aprobar o rechazar
const cambiarEstado = async (req, res) => {
  if (!esGestor(req.usuario)) {
    return res.status(403).json({ error: "No tienes permiso para revisar solicitudes" });
  }
  const id = Number(req.params.id);
  const { estado, motivo_rechazo } = req.body;

  if (!["Aprobada", "Rechazada"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido. Use 'Aprobada' o 'Rechazada'" });
  }

  try {
    const anterior = await vacacionesService.obtenerPorId(id);
    if (!anterior) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (anterior.estado !== "Pendiente") {
      return res.status(400).json({ error: "Solo se pueden revisar solicitudes en estado Pendiente" });
    }

    await vacacionesService.actualizarEstado(id, {
      estado,
      revisado_por:   req.usuario.id,
      motivo_rechazo: estado === "Rechazada" ? (motivo_rechazo || null) : null,
    });

    const nombreRevisor = `${req.usuario.nombre || ""} ${req.usuario.apellido || ""}`.trim();
    const despuesAudit = { estado, revisado_por: nombreRevisor };
    if (estado === "Rechazada") {
      despuesAudit.motivo_rechazo = motivo_rechazo || "Sin especificar";
    }

    auditoria.registrar({
      tabla:     "tb_vacaciones",
      registroId: id,
      accion:    "UPDATE",
      antes:     { estado: anterior.estado },
      despues:   despuesAudit,
      usuarioId: req.usuario.id,
      ip:        req.ip,
    });

    res.json({ message: `Solicitud ${estado.toLowerCase()} correctamente` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /vacaciones/:id
// El empleado cancela su propia solicitud Pendiente; el gestor puede cancelar cualquiera
const cancelar = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const registro = await vacacionesService.obtenerPorId(id);
    if (!registro) return res.status(404).json({ error: "Solicitud no encontrada" });

    if (!esGestor(req.usuario) && registro.empleado_id !== req.usuario.empleado_id) {
      return res.status(403).json({ error: "No autorizado para cancelar esta solicitud" });
    }
    if (registro.estado !== "Pendiente") {
      return res.status(400).json({ error: "Solo se pueden cancelar solicitudes Pendientes" });
    }

    await vacacionesService.cancelar(id, registro.empleado_id);

    auditoria.registrar({
      tabla:     "tb_vacaciones",
      registroId: id,
      accion:    "DELETE",
      antes:     { empleado_id: registro.empleado_id, fecha_inicio: registro.fecha_inicio, fecha_fin: registro.fecha_fin, estado: registro.estado },
      despues:   null,
      usuarioId: req.usuario.id,
      ip:        req.ip,
    });

    res.json({ message: "Solicitud cancelada correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, crear, cambiarEstado, cancelar };
