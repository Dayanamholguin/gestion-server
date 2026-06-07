const express = require("express");

const {
  obtenerCargos,
  crearCargo,
  actualizarCargo,
} = require("../controllers/cargos.controller");

const router = express.Router();

router.get("/", obtenerCargos);
router.post("/", crearCargo);
router.put("/:id", actualizarCargo);

module.exports = router;
