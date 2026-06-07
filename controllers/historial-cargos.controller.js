const historialService = require("../services/historial-cargos.service");
const { validarHistorialCargo } = require("../validations/historial-cargos.validation");

const obtenerHistorial = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const historial = await historialService.obtenerHistorialPorEmpleado(empleadoId);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearHistorial = async (req, res) => {
  try {
    const errorValidacion = validarHistorialCargo(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const resultado = await historialService.crearHistorial(req.body);
    res.status(201).json({ id: resultado.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const errorValidacion = validarHistorialCargo(req.body, true);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    await historialService.actualizarHistorial(id, req.body);
    res.json({ message: "Historial actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    await historialService.eliminarHistorial(id);
    res.json({ message: "Registro eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reordenarHistorial = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "items requeridos" });
    await historialService.reordenarHistorial(items);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerHistorial, crearHistorial, actualizarHistorial, eliminarHistorial, reordenarHistorial };
