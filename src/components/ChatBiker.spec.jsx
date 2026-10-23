import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import ChatBiker from './ChatBiker';

const respuestaApi = (respuesta = 'Elige un casco de tu talla.') => ({
  ok: true, json: () => Promise.resolve({ respuesta }),
});

function abrir(entorno) {
  render(<ChatBiker entorno={entorno} />);
  const boton = screen.getByRole('button', { name: /Biker IA/ });
  fireEvent.click(boton);
  return { boton, entrada: screen.getByRole('textbox', { name: 'Tu consulta sobre motocicletas' }) };
}
function escribir(texto) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value: texto } });
}
function enviar() { fireEvent.click(screen.getByRole('button', { name: 'Enviar' })); }

 describe('ChatBiker', () => {
  let fetchSimulado;
  beforeEach(() => {
    // Ninguna prueba puede acceder a la API real, incluso si falta configurar una respuesta.
    fetchSimulado = vi.spyOn(window, 'fetch').mockImplementation(() => Promise.reject(new Error('Fetch sin respuesta simulada')));
    vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => new AbortController().signal);
  });
  afterEach(cleanup);

  it('usa /api/chat en desarrollo local sin URL pública', async () => {
    fetchSimulado.mockReturnValue(Promise.resolve(respuestaApi()));
    abrir({ PROD: false, VITE_CHAT_API_URL: '' });
    escribir('Hola'); enviar();
    await screen.findByText('Elige un casco de tu talla.');
    expect(fetchSimulado.mock.calls[0][0]).toBe('/api/chat');
  });

  for (const produccion of [false, true]) {
    it(`usa la URL pública configurada con PROD=${produccion}`, async () => {
      fetchSimulado.mockReturnValue(Promise.resolve(respuestaApi()));
      abrir({ PROD: produccion, VITE_CHAT_API_URL: ' https://api.example.com/api/chat ' });
      escribir('Necesito un casco'); enviar();
      await screen.findByText('Elige un casco de tu talla.');
      expect(fetchSimulado.mock.calls[0][0]).toBe('https://api.example.com/api/chat');
      expect(screen.queryByRole('alert')).toBeNull();
    });
  }

  for (const url of [undefined, '', '   ']) {
    it(`avisa y bloquea solicitudes en producción con URL ${JSON.stringify(url)}`, () => {
      const { entrada } = abrir({ PROD: true, VITE_CHAT_API_URL: url });
      expect(screen.getByRole('alert').textContent).toContain('todavía no se ha configurado el servidor');
      escribir('Hola');
      expect(screen.getByRole('button', { name: 'Enviar' }).disabled).toBe(true);
      enviar();
      fireEvent.submit(entrada.form);
      expect(fetchSimulado).not.toHaveBeenCalled();
      expect(screen.queryByRole('status')).toBeNull();
    });
  }

  it('abre, enfoca la entrada y alterna el chat desde el acceso flotante', () => {
    render(<ChatBiker />);
    const boton = screen.getByRole('button', { name: /Biker IA/ });
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('log')).toBeNull();
    fireEvent.click(boton);
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(screen.getByRole('log')).toBeTruthy();
    fireEvent.click(boton);
    expect(screen.queryByRole('log')).toBeNull();
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  for (const cierre of ['botón', 'Escape']) {
    it(`cierra con ${cierre} y devuelve el foco al acceso flotante`, () => {
      const { boton, entrada } = abrir();
      if (cierre === 'Escape') fireEvent.keyDown(entrada, { key: 'Escape' });
      else fireEvent.click(screen.getByRole('button', { name: 'Cerrar chat' }));
      expect(screen.queryByRole('log')).toBeNull();
      expect(boton.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(boton);
      fireEvent.click(boton);
      expect(document.activeElement).toBe(screen.getByRole('textbox'));
    });
  }

  it('impide mensajes vacíos o de espacios, incluso al enviar el formulario directamente', () => {
    const { entrada } = abrir();
    expect(screen.getByRole('button', { name: 'Enviar' }).disabled).toBe(true);
    fireEvent.submit(entrada.form);
    escribir('   \n  ');
    expect(screen.getByRole('button', { name: 'Enviar' }).disabled).toBe(true);
    fireEvent.submit(entrada.form);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it('envía la consulta recortada, muestra ambas intervenciones y conserva el historial para el seguimiento', async () => {
    fetchSimulado.mockImplementation(() => Promise.resolve(respuestaApi()));
    const { entrada } = abrir();
    escribir('  ¿Qué casco elegir?  ');
    enviar();
    expect(await screen.findByText('Elige un casco de tu talla.')).toBeTruthy();
    expect(within(screen.getByRole('log')).getByText('¿Qué casco elegir?')).toBeTruthy();
    expect(entrada.value).toBe('');
    const [url, opciones] = fetchSimulado.mock.calls[0];
    expect(url).toBe('/api/chat');
    expect(opciones.method).toBe('POST');
    expect(opciones.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(opciones.body)).toEqual({ mensajes: [{ role: 'user', text: '¿Qué casco elegir?' }] });
    expect(opciones.signal instanceof AbortSignal).toBe(true);
    escribir('¿Y para viajar?');
    fetchSimulado.mockReturnValue(Promise.resolve(respuestaApi('Busca comodidad para trayectos largos.')));
    enviar();
    await screen.findByText('Busca comodidad para trayectos largos.');
    expect(JSON.parse(fetchSimulado.mock.calls.at(-1)[1].body).mensajes).toEqual([
      { role: 'user', text: '¿Qué casco elegir?' },
      { role: 'model', text: 'Elige un casco de tu talla.' },
      { role: 'user', text: '¿Y para viajar?' },
    ]);
  });

  it('muestra espera, bloquea edición y envíos duplicados y vuelve a habilitar los controles', async () => {
    let resolver;
    fetchSimulado.mockReturnValue(new Promise(resolve => { resolver = resolve; }));
    const { entrada } = abrir();
    escribir('Necesito guantes');
    enviar();
    expect(screen.getByRole('status').textContent).toContain('Consultando');
    expect(screen.getByRole('button', { name: 'Consultando…' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Limpiar chat' }).disabled).toBe(true);
    expect(entrada.readOnly).toBe(true);
    fireEvent.submit(entrada.form);
    fireEvent.click(screen.getByRole('button', { name: 'Consultando…' }));
    expect(fetchSimulado.mock.calls.length).toBe(1);
    await act(async () => { resolver(respuestaApi()); });
    expect(screen.queryByRole('status')).toBeNull();
    expect(entrada.readOnly).toBe(false);
    escribir('Otra consulta');
    expect(screen.getByRole('button', { name: 'Enviar' }).disabled).toBe(false);
  });

  const fallos = [
    ['servidor', () => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Gemini está saturado.' }) }), 'Gemini está saturado.'],
    ['conexión', () => Promise.reject(new TypeError('Failed to fetch')), 'Failed to fetch'],
    ['tiempo agotado', () => Promise.reject(new DOMException('Timeout', 'TimeoutError')), 'La respuesta tardó demasiado. Inténtalo nuevamente.'],
    ['error sin mensaje', () => Promise.reject({}), 'No pudimos conectar. Inténtalo nuevamente.'],
    ['JSON inválido', () => Promise.resolve({ ok: false, json: () => Promise.reject(new SyntaxError('JSON inválido')) }), 'El asistente no está disponible. Puedes escribirnos por WhatsApp.'],
    ['respuesta vacía', () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }), 'El asistente no está disponible. Puedes escribirnos por WhatsApp.'],
  ];
  for (const [nombre, simular, mensaje] of fallos) {
    it(`muestra el error de ${nombre}, conserva la consulta y permite reintentar`, async () => {
      fetchSimulado.mockImplementation(simular);
      const { entrada } = abrir();
      escribir('Quiero una chaqueta');
      enviar();
      expect((await screen.findByRole('alert')).textContent).toBe(mensaje);
      expect(entrada.value).toBe('Quiero una chaqueta');
      expect(entrada.readOnly).toBe(false);
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.getByRole('button', { name: 'Enviar' }).disabled).toBe(false);
      fetchSimulado.mockReturnValue(Promise.resolve(respuestaApi()));
      enviar();
      await screen.findByText('Elige un casco de tu talla.');
      expect(screen.queryByRole('alert')).toBeNull();
      expect(fetchSimulado.mock.calls.length).toBe(2);
    });
  }

  it('limpia conversación y errores, devuelve el foco y no reenvía el historial borrado', async () => {
    fetchSimulado.mockReturnValue(Promise.resolve(respuestaApi()));
    const { entrada } = abrir();
    expect(screen.getByRole('button', { name: 'Limpiar chat' }).disabled).toBe(true);
    escribir('Consulta anterior'); enviar();
    await screen.findByText('Elige un casco de tu talla.');
    fetchSimulado.mockReturnValue(Promise.reject(new Error('Sin conexión')));
    escribir('Consulta pendiente'); enviar();
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar chat' }));
    expect(screen.queryByText('Consulta anterior')).toBeNull();
    expect(screen.queryByText('Elige un casco de tu talla.')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(document.activeElement).toBe(entrada);
    expect(screen.getByRole('button', { name: 'Limpiar chat' }).disabled).toBe(true);
    expect(screen.getByRole('log').textContent).toContain('Soy el asistente');
    fetchSimulado.mockReturnValue(Promise.resolve(respuestaApi('Nueva respuesta')));
    enviar(); await screen.findByText('Nueva respuesta');
    expect(JSON.parse(fetchSimulado.mock.calls.at(-1)[1].body).mensajes).toEqual([{ role: 'user', text: 'Consulta pendiente' }]);
  });
});
