import { api } from './api';
import { guardarSesion, limpiarSesion } from './sesion';
export const obtenerUsuarios = () => api('/usuarios');
export const obtenerUsuario = id => api('/usuarios/' + encodeURIComponent(id));
export const guardarUsuario = (datos, id) => api(id ? '/usuarios/' + encodeURIComponent(id) : '/usuarios', { method: id ? 'PUT' : 'POST', body: datos });
export const registrarUsuario = datos => api('/auth/registro', { method: 'POST', body: datos, publico: true });
export const eliminarUsuario = id => api('/usuarios/' + encodeURIComponent(id), { method: 'DELETE' });
export async function iniciarSesion(correo, contrasena) {
  const sesion = await api('/auth/login', { method: 'POST', body: { correo: correo.trim().toLowerCase(), contrasena }, publico: true });
  guardarSesion(sesion);
  return sesion.usuario;
}
export async function cerrarSesion() {
  await api('/auth/logout', { method: 'POST' });
  limpiarSesion();
}
