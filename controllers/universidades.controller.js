const universidadService = require("../services/universidades.service");
const { validarUniversidad } = require("../validations/universidades.validation");

const obtenerUniversidades = async (req, res) => {
  try {
    const all = req.query.all === "true";
    const universidades = await universidadService.obtenerUniversidades(all);
    res.json(universidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearUniversidad = async (req, res) => {
  try {
    const errorValidacion = validarUniversidad(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });
    const resultado = await universidadService.crearUniversidad(req.body);
    const universidad = await universidadService.obtenerUniversidadById(resultado.insertId);
    res.status(201).json(universidad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarUniversidad = async (req, res) => {
  try {
    const { id } = req.params;
    const errorValidacion = validarUniversidad(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });
    await universidadService.actualizarUniversidad(id, req.body);
    const universidad = await universidadService.obtenerUniversidadById(id);
    res.json(universidad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerUniversidades, crearUniversidad, actualizarUniversidad };
