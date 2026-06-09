const db = require("../db");

const listar = (filtros = {}) =>
  new Promise((resolve, reject) => {
    let sql = `
      SELECT
        v.*,
        CONCAT(e.nombre, ' ', e.apellido) AS empleado_nombre,
        e.documento                        AS empleado_documento,
        c.nombre                           AS cargo_nombre,
        CONCAT(ur.nombre, ' ', ur.apellido) AS revisado_por_nombre
      FROM tb_vacaciones v
      JOIN  tb_empleados e  ON v.empleado_id  = e.id
      LEFT JOIN tb_cargos c ON e.cargo_id     = c.id
      LEFT JOIN tb_usuarios ur ON v.revisado_por = ur.id
      WHERE v.estado_registro = 1
    `;
    const params = [];
    if (filtros.empleado_id) { sql += " AND v.empleado_id = ?"; params.push(filtros.empleado_id); }
    if (filtros.estado)      { sql += " AND v.estado = ?";      params.push(filtros.estado); }
    sql += " ORDER BY v.created_at DESC";
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

const obtenerPorId = (id) =>
  new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM tb_vacaciones WHERE id = ? AND estado_registro = 1",
      [id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });

const crear = ({ empleado_id, fecha_inicio, fecha_fin, observaciones }) =>
  new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO tb_vacaciones (empleado_id, fecha_inicio, fecha_fin, observaciones)
       VALUES (?, ?, ?, ?)`,
      [empleado_id, fecha_inicio, fecha_fin, observaciones || null],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });

const actualizarEstado = (id, { estado, revisado_por, motivo_rechazo }) =>
  new Promise((resolve, reject) => {
    db.query(
      `UPDATE tb_vacaciones
       SET estado = ?, revisado_por = ?, fecha_revision = NOW(), motivo_rechazo = ?
       WHERE id = ? AND estado_registro = 1`,
      [estado, revisado_por, motivo_rechazo || null, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      }
    );
  });

const cancelar = (id, empleado_id) =>
  new Promise((resolve, reject) => {
    db.query(
      `UPDATE tb_vacaciones
       SET estado_registro = 0
       WHERE id = ? AND empleado_id = ? AND estado = 'Pendiente' AND estado_registro = 1`,
      [id, empleado_id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      }
    );
  });

module.exports = { listar, obtenerPorId, crear, actualizarEstado, cancelar };
