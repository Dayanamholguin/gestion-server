const express = require("express");
const { obtenerUniversidades, crearUniversidad, actualizarUniversidad } = require("../controllers/universidades.controller");
const router = express.Router();

router.get("/", obtenerUniversidades);
router.post("/", crearUniversidad);
router.put("/:id", actualizarUniversidad);

module.exports = router;
