const express = require("express");
const {
  obtenerEstudios,
  crearEstudio,
  actualizarEstudio,
  eliminarEstudio,
  actualizarOrdenEstudios,
} = require("../controllers/estudios.controller");

const router = express.Router();

router.get("/empleado/:empleadoId", obtenerEstudios);
router.put("/empleado/:empleadoId/orden", actualizarOrdenEstudios);
router.post("/", crearEstudio);
router.put("/:id", actualizarEstudio);
router.delete("/:id", eliminarEstudio);

module.exports = router;
