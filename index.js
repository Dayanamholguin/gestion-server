// // para creacion de apis
// const express = require("express");

// //para comunicacion del back y el front
// const cors = require("cors");

// const db = require("./db");

// const app = express();

// app.use(cors());

// // que se pueda leer todo desde formato json cuando viaje desde el from
// app.use(express.json());

// app.get("/empleados", (req, res) => {
//   const sql = `
//     SELECT
//       e.*,

//       c.nombre AS cargo_nombre,
//       tc.nombre AS tipo_contrato_nombre,
//       ee.nombre AS estado_empleado_nombre

//     FROM tb_empleados e

//     LEFT JOIN tb_cargos c
//       ON e.cargo_id = c.id

//     LEFT JOIN tb_tipos_contrato tc
//       ON e.tipo_contrato_id = tc.id

//     LEFT JOIN tb_estados_empleado ee
//       ON e.estado_empleado_id = ee.id
//   `;
//   db.query(sql, (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "error al obtener los empleados" });
//     }
//     res.json(results);
//   });
// });

// app.get("/empleados/documento/:documento", (req, res) => {
//   const { documento } = req.params;

//   const sql = "SELECT id FROM tb_empleados WHERE documento = ?";

//   db.query(sql, [documento], (err, results) => {
//     if (err) {
//       return res.status(500).json({
//         error: "Error al validar documento",
//       });
//     }

//     return res.json({
//       existe: results.length > 0,
//     });
//   });
// });

// app.get("/empleados/documento/:documento/:id", (req, res) => {
//   const { documento, id } = req.params;

//   const sql = "SELECT id FROM tb_empleados WHERE documento = ? AND id != ?";

//   db.query(sql, [documento, id], (err, results) => {
//     if (err) {
//       return res.status(500).json({
//         error: "Error al validar documento",
//       });
//     }

//     return res.json({
//       existe: results.length > 0,
//     });
//   });
// });

// app.get("/empleados/:id", (req, res) => {
//   const { id } = req.params;
//   const sql = "SELECT * FROM tb_empleados WHERE id=?";
//   db.query(sql, [id], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: "error al obtener los empleados" });
//     }
//     if (!results.length) {
//       return res.status(404).json({ error: "Empleado no encontrado" });
//     }
//     res.json(results[0]);
//   });
// });

// app.post("/empleados", (req, res) => {
//   const {
//     nombre,
//     apellido,
//     documento,
//     correo,
//     celular,
//     salario,
//     fecha_ingreso,
//     fecha_nacimiento,
//     cargo_id,
//     tipo_contrato_id,
//   } = req.body;

//   if (
//     !nombre?.trim() ||
//     !apellido?.trim() ||
//     !documento?.trim() ||
//     !correo?.trim() ||
//     !celular?.trim() ||
//     !String(salario ?? "").trim() ||
//     !fecha_ingreso?.trim() ||
//     !cargo_id?.trim() ||
//     !tipo_contrato_id?.trim() ||
//     !fecha_nacimiento?.trim()
//   ) {
//     return res.status(400).json({ error: "Todos los campos son requeridos" });
//   }

//   const soloNumeros = /^\d+$/;
//   const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const salarioNumber = Number(salario);

//   if (!regexCorreo.test(correo.trim())) {
//     return res
//       .status(400)
//       .json({ error: "El correo no tiene un formato válido" });
//   }

//   if (!soloNumeros.test(documento.trim())) {
//     return res
//       .status(400)
//       .json({ error: "El documento debe contener solo números" });
//   }

//   if (documento.trim().length < 6 || documento.trim().length > 10) {
//     return res
//       .status(400)
//       .json({ error: "El documento debe tener entre 6 y 10 dígitos" });
//   }

//   if (!soloNumeros.test(celular.trim())) {
//     return res
//       .status(400)
//       .json({ error: "El celular debe contener solo números" });
//   }

//   if (celular.trim().length < 10 || celular.trim().length > 20) {
//     return res
//       .status(400)
//       .json({ error: "El celular debe tener entre 10 a 20 dígitos" });
//   }

//   if (Number.isNaN(salarioNumber) || salarioNumber <= 0) {
//     return res
//       .status(400)
//       .json({ error: "El salario debe ser un número mayor a 0" });
//   }
//   if (!cargo_id) {
//     return res.status(400).json({
//       error: "Seleccione un cargo",
//     });
//   }

