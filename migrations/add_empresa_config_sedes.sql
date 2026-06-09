-- Configuración de la empresa principal (fila única id=1)
CREATE TABLE IF NOT EXISTS tb_empresa_config (
    id INT PRIMARY KEY DEFAULT 1,
    nombre VARCHAR(200) NOT NULL DEFAULT 'Empresa COL',
    nit VARCHAR(50) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO
    tb_empresa_config (id, nombre)
VALUES (1, 'Empresa COL');

-- Sedes de la empresa
CREATE TABLE IF NOT EXISTS tb_sedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    ciudad VARCHAR(100) DEFAULT NULL,
    direccion VARCHAR(300) DEFAULT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campo sede en empleados (nuevo, no reemplaza empresa_id existente)
ALTER TABLE tb_empleados ADD COLUMN sede_id INT DEFAULT NULL;

ALTER TABLE tb_empleados
ADD CONSTRAINT fk_empleados_sede FOREIGN KEY (sede_id) REFERENCES tb_sedes (id);