-- Tabla de configuración de días laborales
CREATE TABLE IF NOT EXISTS tb_configuracion_laboral (
  id        INT PRIMARY KEY DEFAULT 1,
  lunes     TINYINT NOT NULL DEFAULT 1,
  martes    TINYINT NOT NULL DEFAULT 1,
  miercoles TINYINT NOT NULL DEFAULT 1,
  jueves    TINYINT NOT NULL DEFAULT 1,
  viernes   TINYINT NOT NULL DEFAULT 1,
  sabado    TINYINT NOT NULL DEFAULT 0,
  domingo   TINYINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar fila única si no existe
INSERT IGNORE INTO tb_configuracion_laboral (id) VALUES (1);
