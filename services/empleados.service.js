const db = require("../db");

const obtenerEmpleados = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        e.*,
        c.nombre AS cargo_nombre,
        tc.nombre AS tipo_contrato_nombre,
        ee.nombre AS estado_empleado_nombre,
        emp.nombre AS empresa_nombre
      FROM tb_empleados e
      LEFT JOIN tb_cargos c ON e.cargo_id = c.id
      LEFT JOIN tb_tipos_contrato tc ON e.tipo_contrato_id = tc.id
      LEFT JOIN tb_estados_empleado ee ON e.estado_empleado_id = ee.id
      LEFT JOIN tb_empresa emp ON e.empresa_id = emp.id
    `;

    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const crearEmpleado = (empleado, creadoPor = null) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_empleados (
        nombre,
        apellido,
        documento,
        correo,
        celular,
        salario,
        fecha_ingreso,
        fecha_nacimiento,
        cargo_id,
        tipo_contrato_id,
        empresa_id,
        creado_por
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    db.query(
      sql,
      [
        empleado.nombre,
        empleado.apellido,
        empleado.documento,
        empleado.correo,
        empleado.celular,
        empleado.salario,
        empleado.fecha_ingreso,
        empleado.fecha_nacimiento,
        empleado.cargo_id,
        empleado.tipo_contrato_id,
        empleado.empresa_id || null,
        creadoPor,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const actualizarEmpleado = (id, empleado) => {
  return new Promise((resolve, reject) => {
    const estadoSistema = Number(empleado.estado_empleado_id) === 2 ? 0 : 1;

    const sql = `
      UPDATE tb_empleados
      SET
        nombre=?,
        apellido=?,
        documento=?,
        correo=?,
        celular=?,
        salario=?,
        fecha_ingreso=?,
        fecha_nacimiento=?,
        cargo_id=?,
        tipo_contrato_id=?,
        estado_empleado_id=?,
        estado=?,
        empresa_id=?
      WHERE id=?
    `;

    db.query(
      sql,
      [
        empleado.nombre,
        empleado.apellido,
        empleado.documento,
        empleado.correo,
        empleado.celular,
        empleado.salario,
        empleado.fecha_ingreso,
        empleado.fecha_nacimiento,
        empleado.cargo_id,
        empleado.tipo_contrato_id,
        empleado.estado_empleado_id,
        estadoSistema,
        empleado.empresa_id || null,
        id,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const obtenerEmpleadoCompleto = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        e.*,
        c.nombre AS cargo_nombre,
        tc.nombre AS tipo_contrato_nombre,
        ee.nombre AS estado_empleado_nombre,
        emp.nombre AS empresa_nombre
      FROM tb_empleados e
      LEFT JOIN tb_cargos c ON e.cargo_id = c.id
      LEFT JOIN tb_tipos_contrato tc ON e.tipo_contrato_id = tc.id
      LEFT JOIN tb_estados_empleado ee ON e.estado_empleado_id = ee.id
      LEFT JOIN tb_empresa emp ON e.empresa_id = emp.id
      WHERE e.id = ?
    `;

    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};

const eliminarEmpleado = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM tb_empleados WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const actualizarEstadoMasivo = (empleadosIds, estado_empleado_id) => {
  return new Promise((resolve, reject) => {
    const estadoSistema = Number(estado_empleado_id) === 2 ? 0 : 1;
    const placeholders = empleadosIds.map(() => "?").join(",");

    const sql = `
      UPDATE tb_empleados
      SET estado_empleado_id = ?,
          estado = ?
      WHERE id IN (${placeholders})
    `;

    db.query(
      sql,
      [estado_empleado_id, estadoSistema, ...empleadosIds],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const verificarDocumento = (documento, empleadoId = null) => {
  return new Promise((resolve, reject) => {
    const sql = empleadoId
      ? "SELECT id FROM tb_empleados WHERE documento = ? AND id != ?"
      : "SELECT id FROM tb_empleados WHERE documento = ?";
    const params = empleadoId ? [documento, empleadoId] : [documento];

    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve({ existe: results.length > 0 });
    });
  });
};

module.exports = {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  actualizarEstadoMasivo,
  obtenerEmpleadoCompleto,
  eliminarEmpleado,
  verificarDocumento,
};
