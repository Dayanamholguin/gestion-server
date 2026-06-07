require("dotenv").config();

const mysql = require("mysql2");

// Soporta variables locales (DB_*) y las que provee Railway (MYSQL*)
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || process.env.MYSQLHOST     || "localhost",
  port:     process.env.DB_PORT     || process.env.MYSQLPORT     || 3307,
  user:     process.env.DB_USER     || process.env.MYSQLUSER     || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || "admin",
  database: process.env.DB_NAME     || process.env.MYSQLDATABASE || "db_gestionEmpleadosTienda",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
    return;
  }
  console.log("Conectado a MySQL");
  conn.release();
});

module.exports = pool;
