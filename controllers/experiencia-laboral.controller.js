const experienciaService = require("../services/experiencia-laboral.service");
const { validarExperiencia } = require("../validations/experiencia-laboral.validation");

const obtenerExperiencia = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const experiencia = await experienciaService.obtenerExperienciaPorEmpleado(empleadoId);
    res.json(experiencia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearExperiencia = async (req, res) => {
  try {
    const errorValidacion = validarExperiencia(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const resultado = await experienciaService.crearExperiencia(req.body);
    res.status(201).json({ id: resultado.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarExperiencia = async (req, res) => {
  try {
    const { id } = req.params;
    const errorValidacion = validarExperiencia(req.body, true);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    await experienciaService.actualizarExperiencia(id, req.body);
    res.json({ message: "Experiencia actualizada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarExperiencia = async (req, res) => {
  try {
    const { id } = req.params;
    await experienciaService.eliminarExperiencia(id);
    res.json({ message: "Experiencia eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reordenarExperiencia = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "items requeridos" });
    await experienciaService.reordenarExperiencia(items);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerExperiencia, crearExperiencia, actualizarExperiencia, eliminarExperiencia, reordenarExperiencia };
