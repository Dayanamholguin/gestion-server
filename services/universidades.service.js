const db = require("../db");

const obtenerUniversidades = (all = false) => {
  return new Promise((resolve, reject) => {
    const sql = all
      ? "SELECT * FROM tb_universidades ORDER BY nombre"
      : "SELECT * FROM tb_universidades WHERE estado = 1 ORDER BY nombre";
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const obtenerUniversidadById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM tb_universidades WHERE id = ?", [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};

const crearUniversidad = (uni) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO tb_universidades (nombre) VALUES (?)",
      [uni.nombre],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const actualizarUniversidad = (id, uni) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE tb_universidades SET nombre=?, estado=? WHERE id=?",
      [uni.nombre, uni.estado ?? 1, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

module.exports = { obtenerUniversidades, obtenerUniversidadById, crearUniversidad, actualizarUniversidad };
