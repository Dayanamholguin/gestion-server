const express = require("express");
const { obtenerEmpresas, crearEmpresa, actualizarEmpresa } = require("../controllers/empresas.controller");

const router = express.Router();

router.get("/", obtenerEmpresas);
router.post("/", crearEmpresa);
router.put("/:id", actualizarEmpresa);

module.exports = router;
