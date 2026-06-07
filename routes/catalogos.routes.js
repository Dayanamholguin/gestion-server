const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/tipos-contrato", (req, res) => {
  db.query("SELECT * FROM tb_tipos_contrato", (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener tipos de contrato" });
    res.json(results);
  });
});

router.get("/estados-empleado", (req, res) => {
  db.query("SELECT * FROM tb_estados_empleado", (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener estados" });
    res.json(results);
  });
});

router.get("/nivel-educativo", (req, res) => {
  db.query("SELECT * FROM tb_nivel_educativo", (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener niveles educativos" });
    res.json(results);
  });
});

module.exports = router;
