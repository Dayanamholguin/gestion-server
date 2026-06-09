const db  = require("../db");
const ExcelJS = require("exceljs");

// Helper promise wrapper para múltiples queries encadenadas
const _q = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

const obtenerEmpleados = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        e.*,
        c.nombre  AS cargo_nombre,
        tc.nombre AS tipo_contrato_nombre,
        ee.nombre AS estado_empleado_nombre,
        COALESCE(s.nombre, emp.nombre) AS empresa_nombre,
        s.nombre   AS sede_nombre,
        s.ciudad   AS sede_ciudad,
        s.direccion AS sede_direccion
      FROM tb_empleados e
      LEFT JOIN tb_cargos c          ON e.cargo_id = c.id
      LEFT JOIN tb_tipos_contrato tc  ON e.tipo_contrato_id = tc.id
      LEFT JOIN tb_estados_empleado ee ON e.estado_empleado_id = ee.id
      LEFT JOIN tb_sedes s            ON e.sede_id = s.id
      LEFT JOIN tb_empresa emp        ON e.empresa_id = emp.id
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
        sede_id,
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
        empleado.sede_id || null,
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
        sede_id=?
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
        empleado.sede_id || null,
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
        c.nombre  AS cargo_nombre,
        tc.nombre AS tipo_contrato_nombre,
        ee.nombre AS estado_empleado_nombre,
        COALESCE(s.nombre, emp.nombre) AS empresa_nombre,
        s.nombre   AS sede_nombre,
        s.ciudad   AS sede_ciudad,
        s.direccion AS sede_direccion
      FROM tb_empleados e
      LEFT JOIN tb_cargos c          ON e.cargo_id = c.id
      LEFT JOIN tb_tipos_contrato tc  ON e.tipo_contrato_id = tc.id
      LEFT JOIN tb_estados_empleado ee ON e.estado_empleado_id = ee.id
      LEFT JOIN tb_sedes s            ON e.sede_id = s.id
      LEFT JOIN tb_empresa emp        ON e.empresa_id = emp.id
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

// ── Plantilla Excel ───────────────────────────────────────────────────────────

