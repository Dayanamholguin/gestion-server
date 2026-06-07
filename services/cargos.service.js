const db = require("../db");

const obtenerCargos = (all = false) => {
  return new Promise((resolve, reject) => {
    const sql = all
      ? "SELECT * FROM tb_cargos ORDER BY nombre"
      : "SELECT * FROM tb_cargos WHERE estado = 1 ORDER BY nombre";
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const crearCargo = (cargo) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_cargos (nombre, descripcion, estado)
      VALUES (?, ?, ?)
    `;
    db.query(
      sql,
      [cargo.nombre, cargo.descripcion, cargo.estado],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const actualizarCargo = (id, cargo) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tb_cargos
      SET nombre=?, descripcion=?, estado=?
      WHERE id=?
    `;
    db.query(
      sql,
      [cargo.nombre, cargo.descripcion, cargo.estado, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

module.exports = { obtenerCargos, crearCargo, actualizarCargo };
