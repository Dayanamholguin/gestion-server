const usuariosService = require("../services/usuarios.service");
const { registrar }   = require("../services/auditoria.service");

const listarUsuarios = async (req, res) => {
  try {
    const lista = await usuariosService.listar();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const crearUsuario = async (req, res) => {
  const { nombre, apellido, correo, password, rol_id, empleado_id } = req.body;

  if (!nombre?.trim() || !apellido?.trim() || !correo?.trim() || !password || !rol_id) {
    return res.status(400).json({ error: "nombre, apellido, correo, contraseña y rol son requeridos" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }
  if (Number(rol_id) === 3) {
    return res.status(400).json({ error: "El rol EMPLEADO se asigna automáticamente al registrar un empleado" });
  }

  try {
    const id = await usuariosService.crear({ nombre, apellido, correo, password, rol_id, empleado_id });
    registrar({
      tabla: "tb_usuarios", registroId: id, accion: "CREATE",
      datos_nuevos: { nombre, apellido, correo, rol_id },
      usuarioId: req.usuario?.id, ip: req.ip,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    res.status(500).json({ error: err.message });
  }
};

const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo, rol_id, empleado_id, activo, password } = req.body;

  if (!nombre?.trim() || !apellido?.trim() || !correo?.trim() || !rol_id) {
    return res.status(400).json({ error: "nombre, apellido, correo y rol son requeridos" });
  }
  if (password && password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const antes = await usuariosService.obtenerPorId(id);
    if (!antes) return res.status(404).json({ error: "Usuario no encontrado" });

    // El rol de un EMPLEADO no se puede cambiar manualmente
    if (antes.rol_id === 3 && Number(rol_id) !== 3) {
      return res.status(400).json({ error: "El rol de un usuario EMPLEADO no puede modificarse" });
    }
    // No se puede asignar rol EMPLEADO desde este módulo
    if (antes.rol_id !== 3 && Number(rol_id) === 3) {
      return res.status(400).json({ error: "El rol EMPLEADO se asigna automáticamente al registrar un empleado" });
    }

    await usuariosService.actualizar(id, {
      nombre, apellido, correo, rol_id, empleado_id,
      activo: activo !== undefined ? activo : antes.activo,
      password: password || null,
    });

    registrar({
      tabla: "tb_usuarios", registroId: id, accion: "UPDATE",
      datos_anteriores: { nombre: antes.nombre, apellido: antes.apellido, correo: antes.correo, rol_id: antes.rol_id },
      datos_nuevos: { nombre, apellido, correo, rol_id, activo },
      usuarioId: req.usuario?.id, ip: req.ip,
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    res.status(500).json({ error: err.message });
  }
};

const cambiarEstadoUsuario = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (Number(id) === req.usuario?.id) {
    return res.status(400).json({ error: "No puedes desactivar tu propia cuenta" });
  }

  try {
    await usuariosService.cambiarEstado(id, activo ? 1 : 0);
    registrar({
      tabla: "tb_usuarios", registroId: id, accion: "UPDATE",
      datos_nuevos: { activo: activo ? 1 : 0 },
      usuarioId: req.usuario?.id, ip: req.ip,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario, cambiarEstadoUsuario };
