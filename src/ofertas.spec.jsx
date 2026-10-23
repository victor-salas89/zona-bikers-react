import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, within, renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { CarritoProvider, useCarrito } from './context/CarritoContext';
import { cargarProductos, guardarProducto } from './utils/catalogo';
import { categorias, categoriaProducto } from './utils/categorias';
import { precioVigente, tieneOferta, validarOferta } from './utils/precios';

const casco = { id: 1, codigo: 'CAS001', nombre: 'Casco Ruta', descripcion: 'Casco de prueba', categoria: 'cascos', precio: 10000, precioOferta: 8000, stock: 10, imagen: '/img/catalogo.svg', alt: 'Casco' };
const productos = [casco, { ...casco, id: 2, codigo: 'CAS002', nombre: 'Casco Urbano', precioOferta: null }, { ...casco, id: 3, codigo: 'GUA001', nombre: 'Guantes Ruta', categoria: 'guantes', precio: 5000, precioOferta: 4000 }];
function abrir(ruta) {
  return render(<MemoryRouter initialEntries={[ruta]}><CarritoProvider><App /></CarritoProvider></MemoryRouter>);
}
const cambiar = (nombre, value) => fireEvent.change(screen.getByLabelText(nombre), { target: { value } });
const click = nombre => fireEvent.click(screen.getByRole('button', { name: nombre }));
const tarjetas = () => screen.queryAllByRole('article');
const cuenta = { nombre: 'Ana', correo: 'ana@example.com', direccion: 'Calle 123', region: 'Región Metropolitana', comuna: 'Santiago' };

