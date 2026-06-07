const db = require("../db");

const obtenerEmpresas = (all = false) => {
  return new Promise((resolve, reject) => {
    const sql = all
      ? "SELECT * FROM tb_empresa ORDER BY nombre"
      : "SELECT * FROM tb_empresa WHERE estado = 1 ORDER BY nombre";
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const obtenerEmpresaById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM tb_empresa WHERE id = ?", [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};

const crearEmpresa = (empresa) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tb_empresa (nombre, nit, direccion, telefono, correo)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [empresa.nombre, empresa.nit, empresa.direccion || null, empresa.telefono || null, empresa.correo || null],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

const actualizarEmpresa = (id, empresa) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tb_empresa
      SET nombre=?, nit=?, direccion=?, telefono=?, correo=?, estado=?
      WHERE id=?
    `;
    db.query(
      sql,
      [empresa.nombre, empresa.nit, empresa.direccion || null, empresa.telefono || null, empresa.correo || null, empresa.estado ?? 1, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
};

module.exports = { obtenerEmpresas, obtenerEmpresaById, crearEmpresa, actualizarEmpresa };
