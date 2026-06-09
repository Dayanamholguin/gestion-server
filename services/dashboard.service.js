const db = require("../db");

const q = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

const getStats = async (sedeId = null) => {
  // Cláusula WHERE base para filtrar por sede (opcional)
  const whereBase   = sedeId ? "WHERE e.sede_id = ?"    : "WHERE 1=1";
  const whereActivo = sedeId ? "WHERE e.sede_id = ? AND e.estado = 1" : "WHERE e.estado = 1";
  const params      = sedeId ? [sedeId] : [];

  const [
    [resumen = {}],
    porCargo,
    porContrato,
    porSede,
    porEstado,
    recientes,
    [salarios = {}],
    cumpleanos,
    ingresosMes,
  ] = await Promise.all([
    q(`SELECT
         COUNT(*) total,
         COALESCE(SUM(e.estado = 1), 0) activos,
         COALESCE(SUM(e.estado = 0), 0) inactivos
       FROM tb_empleados e ${whereBase}`, params),

    q(`SELECT c.nombre cargo, COUNT(*) cantidad
       FROM tb_empleados e
       JOIN tb_cargos c ON e.cargo_id = c.id
       ${whereActivo}
       GROUP BY c.id, c.nombre
       ORDER BY cantidad DESC
       LIMIT 8`, params),

    q(`SELECT tc.nombre tipo, COUNT(*) cantidad
       FROM tb_empleados e
       JOIN tb_tipos_contrato tc ON e.tipo_contrato_id = tc.id
       ${whereActivo}
       GROUP BY tc.id, tc.nombre
       ORDER BY cantidad DESC`, params),

    q(`SELECT COALESCE(s.nombre, 'Sin sede') sede, COUNT(*) cantidad
       FROM tb_empleados e
       LEFT JOIN tb_sedes s ON e.sede_id = s.id
       ${whereActivo}
       GROUP BY s.id, s.nombre
       ORDER BY cantidad DESC
       LIMIT 6`, params),

    q(`SELECT ee.nombre estado, COUNT(*) cantidad
       FROM tb_empleados e
       JOIN tb_estados_empleado ee ON e.estado_empleado_id = ee.id
       ${whereBase}
       GROUP BY ee.id, ee.nombre
       ORDER BY cantidad DESC`, params),

    q(`SELECT e.nombre, e.apellido, c.nombre cargo, e.fecha_ingreso
       FROM tb_empleados e
       JOIN tb_cargos c ON e.cargo_id = c.id
       ${whereBase.replace("WHERE", "WHERE")} AND e.fecha_ingreso >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       ORDER BY e.fecha_ingreso DESC
       LIMIT 10`, params),

    q(`SELECT
         ROUND(AVG(e.salario)) promedio,
         MAX(e.salario) maximo,
         MIN(NULLIF(e.salario, 0)) minimo
       FROM tb_empleados e
       ${whereActivo}`, params),

    q(`SELECT e.nombre, e.apellido, e.fecha_nacimiento
       FROM tb_empleados e
       ${whereBase.replace("WHERE", "WHERE")} AND MONTH(e.fecha_nacimiento) = MONTH(CURDATE()) AND e.estado = 1
       ORDER BY DAY(e.fecha_nacimiento)
       LIMIT 10`, params),

    q(`SELECT MONTH(e.fecha_ingreso) mes, YEAR(e.fecha_ingreso) anio, COUNT(*) cantidad
       FROM tb_empleados e
       ${whereBase.replace("WHERE", "WHERE")} AND e.fecha_ingreso >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY YEAR(e.fecha_ingreso), MONTH(e.fecha_ingreso)
       ORDER BY anio, mes`, params),
  ]);

  // Vacaciones pendientes — opcional
  let vacacionesPendientes = 0;
  try {
    const [[vac = {}]] = await Promise.all([
      sedeId
        ? q(`SELECT COUNT(*) total
             FROM tb_vacaciones v
             JOIN tb_empleados e ON v.empleado_id = e.id
             WHERE v.estado = 'Pendiente' AND v.estado_registro = 1 AND e.sede_id = ?`, [sedeId])
        : q(`SELECT COUNT(*) total FROM tb_vacaciones WHERE estado = 'Pendiente' AND estado_registro = 1`),
    ]);
    vacacionesPendientes = +(vac.total || 0);
  } catch { /* tabla no existe todavía */ }

  return {
    resumen: {
      total:    +resumen.total,
      activos:  +resumen.activos,
      inactivos: +resumen.inactivos,
      vacaciones_pendientes: vacacionesPendientes,
    },
    por_cargo:    porCargo.map((r) => ({ label: r.cargo,    value: +r.cantidad })),
    por_contrato: porContrato.map((r) => ({ label: r.tipo,  value: +r.cantidad })),
    por_empresa:  porSede.map((r)    => ({ label: r.sede,   value: +r.cantidad })),
    por_estado:   porEstado.map((r)  => ({ label: r.estado, value: +r.cantidad })),
    recientes,
    salarios: {
      promedio: +(salarios.promedio || 0),
      maximo:   +(salarios.maximo   || 0),
      minimo:   +(salarios.minimo   || 0),
    },
    cumpleanos,
    ingresos_mes: ingresosMes.map((r) => ({ mes: +r.mes, anio: +r.anio, cantidad: +r.cantidad })),
  };
};

module.exports = { getStats };
