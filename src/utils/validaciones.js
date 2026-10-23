/**
 * Indica si un correo pertenece a un dominio permitido: @duoc.cl, @profesor.duoc.cl
 * o @gmail.com (sin distinguir mayúsculas).
 *
 * @param {string} correo - Correo a revisar.
 * @returns {boolean} true si el dominio está permitido.
 */
export function validarDominioCorreo(correo) {
  return /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(correo);
}

/**
 * Valida un RUN chileno escrito sin puntos ni guión (por ejemplo 19011022K).
 * Debe tener entre 7 y 9 caracteres: dígitos y, al final, un dígito o la letra K.
 * Calcula el dígito verificador con el método módulo 11 y lo compara con el ingresado.
 *
 * @param {string} rut - RUN a validar.
 * @returns {boolean} true si el formato y el dígito verificador son correctos.
 */
export function validarRut(rut) {
  const rutLimpio = rut.trim().toUpperCase();
  if (!/^[0-9]+[0-9K]$/.test(rutLimpio)) return false;
  if (rutLimpio.length < 7 || rutLimpio.length > 9) return false;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  let suma = 0;
  let multiplo = 2;
  for (let i = 1; i <= cuerpo.length; i++) {
    suma += multiplo * Number(cuerpo.charAt(cuerpo.length - i));
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  let dvEsperado = 11 - (suma % 11);
  dvEsperado =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dv === dvEsperado;
}

/**
 * Valida los datos del inicio de sesión.
 * Correo: obligatorio, de hasta 100 caracteres y de un dominio permitido.
 * Contraseña: obligatoria, de 4 a 10 caracteres.
 *
 * @param {string} correo - Correo ingresado.
 * @param {string} contrasena - Contraseña ingresada.
 * @returns {{correo?: string, contrasena?: string}} Mensajes de error por campo;
 * un objeto vacío si todo es válido.
 */
export function validarLogin(correo, contrasena) {
  const errores = {};
  const c = correo.trim();
  const p = contrasena.trim();

  if (c === "") errores.correo = "El correo es requerido.";
  else if (c.length > 100)
    errores.correo = "El correo no puede superar los 100 caracteres.";
  else if (!validarDominioCorreo(c))
    errores.correo =
      "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";

  if (p === "") errores.contrasena = "La contraseña es requerida.";
  else if (p.length < 4 || p.length > 10)
    errores.contrasena = "La contraseña debe tener entre 4 y 10 caracteres.";

  return errores;
}

/**
 * Valida los datos del formulario de registro.
 * RUN: obligatorio y válido. Nombre: obligatorio, de hasta 50 caracteres.
 * Apellidos: obligatorios, de hasta 100. Correo: obligatorio, de hasta 100 y de
 * un dominio permitido. Dirección: obligatoria, de hasta 300.
 *
 * @param {Object} datos - Datos del formulario.
 * @param {string} datos.run - RUN sin puntos ni guión.
 * @param {string} datos.nombre - Nombre.
 * @param {string} datos.apellidos - Apellidos.
 * @param {string} datos.correo - Correo electrónico.
 * @param {string} datos.direccion - Dirección.
 * @returns {Object} Mensajes de error por campo; un objeto vacío si todo es válido.
 */
export function validarRegistro(datos) {
  const errores = {};
  const run = datos.run.trim();
  const nombre = datos.nombre.trim();
  const apellidos = datos.apellidos.trim();
  const correo = datos.correo.trim();
  const direccion = datos.direccion.trim();

  if (run === "") errores.run = "El RUN es requerido.";
  else if (!validarRut(run))
    errores.run = "El RUN ingresado no es válido (Ingrese sin puntos ni guión).";

  if (nombre === "") errores.nombre = "El nombre es requerido.";
  else if (nombre.length > 50)
    errores.nombre = "El nombre no puede superar los 50 caracteres.";

  if (apellidos === "") errores.apellidos = "Los apellidos son requeridos.";
  else if (apellidos.length > 100)
    errores.apellidos = "Los apellidos no pueden superar los 100 caracteres.";

  if (correo === "") errores.correo = "El correo es requerido.";
  else if (correo.length > 100)
    errores.correo = "El correo no puede superar los 100 caracteres.";
  else if (!validarDominioCorreo(correo))
    errores.correo =
      "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";

  if (direccion === "") errores.direccion = "La dirección es requerida.";
  else if (direccion.length > 300)
    errores.direccion = "La dirección no puede superar los 300 caracteres.";

  return errores;
}