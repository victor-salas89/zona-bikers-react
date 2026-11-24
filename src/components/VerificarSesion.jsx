import { useEffect } from 'react';
import { api } from '../utils/api';
import { leerSesion, guardarSesion } from '../utils/sesion';
export default function VerificarSesion() {
  useEffect(() => {
    const verificar = () => {
      const actual = leerSesion();
      if (actual) api('/auth/me').then(usuario => {
        if (leerSesion()?.token === actual.token) guardarSesion({ ...actual, usuario });
      }).catch(() => { /* api invalida sesiones rechazadas; una caída de red permite reintentar. */ });
    };
    verificar();
    window.addEventListener('focus', verificar);
    return () => window.removeEventListener('focus', verificar);
  }, []);
  return null;
}
