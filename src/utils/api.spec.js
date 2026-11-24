import { describe, it, expect, vi } from 'vitest';
import { api } from './api';
import { leerSesion, guardarSesion, limpiarSesion } from './sesion';
import { sesionPrueba } from '../test/apiSimulada';

describe('Sesión JWT y transporte HTTP', () => {
  it('persiste la sesión y envía Bearer solo a solicitudes privadas', async () => {
    sesionPrueba('cliente');
    const fetch = vi.spyOn(window, 'fetch').mockResolvedValue({ ok: true, json: async () => [] });
    await api('/pedidos');
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer token-simulado');
    await api('/productos', { publico: true });
    expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined();
    expect(leerSesion().usuario.rol).toBe('cliente');
  });
  it('descarta sesiones vencidas y borra la sesión ante 401', async () => {
    localStorage.setItem('sesionBikers', JSON.stringify({ token: 'vencido', usuario: {}, expira: '2020-01-01' }));
    expect(leerSesion()).toBeNull();
    sesionPrueba();
    vi.spyOn(window, 'fetch').mockResolvedValue({ status: 401, ok: false, json: async () => ({ message: 'Sesión expirada.' }) });
    await expect(api('/auth/me')).rejects.toThrow('Sesión expirada');
    expect(leerSesion()).toBeNull();
    expect(localStorage.getItem('sesionBikers')).toBeNull();
  });
  it('un 403 informa permisos y conserva una sesión válida', async () => {
    sesionPrueba('cliente');
    vi.spyOn(window, 'fetch').mockResolvedValue({ status: 403, ok: false, json: async () => null });
    await expect(api('/usuarios')).rejects.toThrow('No tienes permisos');
    expect(leerSesion()).not.toBeNull();
  });
  it('limpia al expirar y al cerrar, también cuando hay datos corruptos', () => {
    vi.useFakeTimers();
    try {
      guardarSesion({ token: 'breve', usuario: {}, expira: new Date(Date.now() + 100).toISOString() });
      vi.advanceTimersByTime(101);
      expect(localStorage.getItem('sesionBikers')).toBeNull();
      localStorage.setItem('sesionBikers', '{'); expect(leerSesion()).toBeNull();
      limpiarSesion(); expect(localStorage.getItem('sesionBikers')).toBeNull();
    } finally { vi.useRealTimers(); }
  });
  it('comunica respuesta inválida y error de red', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue({ status: 500, ok: false, json: async () => { throw Error(); } });
    await expect(api('/productos')).rejects.toThrow('No se pudo completar');
    window.fetch.mockRejectedValueOnce(Error());
    await expect(api('/productos')).rejects.toThrow('No se pudo conectar');
  });
});
