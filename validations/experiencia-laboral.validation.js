const validarExperiencia = (data, esActualizacion = false) => {
  const { empleado_id, empresa, cargo, fecha_inicio } = data;

  if (!esActualizacion && !empleado_id) return "El empleado es requerido";
  if (!empresa?.trim()) return "El nombre de la empresa es requerido";
  if (!cargo?.trim()) return "El cargo es requerido";
  if (!fecha_inicio?.trim()) return "La fecha de inicio es requerida";

  return null;
};

module.exports = { validarExperiencia };