beforeEach(() => {
  vi.spyOn(window, 'fetch').mockResolvedValue({ ok: true, json: async () => productos });
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

describe('Categorías públicas y ofertas', () => {
  it('asigna categorías válidas a todos los productos iniciales y ofertas coherentes', async () => {
    window.fetch.mockRestore();
    const iniciales = await (await fetch('/data/productos.json')).json();
    expect(iniciales.every(p => categorias.includes(p.categoria))).toBe(true);
    expect(iniciales.filter(tieneOferta).length).toBeGreaterThan(0);
    iniciales.forEach(p => expect(validarOferta(p.precio, p.precioOferta)).toBe(''));
  });

  it('filtra por categoría, combina búsqueda sin distinguir mayúsculas y vuelve a Todos', async () => {
    abrir('/productos'); await screen.findByText('Casco Ruta');
    cambiar('Categoría', 'cascos'); expect(tarjetas()).toHaveLength(2);
    cambiar('Buscar por nombre', ' RUTA '); expect(tarjetas()).toHaveLength(1);
    expect(within(tarjetas()[0]).getByText('Casco Ruta')).toBeTruthy();
    cambiar('Categoría', ''); expect(tarjetas()).toHaveLength(2);
    cambiar('Buscar por nombre', ''); expect(tarjetas()).toHaveLength(3);
  });

  it('restaura filtros de la URL y muestra resultados vacíos por categoría o búsqueda', async () => {
    abrir('/productos?categoria=cascos&buscar=Urbano');
    await screen.findByText('Casco Urbano'); expect(tarjetas()).toHaveLength(1);
    expect(screen.getByLabelText('Categoría').value).toBe('cascos');
    cambiar('Buscar por nombre', 'inexistente'); expect(screen.getByRole('status').textContent).toContain('No hay productos');
    cambiar('Buscar por nombre', ''); cambiar('Categoría', 'otros'); expect(tarjetas()).toHaveLength(0);
  });

  it('abre Ofertas desde el menú y permite combinar categoría y búsqueda', async () => {
    abrir('/productos'); await screen.findByText('Casco Urbano');
    fireEvent.click(screen.getByRole('link', { name: 'Ofertas' }));
    expect(await screen.findByRole('heading', { name: 'Ofertas' })).toBeTruthy();
    expect(tarjetas()).toHaveLength(2); expect(screen.queryByText('Casco Urbano')).toBeNull();
    cambiar('Categoría', 'guantes'); cambiar('Buscar por nombre', 'ruta'); expect(tarjetas()).toHaveLength(1);
    expect(screen.getByText('$4.000')).toBeTruthy(); expect(screen.getByText('$5.000').tagName).toBe('DEL');
    cambiar('Buscar por nombre', 'casco'); expect(screen.getByRole('status')).toBeTruthy();
  });

  it('muestra Ofertas vacía cuando ninguna oferta es válida y comunica errores de carga', async () => {
    localStorage.setItem('productosBikers', JSON.stringify([{ ...casco, precioOferta: 0 }]));
    abrir('/ofertas'); expect(await screen.findByRole('status')).toBeTruthy();
    cleanup(); window.fetch.mockRejectedValue(new Error('sin red'));
    abrir('/ofertas'); expect(await screen.findByText('No se pudieron cargar los productos.')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('mantiene productos locales antiguos sin escribir ni borrar almacenamiento al leerlos', async () => {
    const antiguos = [{ ...casco, categoria: undefined, precioOferta: undefined }, { ...casco, id: 99, codigo: 'LEGADO', categoria: 'invalida', precioOferta: undefined }];
    const guardados = JSON.stringify(antiguos); localStorage.setItem('productosBikers', guardados);
    const lista = await cargarProductos();
    expect(lista.map(p => p.categoria)).toEqual(['cascos', 'otros']);
    expect(precioVigente(lista[0])).toBe(10000);
    expect(localStorage.getItem('productosBikers')).toBe(guardados);
    expect(categoriaProducto({ categoria: 'chaquetas' })).toBe('chaquetas');
  });

  it('rechaza ofertas no positivas, iguales, superiores o no numéricas sin guardar', async () => {
    for (const precioOferta of [-1, 0, 10000, 10001, 'abc', Infinity]) {
      expect(validarOferta(10000, precioOferta)).not.toBe('');
      await expect(guardarProducto({ ...casco, precioOferta }, 1)).rejects.toThrow('El precio de oferta');
      expect(precioVigente({ ...casco, precioOferta })).toBe(10000);
    }
    await expect(guardarProducto({ ...casco, categoria: 'incorrecta' }, 1)).rejects.toThrow('categoría válida');
    expect(localStorage.getItem('productosBikers')).toBeNull();
    expect(validarOferta(10000, '')).toBe(''); expect(validarOferta(10000, null)).toBe('');
  });

  it('crea producto con categoría y oferta desde administración y lo publica en Ofertas', async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ correo: 'admin@duoc.cl', rol: 'administrador' }));
    abrir('/admin-nuevo-producto');
    cambiar('Código', 'CHA002'); cambiar('Nombre', 'Chaqueta Nueva'); cambiar('Descripción', 'Chaqueta de prueba');
    cambiar('Precio', '20000'); cambiar('Stock', '4'); cambiar('Categoría', 'chaquetas');
    cambiar('Precio de oferta (opcional)', '20000'); click('Guardar producto');
    expect(screen.getByText('El precio de oferta debe ser positivo y menor al precio normal.')).toBeTruthy();
    cambiar('Precio de oferta (opcional)', '15000'); click('Guardar producto');
    await screen.findByText('Chaqueta Nueva');
    const creado = (await cargarProductos()).find(p => p.codigo === 'CHA002');
    expect(creado.categoria).toBe('chaquetas'); expect(creado.precioOferta).toBe(15000);
    fireEvent.click(screen.getByRole('link', { name: 'Ofertas' }));
    await screen.findByText('Chaqueta Nueva'); expect(screen.getByText('$15.000')).toBeTruthy();
  });

  it('edita categoría y oferta, valida bajar el precio normal y permite retirar la oferta', async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ correo: 'admin@duoc.cl', rol: 'administrador' }));
    abrir('/admin-nuevo-producto?id=1'); await screen.findByLabelText('Nombre');
    expect(screen.getByLabelText('Categoría').value).toBe('cascos'); expect(screen.getByLabelText('Precio de oferta (opcional)').value).toBe('8000');
    cambiar('Precio', '7000'); click('Guardar producto'); expect(screen.getByText(/El precio de oferta debe/)).toBeTruthy();
    cambiar('Precio de oferta (opcional)', '6000'); cambiar('Categoría', 'otros'); click('Guardar producto');
    await screen.findByText('Casco Ruta'); expect((await cargarProductos())[0]).toMatchObject({ categoria: 'otros', precio: 7000, precioOferta: 6000 });
    fireEvent.click(screen.getByRole('link', { name: 'Editar Casco Ruta' })); await screen.findByLabelText('Nombre');
    cambiar('Precio de oferta (opcional)', ''); click('Guardar producto'); await screen.findByText('Casco Ruta');
    expect((await cargarProductos())[0].precioOferta).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: 'Ofertas' })); await screen.findByText('Guantes Ruta');
    expect(screen.queryByText('Casco Ruta')).toBeNull();
  });

  it('usa el mismo precio en catálogo, detalle, carrito, checkout y pedido recargado', async () => {
    abrir('/ofertas'); await screen.findByText('Casco Ruta');
    const tarjeta = tarjetas().find(t => t.textContent.includes('Casco Ruta'));
    expect(within(tarjeta).getByText('$8.000')).toBeTruthy();
    fireEvent.click(within(tarjeta).getByRole('button', { name: 'Ver detalle' }));
    expect(await screen.findByText('Precio: $8.000')).toBeTruthy();
    cambiar('Cantidad', '2');
    const detalle = screen.getByRole('heading', { name: 'Detalle del producto' }).closest('section');
    fireEvent.click(within(detalle).getByRole('button', { name: 'Agregar al carrito' }));
    fireEvent.click(screen.getByRole('link', { name: 'Carrito' }));
    expect(screen.getByText('Precio: $8.000')).toBeTruthy(); expect(screen.getByText('$16.000')).toBeTruthy();
    cleanup(); abrir('/carrito'); expect(screen.getByText('$16.000')).toBeTruthy();
    click('Finalizar compra');
    expect(screen.getByText(/Cantidad: 2 — \$8.000 c\/u — \$16.000/)).toBeTruthy();
    for (const [etiqueta, campo] of [['Nombre', 'nombre'], ['Correo', 'correo'], ['Dirección', 'direccion'], ['Región', 'region'], ['Comuna', 'comuna']]) cambiar(etiqueta, cuenta[campo]);
    cambiar('Opción de entrega', 'domicilio'); expect(screen.getByText('$19.990')).toBeTruthy();
    click('Confirmar compra simulada'); expect(screen.getByRole('heading', { name: 'Compra aprobada' })).toBeTruthy();
    const clave = Object.keys(localStorage).find(k => k.startsWith('pedidoBikers:'));
    const pedido = JSON.parse(localStorage.getItem(clave));
    expect(pedido.productos[0].precio).toBe(8000); expect(pedido.productos[0].precioOferta).toBeUndefined(); expect(pedido.total).toBe(19990);
    localStorage.setItem('productosBikers', JSON.stringify([{ ...casco, precioOferta: 5000 }]));
    cleanup(); abrir(`/compra/${pedido.id}`); expect(screen.getByText('$19.990')).toBeTruthy();
    expect(screen.getByText(/Cantidad: 2 — \$8.000 c\/u/)).toBeTruthy();
  });

  it('restaura carrito antiguo sin descuento y actualiza el precio al agregar desde el catálogo', () => {
    localStorage.setItem('carritoBikers', JSON.stringify([{ ...casco, precioOferta: undefined, cantidad: 2 }]));
    const { result } = renderHook(() => useCarrito(), { wrapper: CarritoProvider });
    expect(result.current.total).toBe(20000); expect(result.current.cantidadTotal).toBe(2);
    act(() => result.current.agregar(casco)); expect(result.current.total).toBe(24000); expect(result.current.cantidadTotal).toBe(3);
    act(() => result.current.cambiarCantidad(1, 4)); expect(result.current.total).toBe(32000);
    act(() => result.current.agregar({ ...casco, precioOferta: undefined })); expect(result.current.total).toBe(50000);
    expect(JSON.parse(localStorage.getItem('carritoBikers'))[0].cantidad).toBe(5);
  });

  it('conserva precio y unidades de oferta ante rechazo y permite reintentar', async () => {
    localStorage.setItem('carritoBikers', JSON.stringify([{ ...casco, cantidad: 2 }]));
    localStorage.setItem('usuariosBikers', JSON.stringify([cuenta])); sessionStorage.setItem('usuario', JSON.stringify({ correo: cuenta.correo, rol: 'cliente' }));
    abrir('/checkout'); cambiar('Opción de entrega', 'retiro'); cambiar('Resultado a simular', 'rechazada'); click('Confirmar compra simulada');
    expect(screen.getByRole('heading', { name: 'Compra rechazada' })).toBeTruthy();
    expect(screen.getByText('$16.000')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('carritoBikers'))[0]).toMatchObject({ precio: 10000, precioOferta: 8000, cantidad: 2 });
    fireEvent.click(screen.getByRole('link', { name: 'Reintentar compra' })); cambiar('Opción de entrega', 'retiro'); click('Confirmar compra simulada');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Compra aprobada' })).toBeTruthy());
    expect(screen.getByText('$16.000')).toBeTruthy();
  });
});
