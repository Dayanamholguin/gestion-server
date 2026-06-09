const svc = require("../services/configuracion.service");

const soloAdmin = (req, res) => {
  const u = req.usuario;
  if (!u.permisos.includes("*") && u.rol !== "ADMIN") {
    res.status(403).json({ error: "Solo el ADMIN puede modificar esta configuración" });
    return false;
  }
  return true;
};

// GET /configuracion/laboral — todos los usuarios autenticados
const obtenerLaboral = async (req, res) => {
  try {
    const config = await svc.obtenerLaboral();
    if (!config) return res.status(404).json({ error: "Configuración no encontrada" });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /configuracion/laboral — solo ADMIN
const actualizarLaboral = async (req, res) => {
  if (!soloAdmin(req, res)) return;
  const campos = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  const datos = {};
  for (const c of campos) datos[c] = req.body[c] ? 1 : 0;
  try {
    await svc.actualizarLaboral(datos);
    res.json({ message: "Configuración actualizada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /configuracion/empresa — todos los usuarios autenticados
const obtenerEmpresa = async (req, res) => {
  try {
    res.json(await svc.obtenerEmpresa());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /configuracion/empresa — solo ADMIN
const actualizarEmpresa = async (req, res) => {
  if (!soloAdmin(req, res)) return;
  const { nombre, nit } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: "El nombre de la empresa es obligatorio" });
  try {
    res.json(await svc.actualizarEmpresa({ nombre: nombre.trim(), nit }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { obtenerLaboral, actualizarLaboral, obtenerEmpresa, actualizarEmpresa };
