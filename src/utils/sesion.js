import { useSyncExternalStore } from 'react';
const clave = 'sesionBikers';
const evento = 'bikers-sesion';
let timer;
export function leerSesion() {
  try {
    const s = JSON.parse(localStorage.getItem(clave));
    return s?.token && s?.usuario && Date.parse(s.expira) > Date.now() ? s : null;
  } catch { return null; }
}
export function guardarSesion(sesion) {
  localStorage.setItem(clave, JSON.stringify(sesion));
  sessionStorage.removeItem('usuario');
  clearTimeout(timer);
  timer = setTimeout(limpiarSesion, Math.max(0, Date.parse(sesion.expira) - Date.now()));
  window.dispatchEvent(new Event(evento));
}
export function limpiarSesion() {
  clearTimeout(timer);
  localStorage.removeItem(clave);
  sessionStorage.removeItem('usuario');
  window.dispatchEvent(new Event(evento));
}
function suscribir(callback) {
  window.addEventListener(evento, callback);
  window.addEventListener('storage', callback);
  const reloj = setInterval(callback, 1000);
  return () => { window.removeEventListener(evento, callback); window.removeEventListener('storage', callback); clearInterval(reloj); };
}
function snapshot() {
  const s = leerSesion();
  return s ? JSON.stringify(s.usuario) : 'null';
}
export function useUsuario() { return JSON.parse(useSyncExternalStore(suscribir, snapshot)); }
