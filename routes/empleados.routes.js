const express = require("express");
const {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEstadoMasivo,
  actualizarEmpleado,
  eliminarEmpleado,
  verificarDocumento,
  descargarPlantilla,
  importarEmpleados,
} = require("../controllers/empleados.controller");
const checkPermiso = require("../middleware/checkPermiso");

const router = express.Router();

// Rutas específicas antes de paramétricas
router.get("/plantilla",                         checkPermiso("empleados:crear"), descargarPlantilla);
router.post("/importar",                         checkPermiso("empleados:crear"), importarEmpleados);
router.get("/documento/:documento",              verificarDocumento);
router.get("/documento/:documento/:empleadoId",  verificarDocumento);
router.put("/estado-masivo", checkPermiso("empleados:desactivar"), actualizarEstadoMasivo);

router.get("/",    checkPermiso("empleados:listar"),  obtenerEmpleados);
router.post("/",   checkPermiso("empleados:crear"),   crearEmpleado);
// PUT /:id: lógica de permiso manejada en el controller (editar_total vs editar_propio)
router.put("/:id",    actualizarEmpleado);
router.delete("/:id", checkPermiso("empleados:desactivar"), eliminarEmpleado);

module.exports = router;