const generarPlantillaExcel = async () => {
  const [cargos, tipos, sedes] = await Promise.all([
    _q("SELECT nombre FROM tb_cargos WHERE estado = 1 ORDER BY nombre"),
    _q("SELECT nombre FROM tb_tipos_contrato ORDER BY nombre"),
    _q("SELECT nombre FROM tb_sedes WHERE activo = 1 ORDER BY nombre"),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Sistema RRHH";
  wb.created = new Date();

  // Hoja oculta con las listas de valores válidos (fuente de los desplegables)
  const sheetListas = wb.addWorksheet("Listas");
  sheetListas.state = "veryHidden";
  ["Cargos", "Tipos Contrato", "Sedes", "Estado"].forEach((h, i) => {
    sheetListas.getCell(1, i + 1).value = h;
  });
  cargos.forEach((c, i) => { sheetListas.getCell(i + 2, 1).value = c.nombre; });
  tipos.forEach((t, i)  => { sheetListas.getCell(i + 2, 2).value = t.nombre; });
  sedes.forEach((s, i)  => { sheetListas.getCell(i + 2, 3).value = s.nombre; });
  sheetListas.getCell(2, 4).value = "Activo";
  sheetListas.getCell(3, 4).value = "Inactivo";

  // Hoja principal
  const ws = wb.addWorksheet("Empleados");
  const FILAS = 100;

  // Fila 1: instrucción
  ws.mergeCells(1, 1, 1, 12);
  const instrCell = ws.getCell(1, 1);
  instrCell.value =
    "PLANTILLA DE IMPORTACIÓN DE EMPLEADOS — No modificar encabezados. " +
    "Los campos marcados con * son obligatorios. Fechas en formato YYYY-MM-DD. " +
    "Use las listas desplegables para Cargo, Tipo Contrato, Sede y Estado.";
  instrCell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
  instrCell.font      = { bold: true, size: 9, color: { argb: "FF92400E" } };
  instrCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  ws.getRow(1).height = 28;

  // Fila 2: encabezados
  const HEADERS = [
    "Nombre*", "Apellido*", "Documento*\n(6–10 dígitos)",
    "Correo*", "Celular*\n(10 dígitos)", "Salario*",
    "Cargo*", "Tipo Contrato*", "Sede",
    "Estado\n(vacío = Activo)", "Fecha Ingreso*\n(YYYY-MM-DD)", "Fecha Nacimiento*\n(YYYY-MM-DD)",
  ];
  const headerRow = ws.getRow(2);
  headerRow.height = 36;
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value     = h;
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
    cell.font      = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border    = {
      top:    { style: "thin", color: { argb: "FF3730A3" } },
      bottom: { style: "thin", color: { argb: "FF3730A3" } },
      left:   { style: "thin", color: { argb: "FF3730A3" } },
      right:  { style: "thin", color: { argb: "FF3730A3" } },
    };
  });

  ws.columns = [
    { width: 15 }, { width: 15 }, { width: 14 }, { width: 26 },
    { width: 13 }, { width: 12 }, { width: 22 }, { width: 20 },
    { width: 20 }, { width: 14 }, { width: 16 }, { width: 16 },
  ];

  // Formato texto en cols que podrían perder ceros o convertirse a fecha automáticamente
  ws.getColumn(3).numFmt  = "@"; // Documento
  ws.getColumn(5).numFmt  = "@"; // Celular
  ws.getColumn(11).numFmt = "@"; // Fecha Ingreso
  ws.getColumn(12).numFmt = "@"; // Fecha Nacimiento

  // Filas de datos (alternando color de fondo)
  for (let r = 3; r <= FILAS + 2; r++) {
    const row = ws.getRow(r);
    const bg  = r % 2 === 0 ? "FFF9FAFB" : "FFFFFFFF";
    for (let c = 1; c <= 12; c++) {
      const cell   = row.getCell(c);
      cell.fill    = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.alignment = { vertical: "middle" };
      cell.border  = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        left:   { style: "thin", color: { argb: "FFE5E7EB" } },
        right:  { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    }
    row.commit();
  }

  // Validaciones desplegables por rango de columna
  const cEnd = Math.max(cargos.length + 1, 2);
  const tEnd = Math.max(tipos.length  + 1, 2);
  const sEnd = Math.max(sedes.length  + 1, 2);
  const last = FILAS + 2;

  ws.dataValidations.add(`G3:G${last}`, {
    type: "list", allowBlank: false,
    formulae: [`'Listas'!$A$2:$A$${cEnd}`],
    showErrorMessage: true, errorStyle: "stop",
    errorTitle: "Cargo inválido",
    error: "Seleccione un cargo de la lista desplegable",
  });
  ws.dataValidations.add(`H3:H${last}`, {
    type: "list", allowBlank: false,
    formulae: [`'Listas'!$B$2:$B$${tEnd}`],
    showErrorMessage: true, errorStyle: "stop",
    errorTitle: "Tipo de contrato inválido",
    error: "Seleccione un tipo de contrato de la lista desplegable",
  });
  if (sedes.length > 0) {
    ws.dataValidations.add(`I3:I${last}`, {
      type: "list", allowBlank: true,
      formulae: [`'Listas'!$C$2:$C$${sEnd}`],
      showErrorMessage: true, errorStyle: "warning",
      errorTitle: "Sede inválida",
      error: "Seleccione una sede de la lista o deje el campo vacío",
    });
  }
  ws.dataValidations.add(`J3:J${last}`, {
    type: "list", allowBlank: true,
    formulae: ["'Listas'!$D$2:$D$3"],
    showErrorMessage: true, errorStyle: "stop",
    errorTitle: "Estado inválido",
    error: 'El estado debe ser "Activo" o "Inactivo"',
  });

  // Congelar encabezados al desplazarse
  ws.views = [{ state: "frozen", ySplit: 2, xSplit: 0, activeCell: "A3" }];

  return wb;
};

// ── Importar empleados desde Excel ────────────────────────────────────────────

const importarEmpleados = async (filas, usuarioId) => {
  const [cargos, tipos, sedes, estados] = await Promise.all([
    _q("SELECT id, nombre FROM tb_cargos WHERE estado = 1"),
    _q("SELECT id, nombre FROM tb_tipos_contrato"),
    _q("SELECT id, nombre FROM tb_sedes WHERE activo = 1"),
    _q("SELECT id, nombre FROM tb_estados_empleado"),
  ]);

  const cargosMap = {};
  cargos.forEach(c => { cargosMap[c.nombre.toLowerCase().trim()] = c.id; });
  const tiposMap = {};
  tipos.forEach(t => { tiposMap[t.nombre.toLowerCase().trim()] = t.id; });
  const sedesMap = {};
  sedes.forEach(s => { sedesMap[s.nombre.toLowerCase().trim()] = s.id; });

  const estadoActivo   = estados.find(e => e.nombre === "Activo")   || { id: 1 };
  const estadoInactivo = estados.find(e => e.nombre === "Inactivo") || { id: 2 };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const DATE_RE  = /^\d{4}-\d{2}-\d{2}$/;

  const errores      = [];
  const docsSinError = new Map(); // doc -> índice de fila (1-based)

  for (let i = 0; i < filas.length; i++) {
    const f   = filas[i];
    const row = i + 1;
    const e   = [];

    if (!String(f.nombre   || "").trim()) e.push("Nombre es obligatorio");
    if (!String(f.apellido || "").trim()) e.push("Apellido es obligatorio");

    const doc = String(f.documento ?? "").trim();
    if (!/^\d{6,10}$/.test(doc)) {
      e.push("Documento debe tener entre 6 y 10 dígitos numéricos");
    } else if (docsSinError.has(doc)) {
      e.push(`Documento duplicado en el archivo (primera vez en fila ${docsSinError.get(doc)})`);
    } else {
      docsSinError.set(doc, row);
    }

    const correo = String(f.correo || "").trim();
    if (!correo) e.push("Correo es obligatorio");
    else if (!EMAIL_RE.test(correo)) e.push("Correo no tiene un formato válido (ej. usuario@dominio.com)");

    const celular = String(f.celular ?? "").trim();
    if (!/^\d{10}$/.test(celular)) e.push("Celular debe tener exactamente 10 dígitos numéricos");

    const salario = parseFloat(String(f.salario ?? "").replace(/,/g, "").trim());
    if (f.salario === undefined || f.salario === null || String(f.salario).trim() === "") {
      e.push("Salario es obligatorio");
    } else if (isNaN(salario) || salario <= 0) {
      e.push("Salario debe ser un número mayor a 0");
    }

    const cargoStr = String(f.cargo || "").trim();
    if (!cargoStr) e.push("Cargo es obligatorio");
    else if (!cargosMap[cargoStr.toLowerCase()]) e.push(`Cargo "${cargoStr}" no existe o no está activo`);

    const tipoStr = String(f.tipo_contrato || "").trim();
    if (!tipoStr) e.push("Tipo de contrato es obligatorio");
    else if (!tiposMap[tipoStr.toLowerCase()]) e.push(`Tipo de contrato "${tipoStr}" no existe`);

    const sedeStr = String(f.sede || "").trim();
    if (sedeStr && !sedesMap[sedeStr.toLowerCase()]) {
      e.push(`Sede "${sedeStr}" no existe o no está activa`);
    }

    const estadoStr = String(f.estado || "Activo").trim();
    if (estadoStr !== "Activo" && estadoStr !== "Inactivo") {
      e.push('Estado debe ser "Activo" o "Inactivo"');
    }

    // Fechas
    const ingStr = String(f.fecha_ingreso   || "").trim().split("T")[0];
    const nacStr = String(f.fecha_nacimiento || "").trim().split("T")[0];
    let ingOk = false;
    let nacOk = false;

    if (!DATE_RE.test(ingStr)) {
      e.push("Fecha de ingreso inválida — use el formato YYYY-MM-DD (ej. 2024-01-15)");
    } else if (isNaN(new Date(ingStr + "T00:00:00").getTime())) {
      e.push("Fecha de ingreso no es una fecha válida");
    } else {
      ingOk = true;
    }

    if (!DATE_RE.test(nacStr)) {
      e.push("Fecha de nacimiento inválida — use el formato YYYY-MM-DD (ej. 1990-05-20)");
    } else if (isNaN(new Date(nacStr + "T00:00:00").getTime())) {
      e.push("Fecha de nacimiento no es una fecha válida");
    } else {
      nacOk = true;
    }

    if (ingOk && nacOk) {
      const dIng = new Date(ingStr + "T00:00:00");
      const dNac = new Date(nacStr + "T00:00:00");
      if (dNac >= dIng) {
        e.push("La fecha de nacimiento debe ser anterior a la fecha de ingreso");
      } else {
        const diffAnios = (dIng - dNac) / (365.25 * 24 * 60 * 60 * 1000);
        if (diffAnios < 5) {
          e.push("Debe haber al menos 5 años de diferencia entre la fecha de nacimiento y la de ingreso");
        }
      }
    }

    if (e.length) errores.push({ fila: row, errores: e });
  }

  // Verificar documentos ya registrados en BD
  if (docsSinError.size > 0) {
    const docs = [...docsSinError.keys()];
    const ph   = docs.map(() => "?").join(",");
    const existentes = await _q(
      `SELECT documento FROM tb_empleados WHERE documento IN (${ph})`,
      docs
    );
    for (const { documento } of existentes) {
      const rowNum  = docsSinError.get(String(documento));
      if (rowNum === undefined) continue;
      const registro = errores.find(e => e.fila === rowNum);
      const msg = "Documento ya está registrado en el sistema";
      if (registro) registro.errores.push(msg);
      else errores.push({ fila: rowNum, errores: [msg] });
    }
  }

  errores.sort((a, b) => a.fila - b.fila);
  if (errores.length > 0) return { ok: false, errores };

  // Todo válido — insertar todos
  const insertados = [];
  for (const f of filas) {
    const cargoId    = cargosMap[String(f.cargo || "").trim().toLowerCase()];
    const tipoId     = tiposMap[String(f.tipo_contrato || "").trim().toLowerCase()];
    const sedeStr2   = String(f.sede || "").trim().toLowerCase();
    const sedeId     = sedeStr2 ? (sedesMap[sedeStr2] || null) : null;
    const estadoStr2 = String(f.estado || "Activo").trim();
    const estadoEmpId = estadoStr2 === "Inactivo" ? estadoInactivo.id : estadoActivo.id;
    const estadoSist  = estadoEmpId === estadoInactivo.id ? 0 : 1;
    const ingStr  = String(f.fecha_ingreso   || "").trim().split("T")[0];
    const nacStr  = String(f.fecha_nacimiento || "").trim().split("T")[0];
    const sal     = parseFloat(String(f.salario ?? "").replace(/,/g, "").trim());

    const result = await _q(
      `INSERT INTO tb_empleados
        (nombre, apellido, documento, correo, celular, salario,
         fecha_ingreso, fecha_nacimiento, cargo_id, tipo_contrato_id,
         estado_empleado_id, estado, sede_id, creado_por)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        String(f.nombre).trim(),
        String(f.apellido).trim(),
        String(f.documento).trim(),
        String(f.correo).trim(),
        String(f.celular).trim(),
        sal,
        ingStr,
        nacStr,
        cargoId,
        tipoId,
        estadoEmpId,
        estadoSist,
        sedeId,
        usuarioId || null,
      ]
    );

    insertados.push({
      id:               result.insertId,
      nombre:           String(f.nombre).trim(),
      apellido:         String(f.apellido).trim(),
      correo:           String(f.correo).trim(),
      documento:        String(f.documento).trim(),
      cargo_id:         cargoId,
      tipo_contrato_id: tipoId,
      salario:          sal,
      fecha_ingreso:    ingStr,
      sede_id:          sedeId,
      estado_empleado_id: estadoEmpId,
    });
  }

  return { ok: true, insertados };
};

module.exports = {
  obtenerEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  actualizarEstadoMasivo,
  obtenerEmpleadoCompleto,
  eliminarEmpleado,
  verificarDocumento,
  generarPlantillaExcel,
  importarEmpleados,
};
