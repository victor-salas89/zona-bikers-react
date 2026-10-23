import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { CarritoProvider, useCarrito } from './context/CarritoContext';
import { validarRut, validarDominioCorreo, validarLogin, validarRegistro } from './utils/validaciones';
import { cargarLista, leerLista, guardarLista } from './utils/almacenamiento';
import { cargarProductos, guardarProducto, eliminarProducto } from './utils/catalogo';
import { guardarUsuario, obtenerUsuarios, eliminarUsuario } from './utils/cuentas';
const producto = {
  id: 1,
  codigo: 'CAS001',
  nombre: 'Casco de prueba',
  descripcion: 'Protección de prueba',
  precio: 10000,
  stock: 3,
  imagen: '/casco.svg',
  alt: 'Casco negro'
};
const noticias = [{
  id: 1,
  titulo: 'Consejos de casco',
  fecha: '2026-10-22',
  contenido: 'Usa casco adecuado.',
  tituloVideo: 'Video casco',
  video: 'about:blank',
  enlace: '/detalle-blog1'
}, {
  id: 2,
  titulo: 'Consejos de ruta',
  fecha: '2026-10-22',
  contenido: 'Prepara tu viaje.',
  tituloVideo: 'Video ruta',
  video: 'about:blank',
  enlace: '/detalle-blog2'
}];
const equipo = [{
  id: 1,
  nombre: 'Víctor Salas',
  bio: 'Estudiante de desarrollo',
  rol: 'Integración',
  foto: 'img/perfil.svg',
  alt: 'Avatar ilustrado',
  tecnologias: ['React']
}];
const proyectos = [{
  id: 1,
  titulo: 'Catálogo interactivo',
  descripcion: 'Catálogo del proyecto',
  imagen: 'img/catalogo.svg',
  alt: 'Catálogo ilustrado',
  tecnologias: ['React'],
  demo: '/productos'
}];
function datosJSON() {
  vi.spyOn(window, 'fetch').mockImplementation(url => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(String(url).includes('noticias') ? noticias : String(url).includes('equipo') ? equipo : String(url).includes('proyectos') ? proyectos : [producto])
  }));
}
function abrir(ruta = '/') {
  return render(<MemoryRouter initialEntries={[ruta]}><CarritoProvider><App /></CarritoProvider></MemoryRouter>);
}
function sesion(rol = 'administrador') {
  sessionStorage.setItem('usuario', JSON.stringify({
    correo: 'admin@duoc.cl',
    rol
  }));
}
function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), {
    target: {
      value: valor
    }
  });
}
function enviar(nombre) {
  fireEvent.click(screen.getByRole('button', {
    name: nombre
  }));
}
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => cleanup());
describe('Validaciones y límites', () => {
  for (const correo of ['a@gmail.com', 'a@duoc.cl', 'a@profesor.duoc.cl', 'A@GMAIL.COM']) it(`acepta ${correo}`, () => expect(validarDominioCorreo(correo)).toBe(true));
  for (const correo of ['@gmail.com', 'a b@gmail.com', 'a@@gmail.com', 'a@example.com', '']) it(`rechaza correo inválido ${correo}`, () => expect(validarDominioCorreo(correo)).toBe(false));
  it('acepta RUN de dígito correcto y rechaza uno alterado', () => {
    expect(validarRut('123456785')).toBe(true);
    expect(validarRut('123456784')).toBe(false);
  });
  for (const rut of ['', '12', '12.345.678-5', 'abcdefgh', '123456789012', '12345K']) it(`rechaza RUN ${rut}`, () => expect(validarRut(rut)).toBe(false));
  it('exige credenciales', () => expect(Object.keys(validarLogin('', '')).length).toBe(2));
  it('acepta credenciales válidas', () => expect(validarLogin('a@gmail.com', '12345')).toEqual({}));
  it('rechaza credenciales largas', () => expect(Object.keys(validarLogin('a'.repeat(101) + '@gmail.com', '1'.repeat(11))).length).toBe(2));
  it('rechaza dominio y contraseña corta', () => expect(Object.keys(validarLogin('a@example.com', '1')).length).toBe(2));
  const registro = {
    run: '123456785',
    nombre: 'Ana',
    apellidos: 'Soto',
    correo: 'ana@gmail.com',
    direccion: 'Calle 1'
  };
  it('acepta registro válido', () => expect(validarRegistro(registro)).toEqual({}));
  it('exige campos del registro', () => expect(Object.keys(validarRegistro({
    run: '',
    nombre: '',
    apellidos: '',
    correo: '',
    direccion: ''
  })).length).toBe(5));
  it('rechaza límites de longitud', () => expect(Object.keys(validarRegistro({
    ...registro,
    nombre: 'x'.repeat(51),
    apellidos: 'x'.repeat(101),
    correo: 'x'.repeat(101),
    direccion: 'x'.repeat(301)
  })).length).toBe(4));
  it('rechaza RUN y dominio inválidos', () => expect(Object.keys(validarRegistro({
    ...registro,
    run: '123456784',
    correo: 'a@example.com'
  })).length).toBe(2));
});
describe('Persistencia y catálogo', () => {
  it('rechaza JSON corrupto y estructuras distintas de lista', () => {
    localStorage.setItem('lista', '{');
    expect(leerLista('lista')).toEqual([]);
    localStorage.setItem('lista', '{}');
    expect(leerLista('lista', [1])).toEqual([1]);
  });
  it('guarda y recupera listas', () => {
    guardarLista('lista', [1]);
    expect(leerLista('lista')).toEqual([1]);
  });
  it('rechaza un HTTP fallido', async () => {
    vi.spyOn(window, 'fetch').mockReturnValue(Promise.resolve({
      ok: false
    }));
    await expect(cargarLista('productos')).rejects.toThrow();
  });
  it('rechaza un JSON con estructura incorrecta', async () => {
    vi.spyOn(window, 'fetch').mockReturnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    }));
    await expect(cargarLista('productos')).rejects.toThrow();
  });
  it('usa el JSON inicial y luego la edición local', async () => {
    datosJSON();
    expect((await cargarProductos())[0].nombre).toBe(producto.nombre);
    await guardarProducto({
      ...producto,
      nombre: 'Casco editado'
    }, 1);
    expect((await cargarProductos())[0].nombre).toBe('Casco editado');
  });
  it('crea, impide código duplicado y elimina', async () => {
    datosJSON();
    await guardarProducto({
      ...producto,
      codigo: 'GUA002',
      nombre: 'Guantes'
    });
    expect((await cargarProductos()).length).toBe(2);
    await expect(guardarProducto(producto)).rejects.toThrow();
    await eliminarProducto(1);
    expect((await cargarProductos()).length).toBe(1);
  });
  it('permite guardar un catálogo vacío', async () => {
    datosJSON();
    await eliminarProducto(1);
    expect(await cargarProductos()).toEqual([]);
  });
  it('crea, normaliza, modifica y elimina cuentas', () => {
    guardarUsuario({
      correo: 'NUEVO@GMAIL.COM',
      contrasena: '12345',
      rol: 'cliente'
    });
    expect(obtenerUsuarios().at(-1).correo).toBe('nuevo@gmail.com');
    expect(() => guardarUsuario({
      correo: 'nuevo@gmail.com'
    })).toThrow();
    guardarUsuario({
      correo: 'cambio@gmail.com',
      rol: 'cliente'
    }, 'nuevo@gmail.com');
    expect(obtenerUsuarios().at(-1).correo).toBe('cambio@gmail.com');
    eliminarUsuario('cambio@gmail.com');
    expect(obtenerUsuarios().length).toBe(3);
  });
});
describe('Carrito: casos de error y stock', () => {
  it('descarta objetos JSON y entradas incompletas', () => {
    localStorage.setItem('carritoBikers', '{}');
    const a = renderHook(() => useCarrito(), {
      wrapper: CarritoProvider
    });
    expect(a.result.current.total).toBe(0);
    a.unmount();
    localStorage.setItem('carritoBikers', JSON.stringify([null, {}, {
      ...producto,
      cantidad: -1
    }]));
    const b = renderHook(() => useCarrito(), {
      wrapper: CarritoProvider
    });
    expect(b.result.current.carrito).toEqual([]);
  });
  it('rechaza cantidades fraccionarias, negativas y superiores al stock', () => {
    const {
      result
    } = renderHook(() => useCarrito(), {
      wrapper: CarritoProvider
    });
    act(() => result.current.agregar(producto, 1.5));
    expect(result.current.carrito).toEqual([]);
    act(() => result.current.agregar(producto, 4));
    expect(result.current.error).toContain('stock');
    act(() => result.current.agregar(producto, 2));
    act(() => result.current.agregar(producto, 2));
    expect(result.current.cantidadTotal).toBe(2);
    act(() => result.current.cambiarCantidad(1, 4));
    expect(result.current.cantidadTotal).toBe(2);
  });
  it('comunica almacenamiento bloqueado', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('sin permiso'); });
    const {
      result
    } = renderHook(() => useCarrito(), {
      wrapper: CarritoProvider
    });
    await waitFor(() => expect(result.current.error).toContain('guardar'));
  });
});
describe('Navegación, contenido y acceso', () => {
  it('permite saltar al contenido sin cambiar de ruta', () => {
    abrir('/login');
    fireEvent.click(screen.getByRole('link', { name: 'Saltar al contenido' }));
    expect(document.activeElement.id).toBe('contenido');
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
  });
  it('muestra presentación, módulos y pie de página', async () => {
    datosJSON();
    abrir();
    expect(await screen.findByText('Catálogo interactivo')).toBeTruthy();
    expect(screen.getByText('Víctor Salas')).toBeTruthy();
    expect(screen.getByAltText('Avatar ilustrado de perfil; no es una fotografía')).toBeTruthy();
    expect(screen.getByText('Zona Bikers - 2026')).toBeTruthy();
  });
  it('carga el equipo desde JSON', async () => {
    datosJSON();
    abrir('/nosotros');
    expect(await screen.findByText('Estudiante de desarrollo')).toBeTruthy();
    expect(screen.getByText('React')).toBeTruthy();
  });
  it('carga dos noticias y sus fechas', async () => {
    datosJSON();
    abrir('/noticias');
    expect(await screen.findByRole('heading', {
      name: 'Consejos de casco'
    })).toBeTruthy();
    expect(screen.getAllByText('2026-10-22').length).toBe(2);
    expect(screen.getByRole('link', {
      name: 'Leer artículo: Consejos de casco'
    })).toBeTruthy();
  });
  for (const [ruta, mensaje] of [['/nosotros', 'No se pudo cargar la información del equipo.'], ['/noticias', 'No se pudieron cargar las noticias.'], ['/', 'No se pudieron cargar los módulos del proyecto.']]) it(`informa error de red en ${ruta}`, async () => {
    vi.spyOn(window, 'fetch').mockReturnValue(Promise.reject(Error('sin red')));
    abrir(ruta);
    expect(await screen.findByText(mensaje)).toBeTruthy();
  });
  for (const [ruta, titulo] of [['/detalle-blog1', 'Cómo elegir un casco adecuado'], ['/detalle-blog2', '5 accesorios importantes para salir a la ruta'], ['/no-existe', 'Página no encontrada']]) it(`renderiza ${ruta}`, () => {
    abrir(ruta);
    expect(screen.getByRole('heading', {
      name: titulo
    })).toBeTruthy();
  });
  it('impide entrar al administrador sin sesión', () => {
    abrir('/admin');
    expect(screen.getByRole('heading', {
      name: 'Iniciar sesión'
    })).toBeTruthy();
  });
  it('muestra el panel y cierra sesión', () => {
    sesion();
    abrir('/admin');
    expect(screen.getByRole('heading', {
      name: 'Panel de administración'
    })).toBeTruthy();
    enviar('Cerrar sesión');
    expect(sessionStorage.getItem('usuario')).toBeNull();
    expect(screen.getByRole('heading', {
      name: 'Iniciar sesión'
    })).toBeTruthy();
  });
  it('limita la gestión de cuentas al administrador', async () => {
    datosJSON();
    sesion('vendedor');
    abrir('/admin-usuarios');
    expect(await screen.findByRole('heading', {
      name: 'Zona Bikers'
    })).toBeTruthy();
    expect(screen.queryByRole('heading', {
      name: 'Administración de usuarios'
    })).toBeNull();
  });
  it('abre y cierra el menú móvil mediante su botón', () => {
    abrir('/login');
    const boton = screen.getByRole('button', {
      name: 'Abrir o cerrar menú'
    });
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(boton);
    expect(boton.getAttribute('aria-expanded')).toBe('true');
  });
});
describe('Formularios públicos', () => {
  it('valida login vacío y rechaza credenciales incorrectas', () => {
    abrir('/login');
    enviar('Entrar');
    expect(screen.getByText('El correo es requerido.')).toBeTruthy();
    escribir('Correo', 'admin@duoc.cl');
    escribir('Contraseña', 'xxxx');
    enviar('Entrar');
    expect(screen.getByText('El correo o la contraseña son incorrectos.')).toBeTruthy();
  });
  it('inicia sesión como administrador', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    abrir('/login');
    escribir('Correo', 'ADMIN@DUOC.CL');
    escribir('Contraseña', '12345');
    enviar('Entrar');
    expect(screen.getByRole('heading', {
      name: 'Panel de administración'
    })).toBeTruthy();
  });
  it('registra una cuenta que puede iniciar sesión', async () => {
    datosJSON();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    abrir('/registro');
    escribir('RUN', '123456785');
    escribir('Nombre', 'Ana');
    escribir('Apellidos', 'Soto');
    escribir('Correo', 'ana@gmail.com');
    escribir('Contraseña', '12345');
    escribir('Dirección', 'Calle 1');
    escribir('Región', 'Región Metropolitana');
    escribir('Comuna', 'Santiago');
    escribir('Región', 'Región de Valparaíso');
    expect(screen.getByLabelText('Comuna').value).toBe('');
    enviar('Registrarme');
    expect(obtenerUsuarios().find(u => u.correo === 'ana@gmail.com')).toBeTruthy();
    cleanup();
    abrir('/login');
    escribir('Correo', 'ana@gmail.com');
    escribir('Contraseña', '12345');
    enviar('Entrar');
    expect(await screen.findByRole('heading', {
      name: 'Zona Bikers'
    })).toBeTruthy();
  });
  it('no registra campos vacíos ni un correo repetido', () => {
    abrir('/registro');
    enviar('Registrarme');
    expect(screen.getByText('El RUN es requerido.')).toBeTruthy();
    escribir('RUN', '123456785');
    escribir('Nombre', 'Ana');
    escribir('Apellidos', 'Soto');
    escribir('Correo', 'admin@duoc.cl');
    escribir('Contraseña', '12345');
    escribir('Dirección', 'Calle 1');
    enviar('Registrarme');
    expect(screen.getByText('Ya existe una cuenta con ese correo.')).toBeTruthy();
  });
  it('valida y limpia el contacto explicando su alcance', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    abrir('/contacto');
    enviar('Enviar mensaje');
    expect(screen.getByText('El comentario es requerido.')).toBeTruthy();
    escribir('Nombre', 'Ana');
    escribir('Correo electrónico', 'ana@example.com');
    escribir('Comentario', 'Consulta');
    enviar('Enviar mensaje');
    expect(screen.getByText(/Solo se permiten correos/)).toBeTruthy();
    escribir('Correo electrónico', 'ana@gmail.com');
    enviar('Enviar mensaje');
    expect(window.alert).toHaveBeenCalledWith('Mensaje validado. Esta demostración no envía correos.');
    expect(screen.getByLabelText('Nombre').value).toBe('');
  });
});
describe('Detalle y pantalla del carrito', () => {
  it('agrega desde detalle, impide exceder stock y valida cantidades', async () => {
    datosJSON();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    abrir('/detalle-producto?id=1');
    expect(await screen.findByRole('heading', {
      name: producto.nombre
    })).toBeTruthy();
    escribir('Cantidad', '0');
    enviar('Agregar al carrito');
    expect(window.alert).toHaveBeenCalledWith('La cantidad debe ser al menos 1.');
    escribir('Cantidad', '2');
    enviar('Agregar al carrito');
    expect(JSON.parse(localStorage.getItem('carritoBikers'))[0].cantidad).toBe(2);
    enviar('Agregar al carrito');
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
  it('informa un fallo de carga del detalle', async () => {
    vi.spyOn(window, 'fetch').mockReturnValue(Promise.reject(Error()));
    abrir('/detalle-producto?id=1');
    expect(await screen.findByText('No se pudo cargar el producto.')).toBeTruthy();
  });
  it('renderiza relacionados y fallback de id', async () => {
    vi.spyOn(window, 'fetch').mockReturnValue(Promise.resolve({
      json: () => Promise.resolve([producto, {
        ...producto,
        id: 2,
        nombre: 'Guantes'
      }])
    }));
    abrir('/detalle-producto?id=999');
    expect(await screen.findByRole('heading', {
      name: 'Guantes'
    })).toBeTruthy();
  });
  it('modifica, cancela vaciado, elimina y finaliza compra simulada', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.setItem('carritoBikers', JSON.stringify([{
      ...producto,
      cantidad: 2
    }]));
    abrir('/carrito');
    escribir('Cantidad', '3');
    expect(screen.getByText('$30.000')).toBeTruthy();
    enviar('Vaciar carrito');
    expect(screen.queryByText('Tu carrito está vacío.')).toBeNull();
    enviar('Finalizar compra');
    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('carritoBikers'))[0].cantidad).toBe(3);
  });
  it('confirma vaciado y elimina un producto', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem('carritoBikers', JSON.stringify([{
      ...producto,
      cantidad: 1
    }]));
    abrir('/carrito');
    enviar('Vaciar carrito');
    expect(screen.getByText('Tu carrito está vacío.')).toBeTruthy();
    cleanup();
    localStorage.setItem('carritoBikers', JSON.stringify([{
      ...producto,
      cantidad: 1
    }]));
    abrir('/carrito');
    enviar('Eliminar');
    expect(screen.getByText('Tu carrito está vacío.')).toBeTruthy();
  });
});
describe('Administración persistente', () => {
  beforeEach(() => {
    sesion();
    datosJSON();
  });
  it('lista, cancela y confirma la eliminación de un producto', async () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    abrir('/admin-productos');
    await screen.findByText(producto.nombre);
    enviar('Eliminar ' + producto.nombre);
    expect(screen.getByText(producto.nombre)).toBeTruthy();
    enviar('Eliminar ' + producto.nombre);
    await waitFor(() => {
      if (screen.queryByText(producto.nombre)) throw Error('Aún no se eliminó');
    });
    expect(await cargarProductos()).toEqual([]);
  });
  it('crea un producto y lo muestra en el catálogo', async () => {
    abrir('/admin-nuevo-producto');
    enviar('Guardar producto');
    expect(screen.getByText('Ingresa un precio válido.')).toBeTruthy();
    escribir('Código', 'GUA002');
    escribir('Nombre', 'Guantes nuevos');
    escribir('Descripción', 'Protección para manos');
    escribir('Precio', '25000');
    escribir('Stock', '5');
    escribir('URL de imagen', 'archivo.exe');
    enviar('Guardar producto');
    expect(screen.getByText('Usa una dirección http o https, o una imagen local.')).toBeTruthy();
    escribir('URL de imagen', '');
    enviar('Guardar producto');
    expect(await screen.findByText('Guantes nuevos')).toBeTruthy();
    expect((await cargarProductos()).length).toBe(2);
  });
  it('edita un producto existente', async () => {
    abrir('/admin-nuevo-producto?id=1');
    await screen.findByLabelText('Nombre');
    escribir('Nombre', 'Casco actualizado');
    enviar('Guardar producto');
    expect(await screen.findByText('Casco actualizado')).toBeTruthy();
    expect((await cargarProductos())[0].nombre).toBe('Casco actualizado');
  });
  it('informa id de producto inexistente', async () => {
    abrir('/admin-nuevo-producto?id=999');
    expect(await screen.findByText('Producto no encontrado.')).toBeTruthy();
  });
  it('crea una cuenta y vuelve al listado', async () => {
    abrir('/admin-nuevo-usuario');
    enviar('Guardar usuario');
    expect(screen.getByText('El nombre es requerido.')).toBeTruthy();
    escribir('Nombre', 'Persona de prueba');
    escribir('Correo', 'persona@gmail.com');
    escribir('Contraseña', '12345');
    escribir('Rol', 'vendedor');
    enviar('Guardar usuario');
    expect(await screen.findByText('persona@gmail.com')).toBeTruthy();
    expect(obtenerUsuarios().at(-1).rol).toBe('vendedor');
  });
  it('edita una cuenta y elimina con confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    abrir('/admin-nuevo-usuario?correo=cliente%40gmail.com');
    escribir('Nombre', 'Cliente actualizado');
    enviar('Guardar usuario');
    expect(await screen.findByText('Cliente actualizado')).toBeTruthy();
    enviar('Eliminar cliente@gmail.com');
    expect(screen.getByText('Cliente actualizado')).toBeTruthy();
    enviar('Eliminar cliente@gmail.com');
    expect(screen.queryByText('Cliente actualizado')).toBeNull();
  });
  it('impide correos duplicados', () => {
    abrir('/admin-nuevo-usuario');
    escribir('Nombre', 'Otra persona');
    escribir('Correo', 'admin@duoc.cl');
    escribir('Contraseña', '12345');
    enviar('Guardar usuario');
    expect(screen.getByText('Ya existe una cuenta con ese correo.')).toBeTruthy();
  });
  it('informa usuario inexistente', () => {
    abrir('/admin-nuevo-usuario?correo=nadie');
    expect(screen.getByText('Usuario no encontrado.')).toBeTruthy();
  });
});
