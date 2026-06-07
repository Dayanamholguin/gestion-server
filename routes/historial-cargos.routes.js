const express = require("express");
const {
  obtenerHistorial,
  crearHistorial,
  actualizarHistorial,
  eliminarHistorial,
  reordenarHistorial,
} = require("../controllers/historial-cargos.controller");

const router = express.Router();

router.get("/empleado/:empleadoId", obtenerHistorial);
router.post("/", crearHistorial);
router.put("/reorder", reordenarHistorial);
router.put("/:id", actualizarHistorial);
router.delete("/:id", eliminarHistorial);

module.exports = router;
