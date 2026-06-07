const db = require("../db");

const obtenerEstudiosPorEmpleado = (empleadoId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT e.*, ne.nombre AS nivel_nombre, u.nombre AS universidad_nombre
      FROM tb_estudios e
      LEFT JOIN tb_nivel_educativo ne ON e.nivel_educativo_id = ne.id
      LEFT JOIN tb_universidades u ON e.universidad_id = u.id
      WHERE e.empleado_id = ? AND e.estado = 1
      ORDER BY e.orden ASC, e.fecha_inicio DESC
    `;
    db.query(sql, [empleadoId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const crearEstudio = async (estudio) => {
  const orden = await siguienteOrden(estudio.empleado_id);
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_estudios
        (empleado_id, nivel_educativo_id, titulo, institucion, fecha_inicio, fecha_fin, graduado, universidad_id, orden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        estudio.empleado_id,
        estudio.nivel_educativo_id,
        estudio.titulo,
        estudio.institucion,
        estudio.fecha_inicio || null,
        estudio.fecha_fin || null,
        estudio.graduado ? 1 : 0,
        estudio.universidad_id || null,
        orden,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const actualizarEstudio = (id, estudio) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tb_estudios
      SET nivel_educativo_id=?, titulo=?, institucion=?, fecha_inicio=?, fecha_fin=?, graduado=?, universidad_id=?
      WHERE id=?
    `;
    db.query(
      sql,
      [
        estudio.nivel_educativo_id,
        estudio.titulo,
        estudio.institucion,
        estudio.fecha_inicio || null,
        estudio.fecha_fin || null,
        estudio.graduado ? 1 : 0,
        estudio.universidad_id || null,
        id,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const eliminarEstudio = (id) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE tb_estudios SET estado = 0 WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const actualizarOrdenEstudios = (empleadoId, ordenes) => {
  return new Promise((resolve, reject) => {
    if (!ordenes || ordenes.length === 0) return resolve();
    const updates = ordenes.map(
      (o) =>
        new Promise((res, rej) => {
          db.query(
            "UPDATE tb_estudios SET orden = ? WHERE id = ? AND empleado_id = ?",
            [o.orden, o.id, empleadoId],
            (err) => { if (err) return rej(err); res(); },
          );
        }),
    );
    Promise.all(updates).then(resolve).catch(reject);
  });
};

const siguienteOrden = (empleadoId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT COALESCE(MAX(orden), -1) + 1 AS next_orden FROM tb_estudios WHERE empleado_id = ? AND estado = 1",
      [empleadoId],
      (err, rows) => { if (err) return reject(err); resolve(rows[0].next_orden); },
    );
  });
};

module.exports = {
  obtenerEstudiosPorEmpleado,
  crearEstudio,
  actualizarEstudio,
  eliminarEstudio,
  actualizarOrdenEstudios,
  siguienteOrden,
};
