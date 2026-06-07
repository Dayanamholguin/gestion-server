/**
 * auth.service.js
 *
 * Lógica de autenticación:
 *  - login: valida credenciales, carga permisos del rol y emite JWT
 *  - cambiarPassword: actualiza el hash de contraseña
 */

const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Intenta autenticar al usuario con correo + password.
 * Retorna { token, usuario } o null si las credenciales no son válidas.
 */
const login = (correo, password) => {
  return new Promise((resolve, reject) => {
    // JOIN para obtener nombre del rol + permisos concatenados
    const sql = `
      SELECT
        u.*,
        r.nombre AS rol_nombre,
        GROUP_CONCAT(p.nombre ORDER BY p.nombre SEPARATOR ',') AS permisos_raw
      FROM tb_usuarios u
      JOIN tb_roles r ON u.rol_id = r.id
      LEFT JOIN tb_roles_permisos rp ON rp.rol_id = r.id
      LEFT JOIN tb_permisos p ON p.id = rp.permiso_id
      WHERE u.correo = ? AND u.activo = 1
      GROUP BY u.id
    `;

    db.query(sql, [correo], async (err, rows) => {
      if (err) return reject(err);
      if (!rows.length) return resolve(null);

      const user = rows[0];
      const passwordOk = await bcrypt.compare(password, user.password_hash);
      if (!passwordOk) return resolve(null);

      const permisos = user.permisos_raw ? user.permisos_raw.split(",") : [];

      const payload = {
        id:          user.id,
        nombre:      user.nombre,
        apellido:    user.apellido,
        correo:      user.correo,
        rol_id:      user.rol_id,
        rol:         user.rol_nombre,
        empleado_id: user.empleado_id,
        permisos,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      });

      // Actualizar último acceso (fire-and-forget)
      db.query("UPDATE tb_usuarios SET ultimo_acceso = NOW() WHERE id = ?", [user.id]);

      resolve({ token, usuario: payload });
    });
  });
};

/**
 * Cambia la contraseña de un usuario.
 * Retorna true si se actualizó, false si el id no existe.
 */
const cambiarPassword = async (usuarioId, nuevaPassword) => {
  const hash = await bcrypt.hash(nuevaPassword, 10);
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE tb_usuarios SET password_hash = ? WHERE id = ?",
      [hash, usuarioId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      },
    );
  });
};

module.exports = { login, cambiarPassword };
