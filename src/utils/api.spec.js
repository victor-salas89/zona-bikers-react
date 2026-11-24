import { describe, it, expect, vi } from 'vitest';
import { api, renovarSesion } from './api';
import { leerSesion, guardarSesion, limpiarSesion } from './sesion';
import { sesionPrueba } from '../test/apiSimulada';

describe('Sesión JWT y transporte HTTP', () => {
  it('renueva antes de una solicitud privada y comparte la renovacion concurrente', async () => {
    guardarSesion({ token: 'anterior', usuario: { rol: 'cliente' }, expira: new Date(Date.now() + 120000).toISOString() });
    const nueva = { token: 'nuevo', usuario: { rol: 'cliente' }, expira: new Date(Date.now() + 3600000).toISOString() };
    const fetch = vi.spyOn(window, 'fetch').mockImplementation(async url => ({ ok: true, status: 200, json: async () => url.endsWith('/auth/refresh') ? nueva : [] }));
    await Promise.all([api('/pedidos'), api('/pedidos')]);
    expect(fetch.mock.calls.filter(([url]) => url.endsWith('/auth/refresh'))).toHaveLength(1);
    expect(fetch.mock.calls.filter(([url]) => url.endsWith('/pedidos')).every(([, options]) => options.headers.Authorization === 'Bearer nuevo')).toBe(true);
    expect(leerSesion().token).toBe('nuevo');
  });
  it('no renueva sesiones cerradas y no restaura una sesion al recibir una respuesta tardia', async () => {
    limpiarSesion();
    const fetch = vi.spyOn(window, 'fetch');
    await expect(renovarSesion()).rejects.toThrow('Debes iniciar sesion');
    expect(fetch).not.toHaveBeenCalled();
    sesionPrueba('cliente');
    let responder;
    fetch.mockImplementation(() => new Promise(resolve => { responder = resolve; }));
    const pendiente = renovarSesion();
    await vi.waitFor(() => expect(responder).toBeTypeOf('function'));
    limpiarSesion();
    responder({ ok: true, status: 200, json: async () => ({ token: 'nuevo', usuario: {}, expira: new Date(Date.now() + 3600000).toISOString() }) });
    await pendiente;
    expect(leerSesion()).toBeNull();
  });
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
