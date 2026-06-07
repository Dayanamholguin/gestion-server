const db = require("../db");
const bcrypt = require("bcryptjs");

const listar = () =>
  new Promise((resolve, reject) => {
    const sql = `
      SELECT u.id, u.nombre, u.apellido, u.correo, u.activo,
             u.ultimo_acceso, u.created_at,
             r.id  AS rol_id,
             r.nombre AS rol,
             u.empleado_id,
             CONCAT(e.nombre, ' ', e.apellido) AS empleado_nombre
      FROM tb_usuarios u
      INNER JOIN tb_roles r ON u.rol_id = r.id
      LEFT  JOIN tb_empleados e ON u.empleado_id = e.id
      ORDER BY u.created_at DESC
    `;
    db.query(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

const obtenerPorId = (id) =>
  new Promise((resolve, reject) => {
    const sql = `
      SELECT u.id, u.nombre, u.apellido, u.correo, u.activo,
             u.rol_id, u.empleado_id,
             r.nombre AS rol
      FROM tb_usuarios u
      INNER JOIN tb_roles r ON u.rol_id = r.id
      WHERE u.id = ?
    `;
    db.query(sql, [id], (err, rows) =>
      err ? reject(err) : resolve(rows[0] || null)
    );
  });

const crear = async ({ nombre, apellido, correo, password, rol_id, empleado_id = null }) => {
  const hash = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO tb_usuarios (nombre, apellido, correo, password_hash, rol_id, empleado_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre.trim(), apellido.trim(), correo.toLowerCase().trim(), hash, rol_id, empleado_id || null],
      (err, result) => (err ? reject(err) : resolve(result.insertId))
    );
  });
};

const actualizar = async (id, { nombre, apellido, correo, rol_id, empleado_id, activo, password }) => {
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE tb_usuarios
         SET nombre=?, apellido=?, correo=?, rol_id=?, empleado_id=?, activo=?, password_hash=?
         WHERE id=?`,
        [nombre.trim(), apellido.trim(), correo.toLowerCase().trim(), rol_id, empleado_id || null, activo, hash, id],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE tb_usuarios
       SET nombre=?, apellido=?, correo=?, rol_id=?, empleado_id=?, activo=?
       WHERE id=?`,
      [nombre.trim(), apellido.trim(), correo.toLowerCase().trim(), rol_id, empleado_id || null, activo, id],
      (err) => (err ? reject(err) : resolve())
    );
  });
};

const cambiarEstado = (id, activo) =>
  new Promise((resolve, reject) => {
    db.query(
      `UPDATE tb_usuarios SET activo=? WHERE id=?`,
      [activo, id],
      (err) => (err ? reject(err) : resolve())
    );
  });

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarEstado };
