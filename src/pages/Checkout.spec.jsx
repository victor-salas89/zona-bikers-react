import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Checkout from './Checkout';
import ResultadoCompra from './ResultadoCompra';
import Carrito from './Carrito';
import { CarritoProvider } from '../context/CarritoContext';
import { datosComprador, validarCompra, guardarPedido, leerPedido, resumenCompra } from '../utils/pedidos';
import { simularApi, sesionPrueba } from '../test/apiSimulada';

const productos = [{ id: 1, nombre: 'Casco', precio: 10000, cantidad: 2 }, { id: 2, nombre: 'Guantes', precio: 5000, cantidad: 1 }];
const datos = { nombre: 'Ana Pérez', correo: 'ana@example.com', direccion: 'Calle 123', region: 'Región Metropolitana', comuna: 'Santiago', entrega: 'domicilio' };
let simulacion;
beforeEach(() => { simulacion = simularApi(productos); });
function abrir(ruta = '/checkout', cargar = true) {
  if (cargar) localStorage.setItem('carritoBikers', JSON.stringify(productos));
  return render(<MemoryRouter initialEntries={[ruta]}><CarritoProvider><Routes>
    <Route path="/checkout" element={<Checkout />} /><Route path="/compra/:id" element={<ResultadoCompra />} /><Route path="/carrito" element={<Carrito />} />
  </Routes></CarritoProvider></MemoryRouter>);
}
const cambiar = (etiqueta, value) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
function completar() {
  for (const [etiqueta, campo] of [['Nombre', 'nombre'], ['Correo', 'correo'], ['Dirección', 'direccion'], ['Región', 'region'], ['Comuna', 'comuna'], ['Opción de entrega', 'entrega']]) cambiar(etiqueta, datos[campo]);
}
const confirmar = () => fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra simulada' }));
const pedidos = () => simulacion.estado.pedidos;

