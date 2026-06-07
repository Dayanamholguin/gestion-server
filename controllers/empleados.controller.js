const empleadoService  = require("../services/empleados.service");
const usuariosService  = require("../services/usuarios.service");
const historialService = require("../services/historial-cargos.service");
const auditoria        = require("../services/auditoria.service");
const { validarEmpleado } = require("../validations/empleados.validation");

// Convierte Date o ISO string a "YYYY-MM-DD"
const toDateStr = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().split("T")[0];
  return String(v).split("T")[0];
};

// ── helpers ──────────────────────────────────────────────────────────────────

const tienePermiso = (req, permiso) => {
  const permisos = req.usuario?.permisos || [];
  return permisos.includes("*") || permisos.includes(permiso);
};

// ── Controllers ───────────────────────────────────────────────────────────────

const obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await empleadoService.obtenerEmpleados();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearEmpleado = async (req, res) => {
  try {
    if (!tienePermiso(req, "empleados:crear")) {
      return res.status(403).json({ error: "No tienes permiso para crear empleados" });
    }

    const errorValidacion = validarEmpleado(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const creadoPor = req.usuario?.id || null;
    const resultado = await empleadoService.crearEmpleado(req.body, creadoPor);
    const empleadoCreado = await empleadoService.obtenerEmpleadoCompleto(resultado.insertId);

    auditoria.registrar({
      tabla: "tb_empleados",
      registroId: resultado.insertId,
      accion: "CREATE",
      despues: empleadoCreado,
      usuarioId: creadoPor,
      ip: req.ip,
    });

    // Crear registro inicial de historial de cargos (queda abierto como "Actual")
    historialService.crearHistorial({
      empleado_id:      resultado.insertId,
      cargo_id:         req.body.cargo_id,
      tipo_contrato_id: req.body.tipo_contrato_id,
      salario:          req.body.salario,
      fecha_inicio:     toDateStr(req.body.fecha_ingreso) || req.body.fecha_ingreso,
      fecha_fin:        null,
      motivo:           null,
    }).catch((err) => {
      console.warn("[Auto-historial inicial]", err.message);
    });

    // Auto-crear cuenta de sistema con rol EMPLEADO.
    // La contraseña inicial es el número de documento del empleado.
    // Fire-and-forget: un correo duplicado o error no falla la creación del empleado.
    if (req.body.correo && req.body.documento) {
      usuariosService.crear({
        nombre:      req.body.nombre,
        apellido:    req.body.apellido,
        correo:      req.body.correo,
        password:    String(req.body.documento),
        rol_id:      3,
        empleado_id: resultado.insertId,
      }).catch((err) => {
        console.warn("[Auto-usuario empleado]", err.message);
      });
    }

    res.status(201).json(empleadoCreado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const puedeEditarTotal  = tienePermiso(req, "empleados:editar_total");
    const puedeEditarPropio = tienePermiso(req, "empleados:editar_propio");

    if (!puedeEditarTotal && !puedeEditarPropio) {
      return res.status(403).json({ error: "No tienes permiso para editar empleados" });
    }

    // Cargar datos actuales (necesario para audit + restricción de campos)
    const empleadoActual = await empleadoService.obtenerEmpleadoCompleto(id);
    if (!empleadoActual) return res.status(404).json({ error: "Empleado no encontrado" });

    // Rol EMPLEADO: solo puede editar su propio perfil con campos limitados
    let datosActualizar = req.body;
    if (!puedeEditarTotal) {
      const empleadoIdDelUsuario = req.usuario?.empleado_id;
      if (String(empleadoIdDelUsuario) !== String(id)) {
        return res.status(403).json({ error: "Solo puedes editar tu propio perfil" });
      }
      // Mezclar: conservar datos actuales, solo sobreescribir los campos permitidos
      datosActualizar = {
        ...empleadoActual,
        nombre:   req.body.nombre   ?? empleadoActual.nombre,
        apellido: req.body.apellido ?? empleadoActual.apellido,
        correo:   req.body.correo   ?? empleadoActual.correo,
        celular:  req.body.celular  ?? empleadoActual.celular,
      };
    }

    const errorValidacion = validarEmpleado(datosActualizar, true);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    // ── Auto-historial al cambiar cargo ──────────────────────────────────────
    // Solo aplica cuando ADMIN/RRHH cambia el cargo y el empleado ya tenía uno.
    const cargoAnterior = empleadoActual.cargo_id;
    const cargoNuevo    = datosActualizar.cargo_id;
    if (
      puedeEditarTotal &&
      cargoAnterior &&
      String(cargoAnterior) !== String(cargoNuevo)
    ) {
      const hoy = new Date().toISOString().split("T")[0];

      // Buscar si hay un registro abierto (sin fecha_fin) para cerrar su período
      const registroAbierto = await historialService.obtenerRegistroAbierto(Number(id));

      if (registroAbierto) {
        // Cerrar el período actual actualizando su fecha_fin
        await historialService.actualizarHistorial(registroAbierto.id, {
          cargo_id:         registroAbierto.cargo_id,
          tipo_contrato_id: registroAbierto.tipo_contrato_id,
          salario:          registroAbierto.salario,
          fecha_inicio:     toDateStr(registroAbierto.fecha_inicio),
          fecha_fin:        hoy,
          motivo:           registroAbierto.motivo || "Cambio de cargo",
        });
      } else {
        // Sin historial abierto → encadenar desde la fecha_fin del último registro cerrado
        // (si no hay ninguno, usar fecha_ingreso como punto de partida)
        const ultimoRegistro = await historialService.obtenerUltimoRegistro(Number(id));
        const fechaInicioNueva = ultimoRegistro?.fecha_fin
          ? toDateStr(ultimoRegistro.fecha_fin)
          : toDateStr(empleadoActual.fecha_ingreso);

        await historialService.crearHistorial({
          empleado_id:      Number(id),
          cargo_id:         empleadoActual.cargo_id,
          tipo_contrato_id: empleadoActual.tipo_contrato_id,
          salario:          empleadoActual.salario,
          fecha_inicio:     fechaInicioNueva,
          fecha_fin:        hoy,
          motivo:           "Cambio de cargo",
        });
      }

      // Crear registro abierto para el nuevo cargo (queda como "Actual" en el historial)
      await historialService.crearHistorial({
        empleado_id:      Number(id),
        cargo_id:         Number(datosActualizar.cargo_id),
        tipo_contrato_id: datosActualizar.tipo_contrato_id,
        salario:          datosActualizar.salario,
        fecha_inicio:     hoy,
        fecha_fin:        null,
        motivo:           null,
      });
    }

    await empleadoService.actualizarEmpleado(id, datosActualizar);
    const empleadoActualizado = await empleadoService.obtenerEmpleadoCompleto(id);

    auditoria.registrar({
      tabla: "tb_empleados",
      registroId: Number(id),
      accion: "UPDATE",
      antes:   empleadoActual,
      despues: empleadoActualizado,
      usuarioId: req.usuario?.id || null,
      ip: req.ip,
    });

    res.json(empleadoActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarEmpleado = async (req, res) => {
  try {
    if (!tienePermiso(req, "empleados:desactivar")) {
      return res.status(403).json({ error: "No tienes permiso para eliminar empleados" });
    }

    const { id } = req.params;

    // Capturar datos antes de eliminar para el registro de auditoría
    const empleadoAntes = await empleadoService.obtenerEmpleadoCompleto(id);
    const resultado = await empleadoService.eliminarEmpleado(id);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    auditoria.registrar({
      tabla: "tb_empleados",
      registroId: Number(id),
      accion: "DELETE",
      antes: empleadoAntes,
      usuarioId: req.usuario?.id || null,
      ip: req.ip,
    });

    res.json({ message: "Empleado eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarEstadoMasivo = async (req, res) => {
  try {
    if (!tienePermiso(req, "empleados:desactivar")) {
      return res.status(403).json({ error: "No tienes permiso para cambiar el estado de empleados" });
    }

    const { empleadosIds, estado_empleado_id } = req.body;

    if (!Array.isArray(empleadosIds) || empleadosIds.length === 0) {
      return res.status(400).json({ error: "No hay empleados seleccionados" });
    }
    if (!estado_empleado_id) {
      return res.status(400).json({ error: "Estado requerido" });
    }

    await empleadoService.actualizarEstadoMasivo(empleadosIds, estado_empleado_id);

    auditoria.registrar({
      tabla: "tb_empleados",
      registroId: 0,
      accion: "UPDATE",
      antes:   { ids: empleadosIds },
      despues: { ids: empleadosIds, estado_empleado_id },
      usuarioId: req.usuario?.id || null,
      ip: req.ip,
    });

    res.json({ message: "Estados actualizados" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verificarDocumento = async (req, res) => {
  try {
    const { documento, empleadoId } = req.params;
    const resultado = await empleadoService.verificarDocumento(documento, empleadoId || null);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  actualizarEstadoMasivo,
  verificarDocumento,
};
