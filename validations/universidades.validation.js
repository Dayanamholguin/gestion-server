const validarUniversidad = (data) => {
  const { nombre } = data;
  if (!nombre?.trim()) return "El nombre de la universidad es requerido";
  if (nombre.trim().length < 3) return "El nombre debe tener mínimo 3 caracteres";
  return null;
};

module.exports = { validarUniversidad };
