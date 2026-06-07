// mysql2 puede devolver columnas DATE/DATETIME como objetos Date.
// toStr convierte cualquier valor a string seguro para poder llamar .trim().
const toStr = (v) => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().split("T")[0];
  return String(v);
};

const validarEmpleado = (data, esActualizacion = false) => {
  const {
    nombre,
    apellido,
    documento,
    correo,
    celular,
    salario,
    fecha_ingreso,
    fecha_nacimiento,
    cargo_id,
    tipo_contrato_id,
    estado_empleado_id,
  } = data;

  if (
    !toStr(nombre).trim() ||
    !toStr(apellido).trim() ||
    !toStr(documento).trim() ||
    !toStr(correo).trim() ||
    !toStr(celular).trim() ||
    !String(salario ?? "").trim() ||
    !toStr(fecha_ingreso).trim() ||
    !cargo_id ||
    !tipo_contrato_id ||
    !toStr(fecha_nacimiento).trim()
  ) {
    return "Todos los campos son requeridos";
  }

  if (esActualizacion && (!estado_empleado_id || String(estado_empleado_id).trim() === "")) {
    return "Seleccione un estado";
  }

  const soloNumeros = /^\d+$/;
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const correoStr    = toStr(correo).trim();
  const documentoStr = toStr(documento).trim();
  const celularStr   = toStr(celular).trim();

  if (!regexCorreo.test(correoStr)) return "El correo no tiene un formato válido";
  if (!soloNumeros.test(documentoStr)) return "El documento debe contener solo números";
  if (documentoStr.length < 6 || documentoStr.length > 10) return "El documento debe tener entre 6 y 10 dígitos";
  if (!soloNumeros.test(celularStr)) return "El celular debe contener solo números";
  if (celularStr.length < 10 || celularStr.length > 20) return "El celular debe tener entre 10 y 20 dígitos";

  const salarioNumber = Number(salario);
  if (Number.isNaN(salarioNumber) || salarioNumber <= 0) return "El salario debe ser mayor a 0";

  return null;
};

module.exports = { validarEmpleado };
