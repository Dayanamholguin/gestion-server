const express = require("express");
const { listar, crear, cambiarEstado, cancelar } = require("../controllers/vacaciones.controller");

const router = express.Router();

router.get("/",           listar);        // gestor: todas; empleado: propias
router.post("/",          crear);         // empleado crea su solicitud
router.put("/:id/estado", cambiarEstado); // aprobar / rechazar (validación de rol en controller)
router.delete("/:id",     cancelar);      // empleado cancela pendiente

module.exports = router;
