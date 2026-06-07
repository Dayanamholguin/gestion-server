const empresaService = require("../services/empresas.service");
const { validarEmpresa } = require("../validations/empresas.validation");

const obtenerEmpresas = async (req, res) => {
  try {
    const all = req.query.all === "true";
    const empresas = await empresaService.obtenerEmpresas(all);
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearEmpresa = async (req, res) => {
  try {
    const errorValidacion = validarEmpresa(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    const resultado = await empresaService.crearEmpresa(req.body);
    const empresa = await empresaService.obtenerEmpresaById(resultado.insertId);

    res.status(201).json(empresa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const errorValidacion = validarEmpresa(req.body);
    if (errorValidacion) return res.status(400).json({ error: errorValidacion });

    await empresaService.actualizarEmpresa(id, req.body);
    const empresa = await empresaService.obtenerEmpresaById(id);

    res.json(empresa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerEmpresas, crearEmpresa, actualizarEmpresa };
