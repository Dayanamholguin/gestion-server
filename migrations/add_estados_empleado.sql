-- ============================================================
-- Migración: Estados de empleado completos
-- Ejecutar una sola vez en la base de datos de producción (Railway)
-- ============================================================
-- Garantiza que todos los estados usados por el frontend existan.
-- Usa INSERT IGNORE para no duplicar si ya existen.
-- id=2 es el único que pone estado=0 (inactivo de sistema). Ver regla de negocio #1.

INSERT IGNORE INTO tb_estados_empleado (id, nombre) VALUES
  (1, 'Activo'),
  (2, 'Inactivo'),
  (3, 'Licencia'),
  (4, 'Vacaciones'),
  (5, 'Suspendido'),
  (6, 'Reingreso');
