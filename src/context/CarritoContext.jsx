import { createContext, useContext, useEffect, useState } from 'react';
import { leerLista } from '../utils/almacenamiento';
import { precioVigente } from '../utils/precios';
const CarritoContext = createContext(null);
/** Recupera solo productos de estructura válida, sin cantidades negativas. */
function leerCarrito() {
  return leerLista('carritoBikers').filter(p => p && Number.isInteger(p.id) && typeof p.nombre === 'string' && Number.isFinite(p.precio) && p.precio >= 0 && Number.isInteger(p.cantidad) && p.cantidad > 0);
}
/** Estado compartido del carrito, persistente y con control de cantidades y stock. */
export function CarritoProvider({
  children
}) {
  const [carrito, setCarrito] = useState(leerCarrito);
  const [error, setError] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem('carritoBikers', JSON.stringify(carrito));
    } catch {
      // El fallo del sistema externo debe ser visible; no es un estado derivado del render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('No se pudo guardar el carrito en este navegador.');
    }
  }, [carrito]);
  const agregar = (producto, cantidad = 1) => {
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setError('La cantidad debe ser un número entero mayor que cero.');
      return false;
    }
    const limite = Number.isInteger(producto.stock) ? producto.stock : Number.MAX_SAFE_INTEGER;
    if ((carrito.find(p => p.id === producto.id)?.cantidad || 0) + cantidad > limite) {
      setError('La cantidad solicitada supera el stock disponible.');
      return false;
    }
    setError('');
    setCarrito(actual => {
      const existe = actual.find(p => p.id === producto.id);
      if ((existe?.cantidad || 0) + cantidad > limite) return actual;
      return existe ? actual.map(p => p.id === producto.id ? {
        ...p,
        precio: producto.precio,
        precioOferta: producto.precioOferta ?? null,
        cantidad: p.cantidad + cantidad,
        stock: limite
      } : p) : [...actual, {
        ...producto,
        cantidad,
        stock: limite
      }];
    });
    return true;
  };
  const cambiarCantidad = (id, cantidad) => {
    if (!Number.isInteger(cantidad) || cantidad < 1) return;
    const producto = carrito.find(p => p.id === id);
    if (producto && cantidad > producto.stock) {
      setError('La cantidad solicitada supera el stock disponible.');
      return;
    }
    setError('');
    setCarrito(actual => actual.map(p => p.id === id ? {
      ...p,
      cantidad
    } : p));
  };
  const eliminar = id => {
    setError('');
    setCarrito(actual => actual.filter(p => p.id !== id));
  };
  const vaciar = () => {
    setError('');
    setCarrito([]);
  };
  const total = carrito.reduce((suma, p) => suma + precioVigente(p) * p.cantidad, 0);
  const cantidadTotal = carrito.reduce((suma, p) => suma + p.cantidad, 0);
  return <CarritoContext.Provider value={{
    carrito,
    agregar,
    cambiarCantidad,
    eliminar,
    vaciar,
    total,
    cantidadTotal,
    error
  }}>{children}</CarritoContext.Provider>;
}
/** Accede al carrito desde un componente descendiente del proveedor. */
// eslint-disable-next-line react-refresh/only-export-components
export function useCarrito() {
  return useContext(CarritoContext);
}