describe('Checkout de demostración', () => {
  it('navega desde carrito sin vaciarlo', () => {
    abrir('/carrito'); fireEvent.click(screen.getByText('Finalizar compra'));
    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual(productos);
  });
  it('valida campos vacíos y correo incorrecto antes de comprar', () => {
    abrir(); confirmar();
    for (const texto of ['Ingresa un nombre de al menos 2 caracteres.', 'Ingresa un correo válido.', 'Ingresa una dirección de al menos 5 caracteres.', 'Selecciona una región.', 'Selecciona una comuna de la región.', 'Selecciona una opción de entrega.']) expect(screen.getByText(texto)).toBeTruthy();
    completar(); cambiar('Correo', 'invalido'); confirmar(); expect(pedidos()).toHaveLength(0);
  });
  it('autocompleta por correo de sesión y permite corregir datos', async () => {
    sesionPrueba('cliente', datos);
    abrir(); expect(screen.getByLabelText('Nombre').value).toBe(datos.nombre);
    expect(screen.getByLabelText('Dirección').value).toBe(datos.direccion);
    expect(screen.getByLabelText('Comuna').value).toBe(datos.comuna);
    cambiar('Nombre', 'Ana corregida'); cambiar('Opción de entrega', 'retiro'); confirmar();
    await screen.findByRole('heading', { name: 'Compra aprobada' });
    const p = pedidos()[0];
    expect(p.comprador.nombre).toBe('Ana corregida'); expect(p.comprador.contrasena).toBeUndefined(); expect(p.total).toBe(25000);
  });
  it('acepta sesión parcial, cuenta ausente y sesión corrupta', () => {
    sesionPrueba('cliente', { correo: 'cliente@gmail.com' });
    expect(datosComprador().nombre).toBe(''); expect(datosComprador().correo).toBe('cliente@gmail.com');
    sesionPrueba('cliente', { correo: 'ausente@example.com' }); expect(datosComprador().direccion).toBe('');
    localStorage.setItem('sesionBikers', '{'); expect(datosComprador().correo).toBe('');
  });
  it('reinicia comuna al cambiar región y actualiza entrega y total', () => {
    abrir(); completar(); expect(screen.getByText('$28.990')).toBeTruthy();
    cambiar('Región', 'Región de Valparaíso'); expect(screen.getByLabelText('Comuna').value).toBe('');
    confirmar(); expect(pedidos()).toHaveLength(0);
    cambiar('Comuna', 'Viña del Mar'); cambiar('Opción de entrega', 'retiro');
    expect(screen.getByText('$25.000')).toBeTruthy(); expect(screen.getByText(/Cantidad: 2/)).toBeTruthy();
  });
  it('guarda antes de vaciar, evita doble envío y restaura resultado al remontar', async () => {
    abrir(); completar(); const boton = screen.getByRole('button', { name: 'Confirmar compra simulada' });
    let resolver;
    simulacion.fetch.mockImplementationOnce((...args) => new Promise(resolve => { resolver = async () => resolve(await simulacion.handler(...args)); }));
    act(() => {
      boton.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      boton.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(simulacion.fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual(productos);
    await act(async () => resolver());
    await screen.findByRole('heading', { name: 'Compra aprobada' });
    expect(pedidos()).toHaveLength(1); expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual([]);
    const p = pedidos()[0]; expect(p.total).toBe(28990); expect(p.subtotal).toBe(25000); expect(p.costoEntrega).toBe(3990);
    cleanup(); abrir(`/compra/${p.id}`, false); expect(await screen.findByText('$28.990')).toBeTruthy();
  });
  it('rechaza, conserva carrito y permite reintentar con aprobación', async () => {
    abrir(); completar(); cambiar('Resultado a simular', 'rechazada'); confirmar();
    await screen.findByRole('heading', { name: 'Compra rechazada' });
    expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual(productos);
    const p = pedidos()[0]; cleanup(); abrir(`/compra/${p.id}`, false);
    fireEvent.click(await screen.findByText('Reintentar compra')); completar(); confirmar();
    await screen.findByRole('heading', { name: 'Compra aprobada' }); expect(pedidos()).toHaveLength(2);
  });
  it('conserva carrito cuando falla guardado y permite reintentar', async () => {
    abrir(); completar(); simulacion.fetch.mockRejectedValueOnce(new Error('sin red'));
    confirmar(); expect(await screen.findByText(/No se pudo conectar/)).toBeTruthy();
    expect(pedidos()).toHaveLength(0); expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual(productos);
    const primeraClave = JSON.parse(simulacion.fetch.mock.calls[0][1].body).clave;
    confirmar(); await screen.findByRole('heading', { name: 'Compra aprobada' });
    expect(pedidos()).toHaveLength(1); expect(pedidos()[0].clave).toBe(primeraClave);
  });
  it('impide compra vacía y muestra resultado inexistente o corrupto sin caerse', async () => {
    abrir('/checkout', false); expect(screen.queryByRole('button', { name: 'Confirmar compra simulada' })).toBeNull();
    await expect(guardarPedido([], datos, 'aprobada')).rejects.toThrow();
    cleanup(); abrir('/compra/no-existe', false); expect(await screen.findByText('Pedido no disponible')).toBeTruthy();
    await expect(leerPedido('roto')).rejects.toThrow();
  });
  it('rechaza región, comuna, entrega y estado inválidos; calcula ambas tarifas', async () => {
    expect(validarCompra({ ...datos, region: 'Otra', entrega: 'otra' })).toHaveProperty('entrega');
    expect(validarCompra({ ...datos, comuna: 'Otra' })).toHaveProperty('comuna');
    await expect(guardarPedido(productos, { ...datos, nombre: '' }, 'aprobada')).rejects.toThrow();
    await expect(guardarPedido(productos, datos, 'otro')).rejects.toThrow();
    expect(resumenCompra(productos, 'retiro').total).toBe(25000); expect(resumenCompra(productos, 'domicilio').total).toBe(28990);
  });
});
