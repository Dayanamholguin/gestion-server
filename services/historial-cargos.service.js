const db = require("../db");

const obtenerHistorialPorEmpleado = (empleadoId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT h.*,
        c.nombre AS cargo_nombre,
        tc.nombre AS tipo_contrato_nombre
      FROM tb_historial_cargos h
      LEFT JOIN tb_cargos c ON h.cargo_id = c.id
      LEFT JOIN tb_tipos_contrato tc ON h.tipo_contrato_id = tc.id
      WHERE h.empleado_id = ? AND h.estado = 1
      ORDER BY h.orden ASC, (h.fecha_fin IS NULL) DESC, h.fecha_inicio DESC
    `;
    db.query(sql, [empleadoId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const reordenarHistorial = (items) =>
  Promise.all(
    items.map((item, idx) =>
      new Promise((resolve, reject) => {
        db.query(
          "UPDATE tb_historial_cargos SET orden = ? WHERE id = ?",
          [idx, item.id],
          (err) => (err ? reject(err) : resolve())
        );
      })
    )
  );

const crearHistorial = (historial) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_historial_cargos
        (empleado_id, cargo_id, tipo_contrato_id, salario, fecha_inicio, fecha_fin, motivo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        historial.empleado_id,
        historial.cargo_id,
        historial.tipo_contrato_id,
        historial.salario,
        historial.fecha_inicio,
        historial.fecha_fin || null,
        historial.motivo || null,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const actualizarHistorial = (id, historial) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tb_historial_cargos
      SET cargo_id=?, tipo_contrato_id=?, salario=?, fecha_inicio=?, fecha_fin=?, motivo=?
      WHERE id=?
    `;
    db.query(
      sql,
      [
        historial.cargo_id,
        historial.tipo_contrato_id,
        historial.salario,
        historial.fecha_inicio,
        historial.fecha_fin || null,
        historial.motivo || null,
        id,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const eliminarHistorial = (id) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE tb_historial_cargos SET estado = 0 WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Devuelve el registro más reciente sin fecha_fin (el cargo actual abierto)
const obtenerRegistroAbierto = (empleadoId) =>
  new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM tb_historial_cargos
       WHERE empleado_id = ? AND fecha_fin IS NULL AND estado = 1
       ORDER BY fecha_inicio DESC
       LIMIT 1`,
      [empleadoId],
      (err, rows) => (err ? reject(err) : resolve(rows[0] || null))
    );
  });

// Devuelve el registro más reciente (abierto o cerrado) para encadenar períodos
const obtenerUltimoRegistro = (empleadoId) =>
  new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM tb_historial_cargos
       WHERE empleado_id = ? AND estado = 1
       ORDER BY fecha_inicio DESC
       LIMIT 1`,
      [empleadoId],
      (err, rows) => (err ? reject(err) : resolve(rows[0] || null))
    );
  });

module.exports = {
  obtenerHistorialPorEmpleado,
  crearHistorial,
  actualizarHistorial,
  eliminarHistorial,
  obtenerRegistroAbierto,
  obtenerUltimoRegistro,
  reordenarHistorial,
};
