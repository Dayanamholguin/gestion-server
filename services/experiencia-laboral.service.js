const db = require("../db");

const obtenerExperienciaPorEmpleado = (empleadoId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM tb_experiencia_laboral WHERE empleado_id = ? AND estado = 1 ORDER BY orden ASC, fecha_inicio DESC",
      [empleadoId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      },
    );
  });
};

const reordenarExperiencia = (items) =>
  Promise.all(
    items.map((item, idx) =>
      new Promise((resolve, reject) => {
        db.query(
          "UPDATE tb_experiencia_laboral SET orden = ? WHERE id = ?",
          [idx, item.id],
          (err) => (err ? reject(err) : resolve())
        );
      })
    )
  );

const crearExperiencia = (exp) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_experiencia_laboral
        (empleado_id, empresa, cargo, fecha_inicio, fecha_fin, descripcion)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [exp.empleado_id, exp.empresa, exp.cargo, exp.fecha_inicio, exp.fecha_fin || null, exp.descripcion || null],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const actualizarExperiencia = (id, exp) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tb_experiencia_laboral
      SET empresa=?, cargo=?, fecha_inicio=?, fecha_fin=?, descripcion=?
      WHERE id=?
    `;
    db.query(
      sql,
      [exp.empresa, exp.cargo, exp.fecha_inicio, exp.fecha_fin || null, exp.descripcion || null, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const eliminarExperiencia = (id) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE tb_experiencia_laboral SET estado = 0 WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = { obtenerExperienciaPorEmpleado, crearExperiencia, actualizarExperiencia, eliminarExperiencia, reordenarExperiencia };
