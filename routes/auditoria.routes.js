const express      = require("express");
const checkPermiso = require("../middleware/checkPermiso");
const { listarAuditoria } = require("../controllers/auditoria.controller");

const router = express.Router();

router.get("/", checkPermiso("auditoria:ver"), listarAuditoria);

module.exports = router;
