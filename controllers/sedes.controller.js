const svc = require("../services/sedes.service");

const soloAdmin = (req, res) => {
  const u = req.usuario;
  if (!u.permisos.includes("*") && u.rol !== "ADMIN") {
    res.status(403).json({ error: "Solo el ADMIN puede gestionar sedes" });
    return false;
  }
  return true;
};

// GET /sedes  (todos los autenticados)
const listar = async (req, res) => {
  try {
    const soloActivas = req.query.activas === "true";
    res.json(await svc.obtenerTodas(soloActivas));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /sedes  (ADMIN)
const crear = async (req, res) => {
  if (!soloAdmin(req, res)) return;
  const { nombre, departamento, ciudad, direccion } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: "El nombre es obligatorio" });
  try {
    res.status(201).json(await svc.crear({ nombre: nombre.trim(), departamento, ciudad, direccion }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /sedes/:id  (ADMIN)
const actualizar = async (req, res) => {
  if (!soloAdmin(req, res)) return;
  const { nombre, departamento, ciudad, direccion, activo } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: "El nombre es obligatorio" });
  try {
    res.json(await svc.actualizar(req.params.id, {
      nombre: nombre.trim(), departamento, ciudad, direccion, activo: activo ? 1 : 0,
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /sedes/:id  (ADMIN — soft delete)
const desactivar = async (req, res) => {
  if (!soloAdmin(req, res)) return;
  try {
    await svc.desactivar(req.params.id);
    res.json({ message: "Sede desactivada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, crear, actualizar, desactivar };
