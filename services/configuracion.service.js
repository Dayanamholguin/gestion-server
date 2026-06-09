const db = require("../db");

// ── Días laborales ─────────────────────────────────────────────────────────────
const obtenerLaboral = () =>
  new Promise((resolve, reject) => {
    db.query("SELECT * FROM tb_configuracion_laboral WHERE id = 1", (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0] ?? null);
    });
  });

const actualizarLaboral = ({ lunes, martes, miercoles, jueves, viernes, sabado, domingo }) =>
  new Promise((resolve, reject) => {
    db.query(
      `UPDATE tb_configuracion_laboral
          SET lunes=?, martes=?, miercoles=?, jueves=?, viernes=?, sabado=?, domingo=?
        WHERE id = 1`,
      [lunes, martes, miercoles, jueves, viernes, sabado, domingo],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });

// ── Empresa principal ──────────────────────────────────────────────────────────
const obtenerEmpresa = () =>
  new Promise((resolve, reject) => {
    db.query("SELECT * FROM tb_empresa_config WHERE id = 1", (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0] ?? { id: 1, nombre: "Empresa COL", nit: null });
    });
  });

const actualizarEmpresa = ({ nombre, nit }) =>
  new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO tb_empresa_config (id, nombre, nit) VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), nit = VALUES(nit)`,
      [nombre, nit || null],
      (err) => {
        if (err) return reject(err);
        resolve({ id: 1, nombre, nit: nit || null });
      }
    );
  });

module.exports = { obtenerLaboral, actualizarLaboral, obtenerEmpresa, actualizarEmpresa };
