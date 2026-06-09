-- ============================================================
-- Migración: Gestión de Vacaciones
-- Ejecutar una sola vez en la base de datos local y en Railway
-- ============================================================

-- Tabla principal de solicitudes de vacaciones
CREATE TABLE IF NOT EXISTS tb_vacaciones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  empleado_id     INT NOT NULL,
  fecha_inicio    DATE NOT NULL,
  fecha_fin       DATE NOT NULL,
  observaciones   TEXT DEFAULT NULL,
  estado          ENUM('Pendiente','Aprobada','Rechazada') NOT NULL DEFAULT 'Pendiente',
  revisado_por    INT DEFAULT NULL,
  fecha_revision  DATETIME DEFAULT NULL,
  motivo_rechazo  TEXT DEFAULT NULL,
  estado_registro TINYINT NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empleado_id) REFERENCES tb_empleados(id),
  FOREIGN KEY (revisado_por) REFERENCES tb_usuarios(id)
);

-- Nuevos permisos (INSERT IGNORE requiere índice UNIQUE en nombre)
INSERT IGNORE INTO tb_permisos (nombre) VALUES ('vacaciones:gestionar');
INSERT IGNORE INTO tb_permisos (nombre) VALUES ('vacaciones:solicitar');

-- Asignar vacaciones:gestionar a RRHH (rol_id = 2)
INSERT IGNORE INTO tb_roles_permisos (rol_id, permiso_id)
  SELECT 2, id FROM tb_permisos WHERE nombre = 'vacaciones:gestionar';

-- Asignar vacaciones:solicitar a EMPLEADO (rol_id = 3)
INSERT IGNORE INTO tb_roles_permisos (rol_id, permiso_id)
  SELECT 3, id FROM tb_permisos WHERE nombre = 'vacaciones:solicitar';

-- ADMIN (rol_id = 1) ya tiene permiso "*" que cubre todo, no necesita cambios.
