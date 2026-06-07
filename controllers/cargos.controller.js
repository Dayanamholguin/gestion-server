const cargoService = require("../services/cargos.service");
const { validarCargo } = require("../validations/cargos.validation");

const obtenerCargos = async (req, res) => {
  try {
    const all = req.query.all === "true";
    const cargos = await cargoService.obtenerCargos(all);
    res.json(cargos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearCargo = async (req, res) => {
  try {
    const errorValidacion = validarCargo(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }
    const resultado = await cargoService.crearCargo(req.body);
    res.status(201).json({ id: resultado.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarCargo = async (req, res) => {
  try {
    const { id } = req.params;
    const errorValidacion = validarCargo(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }
    await cargoService.actualizarCargo(id, req.body);
    res.json({ id: Number(id), ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerCargos, crearCargo, actualizarCargo };