//   if (!tipo_contrato_id) {
//     return res.status(400).json({
//       error: "Seleccione un tipo de contrato",
//     });
//   }

//   const cargoIdNumber = Number(cargo_id);
//   const tipoContratoIdNumber = Number(tipo_contrato_id);
//   const sql = `INSERT INTO tb_empleados (nombre, apellido, documento, correo, celular, salario, fecha_ingreso, fecha_nacimiento, cargo_id, tipo_contrato_id) VALUES (?,?,?,?,?,?,?,?,?,?)`;

//   db.query(
//     sql,
//     [
//       nombre.trim(),
//       apellido.trim(),
//       documento.trim(),
//       correo.trim(),
//       celular.trim(),
//       salarioNumber,
//       fecha_ingreso.trim(),
//       fecha_nacimiento.trim(),
//       cargoIdNumber,
//       tipoContratoIdNumber,
//     ],
//     (err, result) => {
//       if (err) {
//         if (err.code === "ER_DUP_ENTRY") {
//           return res
//             .status(400)
//             .json({ error: "El documento ya está registrado" });
//         }
//         return res.status(500).json({ error: "Error al guardar al empleado" });
//       }
//       const sqlEmpleadoCreado = `
//         SELECT
//           e.*,
//           c.nombre AS cargo_nombre,
//           tc.nombre AS tipo_contrato_nombre,
//           ee.nombre AS estado_empleado_nombre

//         FROM tb_empleados e

//         LEFT JOIN tb_cargos c
//           ON e.cargo_id = c.id

//         LEFT JOIN tb_tipos_contrato tc
//           ON e.tipo_contrato_id = tc.id

//         LEFT JOIN tb_estados_empleado ee
//           ON e.estado_empleado_id = ee.id

//         WHERE e.id = ?
//       `;
//       db.query(sqlEmpleadoCreado, [result.insertId], (err2, results) => {
//         if (err2) {
//           return res.status(500).json({
//             error: "Empleado creado pero error al obtener datos",
//           });
//         }

//         return res.json(results[0]);
//       });
//     },
//   );
// });

// app.put("/empleados/estado-masivo", (req, res) => {
//   console.log("BODY MASIVO:", req.body);
//   const { empleadosIds, estado_empleado_id } = req.body;

//   if (!Array.isArray(empleadosIds) || empleadosIds.length === 0) {
//     return res.status(400).json({
//       error: "No hay empleados seleccionados",
//     });
//   }

//   if (!estado_empleado_id) {
//     return res.status(400).json({
//       error: "Estado requerido",
//     });
//   }

//   const estadoSistema = Number(estado_empleado_id) === 2 ? 0 : 1;

//   const placeholders = empleadosIds.map(() => "?").join(",");

//   const sql = `
//     UPDATE tb_empleados
//     SET estado_empleado_id = ?,
//         estado = ?
//     WHERE id IN (${placeholders})
//   `;

//   db.query(sql, [estado_empleado_id, estadoSistema, ...empleadosIds], (err) => {
//     if (err) {
//       return res.status(500).json({
//         error: err.message,
//       });
//     }

//     return res.json({ message: "Estados actualizados" });
//   });
// });

// app.put("/empleados/:id", (req, res) => {
//   const { id } = req.params;

//   const {
//     nombre,
//     apellido,
//     documento,
//     correo,
//     celular,
//     salario,
//     fecha_ingreso,
//     fecha_nacimiento,
//     cargo_id,
//     tipo_contrato_id,
//     estado_empleado_id,
//   } = req.body;

//   if (
//     !nombre?.trim() ||
//     !apellido?.trim() ||
//     !documento?.trim() ||
//     !correo?.trim() ||
//     !celular?.trim() ||
//     !String(salario ?? "").trim() ||
//     !fecha_ingreso?.trim() ||
//     !cargo_id?.trim() ||
//     !tipo_contrato_id?.trim() ||
//     !estado_empleado_id?.trim() ||
//     !fecha_nacimiento?.trim()
//   ) {
//     return res.status(400).json({
//       error: "Todos los campos son requeridos",
//     });
//   }

//   const soloNumeros = /^\d+$/;
//   const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const salarioNumber = Number(salario);

//   if (!regexCorreo.test(correo.trim())) {
//     return res.status(400).json({
//       error: "El correo no tiene un formato válido",
//     });
//   }

//   if (!soloNumeros.test(documento.trim())) {
//     return res.status(400).json({
//       error: "El documento debe contener solo números",
//     });
//   }

