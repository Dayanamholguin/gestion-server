const db = require("../db");

const obtenerTodas = (soloActivas = false) =>
  new Promise((resolve, reject) => {
    const sql = soloActivas
      ? "SELECT * FROM tb_sedes WHERE activo = 1 ORDER BY nombre"
      : "SELECT * FROM tb_sedes ORDER BY activo DESC, nombre ASC";
    db.query(sql, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const crear = ({ nombre, departamento, ciudad, direccion }) =>
  new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO tb_sedes (nombre, ciudad, departamento, direccion) VALUES (?, ?, ?, ?)",
      [nombre, ciudad || null, departamento || null, direccion || null],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, nombre, departamento: departamento || null, ciudad: ciudad || null, direccion: direccion || null, activo: 1 });
      }
    );
  });

const actualizar = (id, { nombre, departamento, ciudad, direccion, activo }) =>
  new Promise((resolve, reject) => {
    db.query(
      "UPDATE tb_sedes SET nombre = ?, departamento = ?, ciudad = ?, direccion = ?, activo = ? WHERE id = ?",
      [nombre, departamento || null, ciudad || null, direccion || null, activo ?? 1, id],
      (err) => {
        if (err) return reject(err);
        resolve({ id: Number(id), nombre, departamento: departamento || null, ciudad: ciudad || null, direccion: direccion || null, activo });
      }
    );
  });

const desactivar = (id) =>
  new Promise((resolve, reject) => {
    db.query("UPDATE tb_sedes SET activo = 0 WHERE id = ?", [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

module.exports = { obtenerTodas, crear, actualizar, desactivar };
