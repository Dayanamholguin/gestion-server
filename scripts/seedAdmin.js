/**
 * seedAdmin.js — Crea el usuario administrador inicial.
 *
 * Requiere bcryptjs (se instala en Fase 2):
 *   npm install bcryptjs
 *
 * Uso:
 *   cd server
 *   node scripts/seedAdmin.js
 *
 * Solo insertar una vez. Si el correo ya existe, el script lo informa y no duplica.
 */

require("dotenv").config({ path: "../.env" });
const bcrypt = require("bcryptjs");
const db = require("../db");

const ADMIN = {
  nombre: "Admin",
  apellido: "Sistema",
  correo: "admin@empresacol.com",
  password: "Admin@2025",   // ← cambia la contraseña antes de producción
  rol_id: 1,                // 1 = ADMIN (según tb_roles)
};

async function seed() {
  console.log("Generando hash de contraseña...");
  const hash = await bcrypt.hash(ADMIN.password, 10);

  db.query(
    `INSERT INTO tb_usuarios (nombre, apellido, correo, password_hash, rol_id)
     VALUES (?, ?, ?, ?, ?)`,
    [ADMIN.nombre, ADMIN.apellido, ADMIN.correo, hash, ADMIN.rol_id],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          console.log(`El usuario ${ADMIN.correo} ya existe. No se creó duplicado.`);
        } else {
          console.error("Error al insertar admin:", err.message);
        }
        db.end();
        return;
      }
      console.log(`✓ Usuario admin creado (id=${result.insertId})`);
      console.log(`  Correo:     ${ADMIN.correo}`);
      console.log(`  Contraseña: ${ADMIN.password}`);
      console.log("  Cambia la contraseña en el primer acceso.");
      db.end();
    },
  );
}

seed().catch((e) => { console.error(e); db.end(); });
