const validarCargo = (cargo) => {
  const { nombre, descripcion, estado } = cargo;

  if (!nombre?.trim()) {
    return "El nombre es requerido";
  }
  if (estado === undefined || estado === null || String(estado).trim() === "") {
    return "Seleccione un estado";
  }

  if (nombre.trim().length < 3) {
    return "El nombre debe tener mínimo 3 caracteres";
  }

  if (!descripcion?.trim()) {
    return "La descripción es requerida";
  }

  return null;
};

module.exports = {
  validarCargo,
};
