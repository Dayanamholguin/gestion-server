/**
 * auditoria.service.js
 *
 * Registra operaciones CREATE / UPDATE / DELETE en tb_auditoria.
 * Es fire-and-forget: un error aquí NUNCA falla la operación principal.
 *
 * Uso:
 *   const auditoria = require("../services/auditoria.service");
 *   auditoria.registrar({ tabla, registroId, accion, antes, despues, usuarioId, ip });
 */

const db = require("../db");

const registrar = ({ tabla, registroId, accion, antes = null, despues = null, usuarioId = null, ip = null }) => {
  // No retornamos la Promise para que sea truly fire-and-forget
  db.query(
    `INSERT INTO tb_auditoria
       (tabla, registro_id, accion, datos_anteriores, datos_nuevos, usuario_id, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      tabla,
      registroId,
      accion,
      antes    ? JSON.stringify(antes)    : null,
      despues  ? JSON.stringify(despues)  : null,
      usuarioId,
      ip,
    ],
    (err) => { if (err) console.error("[Auditoría]", err.message); },
  );
};

// ── Consulta ──────────────────────────────────────────────────────────────
const listar = ({ tabla, accion, usuarioId, fechaDesde, fechaHasta } = {}) =>
  new Promise((resolve, reject) => {
    const condiciones = ["1=1"];
    const params = [];

    if (tabla)      { condiciones.push("a.tabla = ?");               params.push(tabla); }
    if (accion)     { condiciones.push("a.accion = ?");              params.push(accion); }
    if (usuarioId)  { condiciones.push("a.usuario_id = ?");          params.push(usuarioId); }
    if (fechaDesde) { condiciones.push("DATE(a.created_at) >= ?");   params.push(fechaDesde); }
    if (fechaHasta) { condiciones.push("DATE(a.created_at) <= ?");   params.push(fechaHasta); }

    const sql = `
      SELECT a.id, a.tabla, a.registro_id, a.accion,
             a.datos_anteriores, a.datos_nuevos,
             a.ip, a.created_at,
             u.id   AS usuario_id,
             u.nombre   AS usuario_nombre,
             u.apellido AS usuario_apellido
      FROM tb_auditoria a
      LEFT JOIN tb_usuarios u ON a.usuario_id = u.id
      WHERE ${condiciones.join(" AND ")}
      ORDER BY a.created_at DESC
      LIMIT 500
    `;

    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      // Asegurar que los campos JSON sean objetos
      const resultado = rows.map((r) => ({
        ...r,
        datos_anteriores: parseJson(r.datos_anteriores),
        datos_nuevos:     parseJson(r.datos_nuevos),
      }));
      resolve(resultado);
    });
  });

const parseJson = (valor) => {
  if (!valor) return null;
  if (typeof valor === "object") return valor;   // mysql2 ya lo parseó
  try { return JSON.parse(valor); } catch { return valor; }
};

module.exports = { registrar, listar };
