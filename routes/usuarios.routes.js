const express    = require("express");
const checkPermiso = require("../middleware/checkPermiso");
const {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
} = require("../controllers/usuarios.controller");

const router = express.Router();

router.get("/",           checkPermiso("usuarios:listar"),    listarUsuarios);
router.post("/",          checkPermiso("usuarios:crear"),     crearUsuario);
router.put("/:id",        checkPermiso("usuarios:editar"),    actualizarUsuario);
router.put("/:id/estado", checkPermiso("usuarios:desactivar"), cambiarEstadoUsuario);

module.exports = router;
