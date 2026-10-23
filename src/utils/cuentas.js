import { dbUsuarios } from '../data/usuarios.js';
import { leerLista, guardarLista } from './almacenamiento.js';

/** Cuentas de demostración locales; no sustituye autenticación de servidor. */
export const obtenerUsuarios = () => leerLista('usuariosBikers', dbUsuarios);

/** Crea o actualiza una cuenta y evita correos repetidos. */
export function guardarUsuario(datos, correoAnterior) {
  const correo = datos.correo.trim().toLowerCase();
  const usuarios = obtenerUsuarios();
  if (usuarios.some(u => u.correo === correo && u.correo !== correoAnterior)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }
  const usuario = {
    ...datos,
    correo
  };
  guardarLista('usuariosBikers', correoAnterior ? usuarios.map(u => u.correo === correoAnterior ? usuario : u) : [...usuarios, usuario]);
}

/** Elimina una cuenta local. */
export function eliminarUsuario(correo) {
  guardarLista('usuariosBikers', obtenerUsuarios().filter(u => u.correo !== correo));
}
