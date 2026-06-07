const estudiosService = require("../services/estudios.service");
const { validarEstudio } = require("../validations/estudios.validation");

const actualizarOrdenEstudios = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { ordenes } = req.body;
    if (!Array.isArray(ordenes)) return res.status(400).json({ error: "ordenes debe ser un arreglo" });
    await estudiosService.actualizarOrdenEstudios(empleadoId, ordenes);
    res.json({ message: "Orden actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerEstudios = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const estudios = await estudiosService.obtenerEstudiosPorEmpleado(empleadoId);
    res.json(estudios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearEstudio = async (req, res) => {
  try {
    const errorValidacion = validarEstudio(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const resultado = await estudiosService.crearEstudio(req.body);
    res.status(201).json({ id: resultado.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarEstudio = async (req, res) => {
  try {
    const { id } = req.params;
    const errorValidacion = validarEstudio(req.body, true);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    await estudiosService.actualizarEstudio(id, req.body);
    res.json({ message: "Estudio actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarEstudio = async (req, res) => {
  try {
    const { id } = req.params;
    await estudiosService.eliminarEstudio(id);
    res.json({ message: "Estudio eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerEstudios, crearEstudio, actualizarEstudio, eliminarEstudio, actualizarOrdenEstudios };
