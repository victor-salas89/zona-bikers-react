import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Checkout from './Checkout';
import ResultadoCompra from './ResultadoCompra';
import Carrito from './Carrito';
import { CarritoProvider } from '../context/CarritoContext';
import { datosComprador, validarCompra, guardarPedido, leerPedido, resumenCompra } from '../utils/pedidos';

const productos = [{ id: 1, nombre: 'Casco', precio: 10000, cantidad: 2 }, { id: 2, nombre: 'Guantes', precio: 5000, cantidad: 1 }];
const datos = { nombre: 'Ana Pérez', correo: 'ana@example.com', direccion: 'Calle 123', region: 'Región Metropolitana', comuna: 'Santiago', entrega: 'domicilio' };
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
const pedidos = () => Object.keys(localStorage).filter(k => k.startsWith('pedidoBikers:'));

describe('Checkout de demostración', () => {
  it('navega desde carrito sin vaciarlo', () => {
    abrir('/carrito'); fireEvent.click(screen.getByText('Finalizar compra'));
    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual(productos);
  });
  it('valida campos vacíos y correo incorrecto antes de comprar', () => {
    abrir(); confirmar();
    expect(screen.getByText('Ingresa un nombre de al menos 2 caracteres.')).toBeTruthy();
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy();
    expect(screen.getByText('Ingresa una dirección de al menos 5 caracteres.')).toBeTruthy();
    expect(screen.getByText('Selecciona una región.')).toBeTruthy();
    expect(screen.getByText('Selecciona una comuna de la región.')).toBeTruthy();
    expect(screen.getByText('Selecciona una opción de entrega.')).toBeTruthy();
    completar(); cambiar('Correo', 'invalido'); confirmar(); expect(pedidos()).toHaveLength(0);
  });
  it('autocompleta por correo de sesión y permite corregir datos', () => {
    localStorage.setItem('usuariosBikers', JSON.stringify([{ ...datos, contrasena: 'secreta' }]));
    sessionStorage.setItem('usuario', JSON.stringify({ correo: 'ANA@example.com', rol: 'cliente' }));
    abrir(); expect(screen.getByLabelText('Nombre').value).toBe(datos.nombre);
    expect(screen.getByLabelText('Dirección').value).toBe(datos.direccion);
    expect(screen.getByLabelText('Comuna').value).toBe(datos.comuna);
    cambiar('Nombre', 'Ana corregida'); cambiar('Opción de entrega', 'retiro'); confirmar();
    const p = JSON.parse(localStorage.getItem(pedidos()[0]));
    expect(p.comprador.nombre).toBe('Ana corregida'); expect(p.comprador.contrasena).toBeUndefined(); expect(p.total).toBe(25000);
  });
  it('acepta sesión parcial, cuenta ausente y sesión corrupta', () => {
    sessionStorage.setItem('usuario', JSON.stringify({ correo: 'cliente@gmail.com' }));
    expect(datosComprador().nombre).toBe(''); expect(datosComprador().correo).toBe('cliente@gmail.com');
    sessionStorage.setItem('usuario', JSON.stringify({ correo: 'ausente@example.com' })); expect(datosComprador().direccion).toBe('');
    sessionStorage.setItem('usuario', '{'); expect(datosComprador().correo).toBe('');
  });
  it('reinicia comuna al cambiar región y actualiza entrega y total', () => {
    abrir(); completar(); expect(screen.getByText('$28.990')).toBeTruthy();
    cambiar('Región', 'Región de Valparaíso'); expect(screen.getByLabelText('Comuna').value).toBe('');
    confirmar(); expect(pedidos()).toHaveLength(0);
    cambiar('Comuna', 'Viña del Mar'); cambiar('Opción de entrega', 'retiro');
    expect(screen.getByText('$25.000')).toBeTruthy();
    expect(screen.getByText(/Cantidad: 2/)).toBeTruthy();
  });
  it('guarda antes de vaciar, evita doble envío y restaura resultado al remontar', () => {
    abrir(); completar(); const boton = screen.getByRole('button', { name: 'Confirmar compra simulada' });
    const original = Storage.prototype.setItem;
    let carritoAlGuardar;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(k, v) {
      if (k.startsWith('pedidoBikers:')) carritoAlGuardar = JSON.parse(localStorage.getItem('carritoBikers'));
      return original.call(this, k, v);
    });
    act(() => {
      boton.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      boton.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(pedidos()).toHaveLength(1); expect(carritoAlGuardar).toEqual(productos);
    expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual([]);
    const p = JSON.parse(localStorage.getItem(pedidos()[0])); expect(p.total).toBe(28990); expect(p.subtotal).toBe(25000); expect(p.costoEntrega).toBe(3990);
    cleanup(); abrir(`/compra/${p.id}`, false); expect(screen.getByRole('heading', { name: 'Compra aprobada' })).toBeTruthy(); expect(screen.getByText('$28.990')).toBeTruthy();
  });
  it('rechaza, conserva carrito y permite reintentar con aprobación', () => {
    abrir(); completar(); cambiar('Resultado a simular', 'rechazada'); confirmar();
    expect(screen.getByRole('heading', { name: 'Compra rechazada' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual(productos);
    const p = JSON.parse(localStorage.getItem(pedidos()[0])); cleanup(); abrir(`/compra/${p.id}`, false);
    fireEvent.click(screen.getByText('Reintentar compra')); completar(); confirmar();
    expect(screen.getByRole('heading', { name: 'Compra aprobada' })).toBeTruthy(); expect(pedidos()).toHaveLength(2);
  });
  it('conserva carrito cuando falla guardado y permite reintentar', () => {
    abrir(); completar(); const original = Storage.prototype.setItem;
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(k, v) { if (k.startsWith('pedidoBikers:')) throw new Error('cuota'); return original.call(this, k, v); });
    confirmar(); expect(screen.getByText(/No se pudo guardar el pedido/)).toBeTruthy(); expect(pedidos()).toHaveLength(0); expect(JSON.parse(localStorage.getItem('carritoBikers'))).toEqual(productos);
    spy.mockRestore(); confirmar(); expect(pedidos()).toHaveLength(1);
  });
  it('impide compra vacía y muestra resultado inexistente o corrupto sin caerse', () => {
    abrir('/checkout', false); expect(screen.queryByRole('button', { name: 'Confirmar compra simulada' })).toBeNull();
    expect(() => guardarPedido([], datos, 'aprobada')).toThrow();
    cleanup(); abrir('/compra/no-existe', false); expect(screen.getByText('Pedido no disponible')).toBeTruthy();
    localStorage.setItem('pedidoBikers:roto', '{'); expect(leerPedido('roto')).toBeNull();
    localStorage.setItem('pedidoBikers:roto', '{}'); expect(leerPedido('roto')).toBeNull();
  });
  it('rechaza región, comuna, entrega y estado inválidos; calcula ambas tarifas', () => {
    expect(validarCompra({ ...datos, region: 'Otra', entrega: 'otra' })).toHaveProperty('entrega');
    expect(validarCompra({ ...datos, comuna: 'Otra' })).toHaveProperty('comuna');
    expect(() => guardarPedido(productos, { ...datos, nombre: '' }, 'aprobada')).toThrow();
    expect(() => guardarPedido(productos, datos, 'otro')).toThrow();
    expect(resumenCompra(productos, 'retiro').total).toBe(25000); expect(resumenCompra(productos, 'domicilio').total).toBe(28990);
  });
});
