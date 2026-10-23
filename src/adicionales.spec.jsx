import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { CarritoProvider } from './context/CarritoContext';

function abrir(ruta) {
  sessionStorage.setItem('usuario', JSON.stringify({ correo: 'admin@duoc.cl', rol: 'administrador' }));
  return render(<MemoryRouter initialEntries={[ruta]}><CarritoProvider><App /></CarritoProvider></MemoryRouter>);
}
function cambiar(nombre, value) { fireEvent.change(screen.getByLabelText(nombre), { target: { value } }); }

describe('Validaciones administrativas adicionales', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
  afterEach(cleanup);
  it('informa catálogo vacío en vez de permanecer cargando', async () => {
    vi.spyOn(window, 'fetch').mockReturnValue(Promise.resolve({ok:true,json:()=>Promise.resolve([])}));
    abrir('/detalle-producto?id=1');
    expect(await screen.findByText('No hay productos disponibles.')).toBeTruthy();
  });
  it('expone y cambia el estado del menú administrativo', () => {
    abrir('/admin');
    const boton = screen.getByRole('button', {name:'Abrir o cerrar menú de administración'});
    expect(boton.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(boton);
    expect(boton.getAttribute('aria-expanded')).toBe('true');
  });
  it('conserva región y comuna y rechaza RUN incorrecto', () => {
    abrir('/admin-nuevo-usuario');
    cambiar('Nombre', 'Ana'); cambiar('Correo', 'ana@gmail.com'); cambiar('Contraseña', '12345');
    cambiar('RUN (opcional)', '123456784');
    cambiar('Región', 'Región Metropolitana'); cambiar('Comuna', 'Santiago');
    cambiar('Región', 'Región de Valparaíso');
    expect(screen.getByLabelText('Comuna').value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }));
    expect(screen.getByText('El RUN ingresado no es válido.')).toBeTruthy();
  });
  it('rechaza stock crítico negativo y avisa cuando el stock es bajo', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'fetch').mockReturnValue(Promise.resolve({ok:true,json:()=>Promise.resolve([])}));
    abrir('/admin-nuevo-producto');
    cambiar('Código','NUE001'); cambiar('Nombre','Producto nuevo'); cambiar('Descripción','Descripción de prueba');
    cambiar('Precio','12000'); cambiar('Stock','2'); cambiar('Stock crítico (opcional)','-1');
    fireEvent.click(screen.getByRole('button',{name:'Guardar producto'}));
    expect(screen.getByText('El stock crítico debe ser un entero de cero o más.')).toBeTruthy();
    cambiar('Stock crítico (opcional)','3');
    fireEvent.click(screen.getByRole('button',{name:'Guardar producto'}));
    expect(await screen.findByText('Producto nuevo')).toBeTruthy();
    expect(window.alert).toHaveBeenCalledWith('Producto guardado con stock igual o inferior al stock crítico.');
  });
});
