const express = require("express");
const {
  obtenerExperiencia,
  crearExperiencia,
  actualizarExperiencia,
  eliminarExperiencia,
  reordenarExperiencia,
} = require("../controllers/experiencia-laboral.controller");

const router = express.Router();

router.get("/empleado/:empleadoId", obtenerExperiencia);
router.post("/", crearExperiencia);
router.put("/reorder", reordenarExperiencia);
router.put("/:id", actualizarExperiencia);
router.delete("/:id", eliminarExperiencia);

module.exports = router;
