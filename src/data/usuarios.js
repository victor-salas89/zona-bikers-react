/**
 * Usuarios de prueba para el inicio de sesión educativo, con su correo,
 * contraseña y rol (administrador, vendedor o cliente).
 * Las contraseñas están en texto plano solo con fines de aprendizaje;
 * una aplicación real nunca debe guardarlas así.
 */
export const dbUsuarios = [
  { correo: "admin@duoc.cl", contrasena: "12345", rol: "administrador" },
  { correo: "vende@profesor.duoc.cl", contrasena: "vende", rol: "vendedor" },
  { correo: "cliente@gmail.com", contrasena: "moto1", rol: "cliente" },
];

/** Regiones disponibles y la lista de comunas de cada una, para los formularios. */
export const regionesYComunas = {
  "Región Metropolitana": ["Santiago", "Puente Alto", "Maipú", "La Florida"],
  "Región de Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"],
  "Región del Biobío": ["Concepción", "Talcahuano", "Los Ángeles", "San Pedro de la Paz"],
};