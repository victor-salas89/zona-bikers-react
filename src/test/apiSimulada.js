import { vi } from 'vitest';
import { guardarSesion, leerSesion } from '../utils/sesion';
// Dobles HTTP para pruebas de UI. La seguridad y transacciones se prueban contra Spring real.
export function sesionPrueba(rol = 'administrador', perfil = {}) {
  guardarSesion({ token: 'token-simulado', expira: new Date(Date.now() + 3600000).toISOString(), usuario: { id: 1, correo: 'admin@duoc.cl', rol, ...perfil } });
}
export function simularApi(iniciales = [], estaticos = {}) {
  const estado = {
    productos: structuredClone(iniciales), pedidos: [],
    usuarios: [
      { id: 1, correo: 'admin@duoc.cl', nombre: 'Admin', contrasena: 'Prueba123', rol: 'administrador' },
      { id: 2, correo: 'vende@profesor.duoc.cl', nombre: 'Vendedor', contrasena: 'Prueba123', rol: 'vendedor' },
      { id: 3, correo: 'cliente@gmail.com', nombre: 'Cliente', contrasena: 'Prueba123', rol: 'cliente' },
    ],
  };
  const respuesta = (datos, status = 200) => ({ ok: status < 400, status, json: async () => structuredClone(datos) });
  const fallo = (message, status = 400) => respuesta({ message }, status);
  const sinClave = u => { const copia = { ...u }; delete copia.contrasena; return copia; };
  const handler = async (url, options = {}) => {
    const path = new URL(url, location.origin).pathname;
    const metodo = options.method || 'GET';
    const d = options.body ? JSON.parse(options.body) : {};
    if (!path.startsWith('/api/')) return respuesta(estaticos[path.split('/').at(-1).replace('.json', '')] || iniciales);
    if (path === '/api/auth/me') return respuesta(leerSesion()?.usuario);
    if (path === '/api/auth/logout') return respuesta(null, 204);
    if (path === '/api/auth/login') {
      const u = estado.usuarios.find(u => u.correo === d.correo && u.contrasena === d.contrasena);
      return u ? respuesta({ token: 'token-simulado', expira: new Date(Date.now() + 3600000).toISOString(), usuario: sinClave(u) }) : fallo('El correo o la contraseña son incorrectos.', 401);
    }
    if (path.startsWith('/api/usuarios') || path === '/api/auth/registro') {
      const id = Number(path.split('/').at(-1));
      const u = estado.usuarios.find(u => u.id === id);
      if (metodo === 'GET') return path === '/api/usuarios' ? respuesta(estado.usuarios.map(sinClave)) : u ? respuesta(sinClave(u)) : fallo('Usuario no encontrado.', 404);
      if (metodo === 'DELETE') { estado.usuarios = estado.usuarios.filter(u => u.id !== id); return respuesta(null, 204); }
      const correo = d.correo.trim().toLowerCase();
      if (estado.usuarios.some(u => u.correo === correo && u.id !== id)) return fallo('Ya existe una cuenta con ese correo.', 409);
      const nuevo = { ...u, ...d, correo, id: id || Math.max(0, ...estado.usuarios.map(u => u.id)) + 1 };
      estado.usuarios = id ? estado.usuarios.map(u => u.id === id ? nuevo : u) : [...estado.usuarios, nuevo];
      return respuesta(sinClave(nuevo), id ? 200 : 201);
    }
    if (path.startsWith('/api/productos')) {
      const id = Number(path.split('/').at(-1));
      if (metodo === 'GET') return respuesta(estado.productos);
      if (metodo === 'DELETE') { estado.productos = estado.productos.filter(p => p.id !== id); return respuesta(null, 204); }
      if (estado.productos.some(p => p.codigo === d.codigo && p.id !== id)) return fallo('Código duplicado.', 409);
      const nuevo = { ...d, id: id || Math.max(0, ...estado.productos.map(p => p.id)) + 1 };
      estado.productos = id ? estado.productos.map(p => p.id === id ? nuevo : p) : [...estado.productos, nuevo];
      return respuesta(nuevo, id ? 200 : 201);
    }
    if (path.startsWith('/api/pedidos')) {
      if (metodo === 'GET') { const p = estado.pedidos.find(p => p.id === path.split('/').at(-1)); return p ? respuesta(p) : fallo('Pedido no disponible.', 404); }
      const productos = d.productos.map(l => { const p = estado.productos.find(p => p.id === l.id); return { id: p.id, nombre: p.nombre, precio: p.precioOferta || p.precio, cantidad: l.cantidad }; });
      const subtotal = productos.reduce((s, p) => s + p.precio * p.cantidad, 0);
      const costoEntrega = d.comprador.entrega === 'domicilio' ? 3990 : 0;
      const p = { ...d, id: crypto.randomUUID(), productos, subtotal, costoEntrega, total: subtotal + costoEntrega };
      estado.pedidos.push(p); return respuesta(p, 201);
    }
    return fallo('Ruta no simulada: ' + path, 404);
  };
  const fetch = vi.spyOn(window, 'fetch').mockImplementation(handler);
  return { estado, fetch, handler };
}
