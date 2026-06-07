const validarEstudio = (data, esActualizacion = false) => {
  const { empleado_id, nivel_educativo_id, titulo, institucion } = data;

  if (!esActualizacion && !empleado_id) return "El empleado es requerido";
  if (!nivel_educativo_id) return "El nivel educativo es requerido";
  if (!titulo?.trim()) return "El título es requerido";
  if (!institucion?.trim()) return "La institución es requerida";

  return null;
};

module.exports = { validarEstudio };
