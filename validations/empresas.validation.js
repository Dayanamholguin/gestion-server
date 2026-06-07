const validarEmpresa = (data) => {
  const { nombre, nit } = data;

  if (!nombre?.trim()) return "El nombre de la empresa es requerido";
  if (!nit?.trim()) return "El NIT de la empresa es requerido";

  return null;
};

module.exports = { validarEmpresa };