//   if (documento.trim().length < 6 || documento.trim().length > 10) {
//     return res.status(400).json({
//       error: "El documento debe tener entre 6 y 10 dígitos",
//     });
//   }

//   if (!soloNumeros.test(celular.trim())) {
//     return res.status(400).json({
//       error: "El celular debe contener solo números",
//     });
//   }

//   if (celular.trim().length < 10 || celular.trim().length > 20) {
//     return res.status(400).json({
//       error: "El celular debe tener entre 10 y 20 dígitos",
//     });
//   }

//   if (Number.isNaN(salarioNumber) || salarioNumber <= 0) {
//     return res.status(400).json({
//       error: "El salario debe ser mayor a 0",
//     });
//   }

//   const estadoSistema = Number(estado_empleado_id) === 2 ? 0 : 1;

//   const cargoIdNumber = Number(cargo_id);
//   const tipoContratoIdNumber = Number(tipo_contrato_id);
//   const estadoEmpleadoIdNumber = Number(estado_empleado_id || 1);

//   const sql = `
//     UPDATE tb_empleados
//     SET
//       nombre=?,
//       apellido=?,
//       documento=?,
//       correo=?,
//       celular=?,
//       salario=?,
//       fecha_ingreso=?,
//       fecha_nacimiento=?,
//       cargo_id=?,
//       tipo_contrato_id=?,
//       estado_empleado_id=?,
//       estado=?
//     WHERE id=?
//   `;

//   db.query(
//     sql,
//     [
//       nombre.trim(),
//       apellido.trim(),
//       documento.trim(),
//       correo.trim(),
//       celular.trim(),
//       salarioNumber,
//       fecha_ingreso.trim(),
//       fecha_nacimiento.trim(),
//       cargoIdNumber,
//       tipoContratoIdNumber,
//       estadoEmpleadoIdNumber,
//       estadoSistema,
//       id,
//     ],
//     (err) => {
//       if (err) {
//         if (err.code === "ER_DUP_ENTRY") {
//           return res.status(400).json({
//             error: "El documento ya está registrado por otro empleado",
//           });
//         }

//         return res.status(500).json({
//           error: "Error al actualizar el empleado",
//         });
//       }

//       const sqlEmpleadoActualizado = `
//         SELECT
//           e.*,
//           c.nombre AS cargo_nombre,
//           tc.nombre AS tipo_contrato_nombre,
//           ee.nombre AS estado_empleado_nombre

//         FROM tb_empleados e

//         LEFT JOIN tb_cargos c
//           ON e.cargo_id = c.id

//         LEFT JOIN tb_tipos_contrato tc
//           ON e.tipo_contrato_id = tc.id

//         LEFT JOIN tb_estados_empleado ee
//           ON e.estado_empleado_id = ee.id

//         WHERE e.id = ?
//       `;

//       db.query(sqlEmpleadoActualizado, [id], (err2, results) => {
//         if (err2) {
//           return res.status(500).json({
//             error: "Empleado actualizado pero error al obtener datos",
//           });
//         }

//         return res.json(results[0]);
//       });
//     },
//   );
// });

// app.delete("/empleados/:id", (req, res) => {
//   const { id } = req.params;

//   const sql = "DELETE FROM tb_empleados WHERE id=?";

//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: "Error al eliminar al empleado" });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Empleado no encontrado" });
//     }
//     return res.json({ message: "Empleado eliminado exitosamente" });
//   });
// });

// app.get("/cargos", (req, res) => {
//   db.query("SELECT * FROM tb_cargos", (err, results) => {
//     if (err) {
//       return res.status(500).json({
//         error: "Error al obtener cargos",
//       });
//     }

//     res.json(results);
//   });
// });

// app.get("/tipos-contrato", (req, res) => {
//   db.query("SELECT * FROM tb_tipos_contrato", (err, results) => {
//     if (err) {
//       return res.status(500).json({
//         error: "Error al obtener tipos de contrato",
//       });
//     }

//     res.json(results);
//   });
// });

// app.get("/estados-empleado", (req, res) => {
//   db.query("SELECT * FROM tb_estados_empleado", (err, results) => {
//     if (err) {
//       return res.status(500).json({
//         error: "Error al obtener estados",
//       });
//     }

//     res.json(results);
//   });
// });

// app.listen(3001, () => {
//   console.log("Servidor backend corriendo desde el puerto 3001");
// });
