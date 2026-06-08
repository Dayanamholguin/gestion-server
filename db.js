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
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Evita crash cuando MySQL cierra conexiones inactivas (wait_timeout / código 4031)
pool.on("error", (err) => {
  console.warn("[db] Conexión del pool cerrada por el servidor, se reconectará automáticamente:", err.message);
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
    return;
  }
  console.log("connected to mysql database");
  conn.release();
});

module.exports = pool;
