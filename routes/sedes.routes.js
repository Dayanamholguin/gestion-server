const express = require("express");
const { listar, crear, actualizar, desactivar } = require("../controllers/sedes.controller");

const router = express.Router();

router.get("/",       listar);
router.post("/",      crear);
router.put("/:id",    actualizar);
router.delete("/:id", desactivar);

module.exports = router;
