const express = require("express");
const { obtenerLaboral, actualizarLaboral, obtenerEmpresa, actualizarEmpresa } = require("../controllers/configuracion.controller");

const router = express.Router();

router.get("/laboral",  obtenerLaboral);
router.put("/laboral",  actualizarLaboral);
router.get("/empresa",  obtenerEmpresa);
router.put("/empresa",  actualizarEmpresa);

module.exports = router;
