const validarHistorialCargo = (data, esActualizacion = false) => {
  const { empleado_id, cargo_id, tipo_contrato_id, salario, fecha_inicio } = data;

  if (!esActualizacion && !empleado_id) return "El empleado es requerido";
  if (!cargo_id) return "El cargo es requerido";
  if (!tipo_contrato_id) return "El tipo de contrato es requerido";
  if (!fecha_inicio?.trim()) return "La fecha de inicio es requerida";

  const salarioNumber = Number(salario);
  if (Number.isNaN(salarioNumber) || salarioNumber <= 0) return "El salario debe ser mayor a 0";

  return null;
};

module.exports = { validarHistorialCargo };
