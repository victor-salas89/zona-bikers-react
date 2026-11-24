import { useState } from 'react';
import { leerLista } from '../utils/almacenamiento';
import { cargarProductos, guardarProducto } from '../utils/catalogo';
import { obtenerUsuarios, guardarUsuario } from '../utils/cuentas';
import { categoriaProducto } from '../utils/categorias';

/** Importación deliberada, solo visible dentro del panel de administrador. */
export default function MigracionLocal() {
  const [password, setPassword] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [resultado, setResultado] = useState('');
  const productos = leerLista('productosBikers');
  const usuarios = leerLista('usuariosBikers');
  async function importar() {
    setOcupado(true);
    const mensajes = [];
    try {
      const existentes = await cargarProductos();
      const cuentas = await obtenerUsuarios();
      const productosPendientes = [...productos];
      const usuariosPendientes = [...usuarios];
      for (const p of productos) {
        try {
          if (existentes.some(e => e.codigo === p.codigo)) { mensajes.push(`Producto ${p.codigo}: ya existe; revisa la edición manualmente.`); continue; }
          const creado = await guardarProducto({ ...p, categoria: categoriaProducto(p) });
          existentes.push(creado);
          productosPendientes.splice(productosPendientes.indexOf(p), 1);
          localStorage.setItem('productosBikers', JSON.stringify(productosPendientes));
          mensajes.push(`Producto ${p.codigo}: importado.`);
        } catch (e) { mensajes.push(`Producto ${p.codigo}: ${e.message}`); }
      }
      for (const u of usuarios) {
        try {
          if (cuentas.some(e => e.correo === u.correo?.trim().toLowerCase())) { mensajes.push(`Cuenta ${u.correo}: ya existe; no se modifica.`); continue; }
          if (password.length < 8) { mensajes.push(`Cuenta ${u.correo}: ingresa una nueva contraseña de al menos 8 caracteres.`); continue; }
          const creada = await guardarUsuario({ ...u, nombre: u.nombre || 'Usuario importado', contrasena: password });
          cuentas.push(creada);
          usuariosPendientes.splice(usuariosPendientes.indexOf(u), 1);
          localStorage.setItem('usuariosBikers', JSON.stringify(usuariosPendientes));
          mensajes.push(`Cuenta ${u.correo}: importada con la nueva contraseña.`);
        } catch (e) { mensajes.push(`Cuenta ${u.correo}: ${e.message}`); }
      }
      setResultado(mensajes.join('\n'));
    } catch (e) { setResultado(e.message); }
    finally { setPassword(''); setOcupado(false); }
  }
  if (!productos.length && !usuarios.length && !resultado) return null;
  return <section className="my-4"><h2>Importar datos de este navegador</h2>
    <p>Hay {productos.length} productos y {usuarios.length} cuentas locales pendientes. Los códigos y correos existentes se conservan sin cambios. Cada registro importado se retira del almacenamiento antiguo.</p>
    <p>Las cuentas importadas usarán la contraseña nueva que indiques; reemplázala individualmente desde Usuarios. Las contraseñas antiguas no se envían.</p>
    <label htmlFor="passwordMigracion">Nueva contraseña para las cuentas importadas</label>
    <input id="passwordMigracion" className="form-control mb-2" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
    <button className="btn btn-outline-primary" disabled={ocupado} onClick={importar}>Importar registros pendientes</button>
    {resultado && <p role="status" style={{ whiteSpace: 'pre-line' }}>{resultado}</p>}
  </section>;
}
